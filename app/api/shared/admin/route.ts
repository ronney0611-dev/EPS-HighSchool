import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";
import SharedComment from "@/app/models/Sharedcomment";
import SharedLike from "@/app/models/Sharedlike";
import SharedReport from "@/app/models/Sharedreport";
import SharedBan from "@/app/models/Sharedban";
import { isObjectId, isAdminEmail, authorNameOf } from "@/app/lib/sharedUtils";

async function admin() {
    const session = await getServerSession(authOptions);
    const s = session as { user?: { id?: string; email?: string | null } } | null;
    return s?.user?.id && isAdminEmail(s.user.email) ? s.user.id : null;
}

export async function GET() {
    try {
        if (!(await admin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        await connectDB();

        const [items, comments, bans] = await Promise.all([
            SharedItem.find({ $or: [{ reports: { $gt: 0 } }, { hidden: true }] })
                .sort({ hidden: -1, reports: -1 }).limit(100)
                .select("authorId authorName type title reports hidden createdAt").lean(),
            SharedComment.find({ $or: [{ reports: { $gt: 0 } }, { hidden: true }] })
                .sort({ hidden: -1, reports: -1 }).limit(200)
                .select("itemId userId authorName text reports hidden createdAt").lean(),
            SharedBan.find().sort({ createdAt: -1 }).limit(200).lean(),
        ]);
        const banned = await Promise.all(bans.map(async (b) => ({ userId: String(b.userId), name: await authorNameOf(String(b.userId)), createdAt: b.createdAt })));

        return NextResponse.json(JSON.parse(JSON.stringify({ items, comments, banned })));
    } catch (error: unknown) {
        console.error("shared admin GET:", error);
        return NextResponse.json({ error: "خطأ في التحميل" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        if (!(await admin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
        const b = await request.json().catch(() => ({}));
        await connectDB();

        if (b?.action === "ban" || b?.action === "unban") {
            if (!isObjectId(b.userId)) return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
            if (b.action === "ban") await SharedBan.updateOne({ userId: b.userId }, { $setOnInsert: { userId: b.userId, reason: "" } }, { upsert: true });
            else await SharedBan.deleteOne({ userId: b.userId });
            return NextResponse.json({ ok: true });
        }

        const { action, type, id } = b ?? {};
        if (!["hide", "restore", "delete"].includes(action) || (type !== "item" && type !== "comment") || !isObjectId(id)) {
            return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
        }

        if (type === "item") {
            if (action === "delete") {
                await Promise.all([
                    SharedItem.deleteOne({ _id: id }),
                    SharedComment.deleteMany({ itemId: id }),
                    SharedLike.deleteMany({ itemId: id }),
                    SharedReport.deleteMany({ targetType: "item", targetId: id }),
                ]);
            } else {
                await SharedItem.updateOne({ _id: id }, action === "hide" ? { $set: { hidden: true } } : { $set: { hidden: false, reports: 0 } });
                if (action === "restore") await SharedReport.deleteMany({ targetType: "item", targetId: id });
            }
            return NextResponse.json({ ok: true });
        }

        // comment: keep the item's comments counter right
        const c = await SharedComment.findById(id).select("itemId hidden").lean();
        if (!c) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
        if (action === "delete") {
            const visible = await SharedComment.countDocuments({ $or: [{ _id: id }, { parentId: id }], hidden: false });
            await SharedComment.deleteMany({ $or: [{ _id: id }, { parentId: id }] });
            await SharedReport.deleteMany({ targetType: "comment", targetId: id });
            if (visible) await SharedItem.updateOne({ _id: c.itemId, comments: { $gte: visible } }, { $inc: { comments: -visible } });
        } else if (action === "hide" && !c.hidden) {
            await SharedComment.updateOne({ _id: id }, { $set: { hidden: true } });
            await SharedItem.updateOne({ _id: c.itemId, comments: { $gt: 0 } }, { $inc: { comments: -1 } });
        } else if (action === "restore") {
            await SharedComment.updateOne({ _id: id }, { $set: { hidden: false, reports: 0 } });
            await SharedReport.deleteMany({ targetType: "comment", targetId: id });
            if (c.hidden) await SharedItem.updateOne({ _id: c.itemId }, { $inc: { comments: 1 } });
        }
        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        console.error("shared admin PATCH:", error);
        return NextResponse.json({ error: "خطأ، حاول مرة أخرى" }, { status: 500 });
    }
}
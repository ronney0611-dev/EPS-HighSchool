import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";
import SharedComment from "@/app/models/Sharedcomment";
import { isObjectId } from "@/app/lib/sharedUtils";

export async function DELETE(_request: Request, { params }: { params: Promise<{ cid: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        const userId = session.user.id;

        const { cid } = await params;
        if (!isObjectId(cid)) return NextResponse.json({ error: "التعليق غير موجود" }, { status: 404 });

        await connectDB();
        const c = await SharedComment.findById(cid).select("itemId userId").lean();
        if (!c) return NextResponse.json({ error: "التعليق غير موجود" }, { status: 404 });

        const item = await SharedItem.findById(c.itemId).select("authorId").lean();
        const allowed = String(c.userId) === userId || (!!item && String(item.authorId) === userId);
        if (!allowed) return NextResponse.json({ error: "لا يمكنك حذف هذا التعليق" }, { status: 403 });

        const filter = { $or: [{ _id: cid }, { parentId: cid }] };
        const visible = await SharedComment.countDocuments({ ...filter, hidden: false });
        await SharedComment.deleteMany(filter);
        if (visible > 0) {
            await SharedItem.updateOne({ _id: c.itemId, comments: { $gte: visible } }, { $inc: { comments: -visible } });
        }
        return NextResponse.json({ ok: true, removed: visible });
    } catch (error: unknown) {
        console.error("comment DELETE:", error);
        return NextResponse.json({ error: "خطأ أثناء الحذف، حاول مرة أخرى" }, { status: 500 });
    }
}
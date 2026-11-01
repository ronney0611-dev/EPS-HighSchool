import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";
import SharedLike from "@/app/models/Sharedlike";
import { isObjectId } from "@/app/lib/sharedUtils";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        const userId = session.user.id;

        const { id } = await params;
        if (!isObjectId(id)) return NextResponse.json({ error: "المشاركة غير موجودة" }, { status: 404 });
        const body = await request.json().catch(() => ({}));
        const kind = body?.kind;
        if (kind !== "useful" && kind !== "tried") return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });

        await connectDB();
        const item = await SharedItem.findOne({ _id: id, published: true, hidden: false }).select("authorId").lean();
        if (!item) return NextResponse.json({ error: "المشاركة غير موجودة أو تم حذفها" }, { status: 404 });
        if (String(item.authorId) === userId) {
            return NextResponse.json({ error: "لا يمكنك تقييم مشاركتك" }, { status: 400 });
        }

        // already liked -> remove, else add (the unique index stops a double count)
        const removed = await SharedLike.deleteOne({ itemId: id, userId, kind });
        let active: boolean;
        if (removed.deletedCount === 1) {
            await SharedItem.updateOne({ _id: id, [kind]: { $gt: 0 } }, { $inc: { [kind]: -1 } });
            active = false;
        } else {
            try {
                await SharedLike.create({ itemId: id, userId, kind });
                await SharedItem.updateOne({ _id: id }, { $inc: { [kind]: 1 } });
            } catch (e) {
                if ((e as { code?: number })?.code !== 11000) throw e; // double click: already counted
            }
            active = true;
        }

        const counts = await SharedItem.findById(id).select("useful tried").lean();
        return NextResponse.json({ active, useful: counts?.useful ?? 0, tried: counts?.tried ?? 0 });
    } catch (error: unknown) {
        console.error("shared like:", error);
        return NextResponse.json({ error: "خطأ، حاول مرة أخرى" }, { status: 500 });
    }
}
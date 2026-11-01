import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";
import SharedLike from "@/app/models/Sharedlike";
import { isObjectId } from "@/app/lib/sharedUtils";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const userId = session.user.id;

    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: "المشاركة غير موجودة" }, { status: 404 });

    await connectDB();
    const item = await SharedItem.findOne({ _id: id, published: true, hidden: false }).select("authorId copies").lean();
    if (!item) return NextResponse.json({ error: "المشاركة غير موجودة أو تم حذفها" }, { status: 404 });
    if (String(item.authorId) === userId) return NextResponse.json({ copies: item.copies, counted: false });

    const res = await SharedLike.updateOne(
      { itemId: id, userId, kind: "copy" },
      { $setOnInsert: { itemId: id, userId, kind: "copy" } },
      { upsert: true }
    );
    if (res.upsertedCount === 0) return NextResponse.json({ copies: item.copies, counted: false });

    const updated = await SharedItem.findByIdAndUpdate(id, { $inc: { copies: 1 } }, { new: true }).select("copies").lean();
    return NextResponse.json({ copies: updated?.copies ?? item.copies + 1, counted: true });
  } catch (error: unknown) {
    // two clicks at the same time: the unique index refuses the second one -> not counted twice
    if ((error as { code?: number })?.code === 11000) return NextResponse.json({ counted: false });
    console.error("shared copy:", error);
    return NextResponse.json({ error: "خطأ أثناء النسخ، حاول مرة أخرى" }, { status: 500 });
  }
}
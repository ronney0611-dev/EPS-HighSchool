import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";
import SharedComment from "@/app/models/Sharedcomment";
import SharedReport from "@/app/models/Sharedreport";
import { isObjectId, REPORTS_TO_HIDE } from "@/app/lib/sharedUtils";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const userId = session.user.id;

    const body = await request.json().catch(() => ({}));
    const type = body?.type;
    const id = body?.id;
    if ((type !== "comment" && type !== "item") || !isObjectId(id)) {
      return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
    }

    await connectDB();
    const target = type === "comment"
      ? await SharedComment.findById(id).select("userId itemId hidden").lean()
      : await SharedItem.findById(id).select("authorId hidden").lean();
    if (!target) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

    const ownerId = type === "comment" ? (target as { userId: unknown }).userId : (target as { authorId: unknown }).authorId;
    if (String(ownerId) === userId) return NextResponse.json({ error: "لا يمكنك الإبلاغ عن محتواك" }, { status: 400 });

    try {
      await SharedReport.create({ targetType: type, targetId: id, userId });
    } catch (e) {
      if ((e as { code?: number })?.code === 11000) return NextResponse.json({ ok: true, already: true });
      throw e;
    }

    if (type === "comment") {
      const c = await SharedComment.findByIdAndUpdate(id, { $inc: { reports: 1 } }, { new: true }).select("reports hidden itemId").lean();
      if (c && !c.hidden && c.reports >= REPORTS_TO_HIDE) {
        const r = await SharedComment.updateOne({ _id: id, hidden: false }, { $set: { hidden: true } });
        if (r.modifiedCount === 1) await SharedItem.updateOne({ _id: c.itemId, comments: { $gt: 0 } }, { $inc: { comments: -1 } });
      }
    } else {
      const it = await SharedItem.findByIdAndUpdate(id, { $inc: { reports: 1 } }, { new: true }).select("reports hidden").lean();
      if (it && !it.hidden && it.reports >= REPORTS_TO_HIDE) {
        await SharedItem.updateOne({ _id: id }, { $set: { hidden: true } });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("shared report:", error);
    return NextResponse.json({ error: "خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}
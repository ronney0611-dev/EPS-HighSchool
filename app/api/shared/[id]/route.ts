import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";
import SharedLike from "@/app/models/Sharedlike";
import { isObjectId } from "@/app/lib/sharedUtils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: "المشاركة غير موجودة" }, { status: 404 });

    await connectDB();
    const item = await SharedItem.findById(id).lean();
    const mine = !!item && String(item.authorId) === session.user.id;
    // unpublished or hidden: only its author can still open it
    if (!item || ((!item.published || item.hidden) && !mine)) {
      return NextResponse.json({ error: "المشاركة غير موجودة أو تم حذفها" }, { status: 404 });
    }

    // what this teacher already pressed (مفيد / جربتها)
    const likes = await SharedLike.find({ itemId: id, userId: session.user.id, kind: { $in: ["useful", "tried"] } }).select("kind").lean();
    const liked = { useful: likes.some((l) => l.kind === "useful"), tried: likes.some((l) => l.kind === "tried") };

    const { authorId: _a, sourceId: _s, ...rest } = item;
    return NextResponse.json({ item: JSON.parse(JSON.stringify(rest)), mine, liked });
  } catch (error: unknown) {
    console.error("shared GET one:", error);
    return NextResponse.json({ error: "خطأ في تحميل المشاركة" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: "المشاركة غير موجودة" }, { status: 404 });
    const body = await request.json().catch(() => ({}));
    if (typeof body?.published !== "boolean") return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });

    await connectDB();
    const item = await SharedItem.findOne({ _id: id, authorId: session.user.id }).select("hidden").lean();
    if (!item) return NextResponse.json({ error: "المشاركة غير موجودة" }, { status: 404 });
    if (body.published && item.hidden) {
      return NextResponse.json({ error: "هذه المشاركة موقوفة من طرف الإدارة" }, { status: 403 });
    }
    await SharedItem.updateOne({ _id: id }, { $set: { published: body.published } });
    return NextResponse.json({ ok: true, published: body.published });
  } catch (error: unknown) {
    console.error("shared PATCH:", error);
    return NextResponse.json({ error: "خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}
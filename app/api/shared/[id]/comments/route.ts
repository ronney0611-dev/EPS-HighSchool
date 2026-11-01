import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";
import SharedComment, { COMMENT_MAX } from "@/app/models/Sharedcomment";
import { isObjectId, authorNameOf, isBanned } from "@/app/lib/sharedUtils";
import { hasBadWords } from "@/app/lib/badWords";

const WAIT_MS = 5000; // 5 seconds between 2 comments of the same teacher

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const userId = session.user.id;

    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: "المشاركة غير موجودة" }, { status: 404 });

    await connectDB();
    const item = await SharedItem.findById(id).select("authorId").lean();
    if (!item) return NextResponse.json({ error: "المشاركة غير موجودة" }, { status: 404 });
    const isItemAuthor = String(item.authorId) === userId;

    const docs = await SharedComment.find({ itemId: id, hidden: false })
      .sort({ createdAt: -1 })
      .limit(300)
      .select("userId authorName text parentId createdAt")
      .lean();

    const comments = docs.map((c) => ({
      _id: String(c._id),
      authorName: c.authorName,
      text: c.text,
      parentId: c.parentId ? String(c.parentId) : null,
      createdAt: c.createdAt,
      isAuthor: String(c.userId) === String(item.authorId), // "صاحب المشاركة" badge
      mine: String(c.userId) === userId,
      canDelete: String(c.userId) === userId || isItemAuthor,
    }));
    return NextResponse.json({ comments });
  } catch (error: unknown) {
    console.error("comments GET:", error);
    return NextResponse.json({ error: "خطأ في تحميل التعليقات" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const userId = session.user.id;

    const { id } = await params;
    if (!isObjectId(id)) return NextResponse.json({ error: "المشاركة غير موجودة" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) return NextResponse.json({ error: "اكتب تعليقا أولا" }, { status: 400 });
    if (text.length > COMMENT_MAX) return NextResponse.json({ error: `التعليق طويل جدا (${COMMENT_MAX} حرف كحد أقصى)` }, { status: 400 });
    if (hasBadWords(text)) return NextResponse.json({ error: "يحتوي التعليق على كلمات غير مسموح بها" }, { status: 400 });

    await connectDB();
    if (await isBanned(userId)) return NextResponse.json({ error: "تم إيقاف التعليق في حسابك، تواصل مع الإدارة" }, { status: 403 });

    const item = await SharedItem.findOne({ _id: id, published: true, hidden: false }).select("_id").lean();
    if (!item) return NextResponse.json({ error: "المشاركة غير موجودة أو تم حذفها" }, { status: 404 });

    const last = await SharedComment.findOne({ userId }).sort({ createdAt: -1 }).select("createdAt").lean();
    if (last && Date.now() - new Date(last.createdAt).getTime() < WAIT_MS) {
      return NextResponse.json({ error: "انتظر قليلا قبل التعليق مرة أخرى" }, { status: 429 });
    }

    // a reply always hangs under a top-level comment of the same item (one level only)
    let parentId: string | null = null;
    if (body?.parentId) {
      if (!isObjectId(body.parentId)) return NextResponse.json({ error: "التعليق غير موجود" }, { status: 400 });
      const parent = await SharedComment.findOne({ _id: body.parentId, itemId: id, hidden: false }).select("parentId").lean();
      if (!parent) return NextResponse.json({ error: "التعليق الذي ترد عليه غير موجود" }, { status: 400 });
      parentId = parent.parentId ? String(parent.parentId) : String(parent._id);
    }

    const authorName = await authorNameOf(userId);
    const c = await SharedComment.create({ itemId: id, userId, authorName, text, parentId });
    await SharedItem.updateOne({ _id: id }, { $inc: { comments: 1 } });

    return NextResponse.json({
      comment: {
        _id: String(c._id), authorName, text: c.text, parentId, createdAt: c.createdAt,
        isAuthor: false, mine: true, canDelete: true,
      },
    });
  } catch (error: unknown) {
    console.error("comments POST:", error);
    return NextResponse.json({ error: "خطأ أثناء نشر التعليق، حاول مرة أخرى" }, { status: 500 });
  }
}
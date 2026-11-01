import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    await connectDB();
    const docs = await SharedItem.find({ authorId: session.user.id })
      .sort({ updatedAt: -1 })
      .limit(300)
      .select("type stage level label title copies useful tried comments published hidden updatedAt")
      .lean();

    const totals = docs.reduce(
      (t, d) => ({ copies: t.copies + d.copies, useful: t.useful + d.useful, comments: t.comments + d.comments }),
      { copies: 0, useful: 0, comments: 0 }
    );
    return NextResponse.json({ items: JSON.parse(JSON.stringify(docs)), totals });
  } catch (error: unknown) {
    console.error("shared mine:", error);
    return NextResponse.json({ error: "خطأ في التحميل" }, { status: 500 });
  }
}
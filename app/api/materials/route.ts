import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import MaterialsDoc, { type IMaterialItem } from "@/app/models/MaterialsDoc";

const MAX_ITEMS = 200;
const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    await connectDB();
    const doc = await MaterialsDoc.findOne({ teacherId: session.user.id }).select("items updatedAt").lean();
    return NextResponse.json({ items: doc ? doc.items : null, updatedAt: doc?.updatedAt ?? null });
  } catch (error: unknown) {
    console.error("materials GET:", error);
    return NextResponse.json({ error: "خطأ في تحميل قائمة الجرد" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.items) || body.items.length > MAX_ITEMS) {
      return NextResponse.json({ error: "قائمة الجرد غير صالحة" }, { status: 400 });
    }

    const items: IMaterialItem[] = (body.items as Record<string, unknown>[])
      .map((m) => {
        const c = (m?.condition && typeof m.condition === "object" ? m.condition : {}) as Record<string, unknown>;
        return {
          name: str(m?.name, 120).trim(),
          quantity: str(m?.quantity, 10),
          condition: { bad: str(c.bad, 10), used: str(c.used, 10), new: str(c.new, 10) },
          note: str(m?.note, 300),
        };
      })
      .filter((m) => m.name);

    await connectDB();
    const doc = await MaterialsDoc.findOneAndUpdate(
      { teacherId: session.user.id },
      { teacherId: session.user.id, items },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ ok: true, updatedAt: doc?.updatedAt ?? null });
  } catch (error: unknown) {
    console.error("materials POST:", error);
    return NextResponse.json({ error: "فشل حفظ قائمة الجرد، حاول مرة أخرى" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import FicheTechP from "@/app/models/FicheTechP";
import { cleanHtml, isObjectId } from "@/app/lib/sharedUtils";

const MAX_FICHES = 300;
const MAX_BODY = 200_000;

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

        await connectDB();
        const list = await FicheTechP.find({ teacherId: session.user.id })
            .sort({ updatedAt: -1 })
            .limit(MAX_FICHES)
            .select("title level updatedAt")
            .lean();
        return NextResponse.json({ list: JSON.parse(JSON.stringify(list)) });
    } catch (error: unknown) {
        console.error("fiche-primaire GET:", error);
        return NextResponse.json({ error: "خطأ في تحميل البطاقات" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        const userId = session.user.id;

        const raw = await request.text();
        if (raw.length > MAX_BODY) return NextResponse.json({ error: "البطاقة كبيرة جدا" }, { status: 413 });
        let b: Record<string, unknown>;
        try { b = JSON.parse(raw); } catch { return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 }); }

        const level = typeof b.level === "string" && /^level[1-5]$/.test(b.level) ? b.level : null;
        const p = (b.pick && typeof b.pick === "object" ? b.pick : null) as Record<string, unknown> | null;
        if (!level || !p || typeof p.maidan !== "string" || !p.maidan) {
            return NextResponse.json({ error: "البطاقة غير صالحة" }, { status: 400 });
        }
        const pick = {
            maidan: p.maidan.slice(0, 40),
            unitName: typeof p.unitName === "string" ? p.unitName.slice(0, 120) : null,
            count: Math.min(Math.max(Number(p.count) || 1, 1), 10),
            chosenIds: Array.isArray(p.chosenIds) ? p.chosenIds.slice(0, 10).map((x) => (typeof x === "string" ? x.slice(0, 60) : "")) : [],
        };
        const rawFields = (b.fields && typeof b.fields === "object" ? b.fields : {}) as Record<string, unknown>;
        const fields = Object.fromEntries(
            Object.entries(rawFields).filter(([k]) => /^[a-z0-9_]{1,30}$/.test(k)).slice(0, 60).map(([k, v]) => [k, cleanHtml(v)])
        );
        const title = String(b.title ?? "").slice(0, 200);

        await connectDB();
        if (isObjectId(b._id)) {
            const doc = await FicheTechP.findOneAndUpdate(
                { _id: b._id, teacherId: userId },
                { title, level, pick, fields },
                { new: true }
            ).select("_id title updatedAt").lean();
            if (!doc) return NextResponse.json({ error: "البطاقة غير موجودة" }, { status: 404 });
            return NextResponse.json({ fiche: JSON.parse(JSON.stringify(doc)) });
        }

        if ((await FicheTechP.countDocuments({ teacherId: userId })) >= MAX_FICHES) {
            return NextResponse.json({ error: `وصلت إلى الحد الأقصى (${MAX_FICHES} بطاقة)، احذف بطاقات قديمة` }, { status: 400 });
        }
        const doc = await FicheTechP.create({ teacherId: userId, title, level, pick, fields });
        return NextResponse.json({ fiche: { _id: String(doc._id), title: doc.title, updatedAt: doc.updatedAt } });
    } catch (error: unknown) {
        console.error("fiche-primaire POST:", error);
        return NextResponse.json({ error: "فشل الحفظ، حاول مرة أخرى" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import FicheTechP from "@/app/models/FicheTechP";
import { isObjectId } from "@/app/lib/sharedUtils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        const { id } = await params;
        if (!isObjectId(id)) return NextResponse.json({ error: "البطاقة غير موجودة" }, { status: 404 });

        await connectDB();
        const doc = await FicheTechP.findOne({ _id: id, teacherId: session.user.id }).lean();
        if (!doc) return NextResponse.json({ error: "البطاقة غير موجودة" }, { status: 404 });
        return NextResponse.json({ fiche: JSON.parse(JSON.stringify(doc)) });
    } catch (error: unknown) {
        console.error("fiche-primaire GET one:", error);
        return NextResponse.json({ error: "خطأ في فتح البطاقة" }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        const { id } = await params;
        if (!isObjectId(id)) return NextResponse.json({ error: "البطاقة غير موجودة" }, { status: 404 });

        await connectDB();
        const r = await FicheTechP.deleteOne({ _id: id, teacherId: session.user.id });
        if (r.deletedCount === 0) return NextResponse.json({ error: "البطاقة غير موجودة" }, { status: 404 });
        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        console.error("fiche-primaire DELETE:", error);
        return NextResponse.json({ error: "فشل الحذف، حاول مرة أخرى" }, { status: 500 });
    }
}
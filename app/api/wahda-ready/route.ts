// app/api/wahda-ready/route.ts
// NEW route (read only): all the وحدات of the teacher for one trimester, in ONE request.
// Used by the "بطاقة جاهزة" part of the fiche technique. Does not touch the existing wahda routes.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import WahdaDoc from "@/app/models/WahdaDoc";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const trimester = new URL(request.url).searchParams.get("trimester");
        if (trimester !== "1" && trimester !== "2" && trimester !== "3") {
            return NextResponse.json({ error: "الفصل غير صالح" }, { status: 400 });
        }

        await connectDB();
        const docs = await WahdaDoc.find({ teacherId: session.user.id, trimester })
            .select("level sport sessions kaidiIndex updatedAt")
            .lean();

        return NextResponse.json({ wahdas: JSON.parse(JSON.stringify(docs)) });
    } catch (error: unknown) {
        console.error("wahda-ready:", error);
        return NextResponse.json({ error: "خطأ في تحميل الوحدات التعلمية" }, { status: 500 });
    }
}
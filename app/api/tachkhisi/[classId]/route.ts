import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TachkhisiDoc from "@/app/models/Tachkhisi";
import { connectDB } from "@/app/lib/mongo";

export async function GET(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId } = await params;
    const sportKey = req.nextUrl.searchParams.get("sportKey");
    const sportType = req.nextUrl.searchParams.get("sportType");

    if (!sportKey || !sportType) {
        return NextResponse.json({ error: "sportKey and sportType are required" }, { status: 400 });
    }

    await connectDB();

    const doc = await TachkhisiDoc.findOne({
        classId,
        sportKey,
        sportType: sportType as 'fardi' | 'groupe'
    }); if (!doc) return NextResponse.json(null, { status: 200 });

    return NextResponse.json(doc, { status: 200 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId } = await params;
    await connectDB();

    const body = await req.json();
    const { sportKey, sportType, mochirCount, selectedIndicatorIds, students, mochirAverages } = body;

    if (!sportKey || !sportType || !students || !mochirAverages) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const doc = await TachkhisiDoc.findOneAndUpdate(
        { classId, sportKey, sportType: sportType as 'fardi' | 'groupe' },
        {
            classId,
            sportKey,
            sportType: sportType as 'fardi' | 'groupe',
            mochirCount,
            selectedIndicatorIds,
            students,
            mochirAverages,
        },
        { upsert: true, returnDocument: "after", new: true }
    );

    return NextResponse.json(doc, { status: 200 });
}
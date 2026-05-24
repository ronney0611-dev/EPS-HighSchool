import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import TahsiliDoc from "@/app/models/Tahsili";

export async function GET(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId } = await params;
    const activity = req.nextUrl.searchParams.get("activity");

    if (!activity) return NextResponse.json({ error: "activity is required" }, { status: 400 });

    await connectDB();

    const doc = await TahsiliDoc.findOne({
        classId,
        activity: activity as 'sprint' | 'longjump' | 'throw'
    });
    return NextResponse.json(doc || { students: [] }, { status: 200 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId } = await params;
    await connectDB();

    const { activity, students } = await req.json();

    if (!activity || !students) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const doc = await TahsiliDoc.findOneAndUpdate(
        { classId, activity: activity as 'sprint' | 'longjump' | 'throw' },
        { students },
        { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json(doc, { status: 200 });
}
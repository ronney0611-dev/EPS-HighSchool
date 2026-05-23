import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Takwini from "@/app/models/Takwini";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongo";

export async function GET(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB;
    const { classId } = await params;
    const activity = req.nextUrl.searchParams.get('activity');

    if (!activity) return NextResponse.json({ error: 'activity is required' }, { status: 400 });

    const doc = await Takwini.findOne({
        classId: new mongoose.Types.ObjectId(classId),
        activity,
    });

    return NextResponse.json({ data: doc || null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { classId } = await params;
    const body = await req.json();
    const { activity, students, groupLevels, groupNotes } = body;

    if (!activity) return NextResponse.json({ error: 'activity is required' }, { status: 400 });

    const doc = await Takwini.findOneAndUpdate(
        { classId: new mongoose.Types.ObjectId(classId), activity },
        { $set: { students, groupLevels, groupNotes } },
        { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ data: doc });
}
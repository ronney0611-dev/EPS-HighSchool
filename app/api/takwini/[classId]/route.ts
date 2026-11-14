import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Takwini from "@/app/models/Takwini";
import Class from "@/app/models/Class";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongo";

const ownsClass = async (classId: string, teacher: string) =>
    mongoose.isValidObjectId(classId) && !!(await Class.exists({ _id: classId, teacher }));

export async function GET(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    const teacher = (session?.user as { id?: string } | undefined)?.id;
    if (!session || !teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { classId } = await params;
    const activity = req.nextUrl.searchParams.get('activity');

    if (!activity) return NextResponse.json({ error: 'activity is required' }, { status: 400 });
    if (!(await ownsClass(classId, teacher))) return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });

    const doc = await Takwini.findOne({
        classId: new mongoose.Types.ObjectId(classId),
        activity,
    });

    return NextResponse.json({ data: doc || null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    const teacher = (session?.user as { id?: string } | undefined)?.id;
    if (!session || !teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { classId } = await params;
    const body = await req.json();
    const { activity, students, groupLevels, groupNotes } = body;

    if (!activity) return NextResponse.json({ error: 'activity is required' }, { status: 400 });
    if (!(await ownsClass(classId, teacher))) return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });

    const doc = await Takwini.findOneAndUpdate(
        { classId: new mongoose.Types.ObjectId(classId), activity },
        { $set: { students, groupLevels, groupNotes } },
        { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ data: doc });
}
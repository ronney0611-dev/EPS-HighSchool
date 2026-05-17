import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Attendance, { IAttendance } from "@/app/models/Attendance";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: Promise<{ classId: string }> }) {
    await connectDB();
    const { classId } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const attendance = await Attendance.findOne({ classId });
        return Response.json({ success: true, attendance });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ classId: string }> }) {
    await connectDB();
    const { classId } = await params;
    const body = await req.json();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        const sanitized = body.attendance.map((a: IAttendance) => ({
            studentId: new mongoose.Types.ObjectId(a.studentId.toString()),
            sessions: a.sessions
        }));
        const newAtt = await Attendance.findOneAndUpdate(
            { classId },
            { $set: { attendance: sanitized } },
            { upsert: true, returnDocument: 'after' }
        );
        return Response.json({ success: true, newAtt });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
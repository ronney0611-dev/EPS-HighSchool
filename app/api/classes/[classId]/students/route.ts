import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import Student from "@/app/models/Student";
import { requirePaidUser, requireOwnedClass } from "@/app/lib/authHelpers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ classId: string }> }) {
    await connectDB();
    const { classId } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        const ownership = await requireOwnedClass(classId, session.user.id);
        if (!ownership.ok) return ownership.response;

        const students = await Student.find({ classId: classId });
        return Response.json({ success: true, students });
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

        const ownership = await requireOwnedClass(classId, session.user.id);
        if (!ownership.ok) return ownership.response;

        const paidCheck = await requirePaidUser(session.user.id);
        if (!paidCheck.ok) return paidCheck.response;

        const newStudent = new Student({
            ...body, classId
        });
        const saveStudent = await newStudent.save();
        return Response.json({ success: true, student: saveStudent });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
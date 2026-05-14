import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import Student from "@/app/models/Student";
import { getServerSession } from "next-auth";

export async function DELETE(req: Request, { params }: { params: { classId: string, studentId: string } }) {
    await connectDB();
    const { classId, studentId } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const student = await Student.findByIdAndDelete(studentId);
        if (!student) return Response.json({ message: 'Student not found' }, { status: 404 });
        return Response.json({ success: true, student });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { classId: string, studentId: string } }) {
    await connectDB();
    const { classId, studentId } = await params;
    const body = await req.json();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const student = await Student.findByIdAndUpdate(studentId, body, { new: true });
        if (!student) return Response.json({ message: 'Student not found' }, { status: 404 });
        return Response.json({ success: true, student });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
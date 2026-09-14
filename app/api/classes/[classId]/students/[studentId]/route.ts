import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import Student from "@/app/models/Student";
import { getServerSession } from "next-auth";
import { requireOwnedClass } from "@/app/lib/authHelpers";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
    await connectDB();
    const { classId, studentId } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        const ownership = await requireOwnedClass(classId, session.user.id);
        if (!ownership.ok) return ownership.response;

        const student = await Student.findOneAndDelete({ _id: studentId, classId });
        if (!student) return Response.json({ message: 'Student not found' }, { status: 404 });
        return Response.json({ success: true, student });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
    await connectDB();
    const { classId, studentId } = await params;
    const body = await req.json();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        const ownership = await requireOwnedClass(classId, session.user.id);
        if (!ownership.ok) return ownership.response;

        const student = await Student.findOneAndUpdate({ _id: studentId, classId }, body, { new: true });
        if (!student) return Response.json({ message: 'Student not found' }, { status: 404 });
        return Response.json({ success: true, student });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
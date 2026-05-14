import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import Student from "@/app/models/Student";
import { getServerSession } from "next-auth";


export async function GET(req: Request, { params }: { params: { classId: string } }) {
    await connectDB();
    const { classId } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const students = await Student.find({ classId: classId });
        return Response.json({ success: true, students });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req:Request, {params} : {params : {classId : string}}) {
    await connectDB();
    const { classId } = await params;
    const body = await req.json();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const newStudent = new Student({
            ...body , classId
        });
        const saveStudent = await newStudent.save();
        return Response.json({ success: true, student : saveStudent });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

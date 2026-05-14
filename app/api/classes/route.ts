import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Class from "@/app/models/Class";
import Student from "@/app/models/Student";

export async function GET(req: Request) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const classes = await Class.find({teacher : session.user.id})
        return Response.json({ success: true, classes })
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();
    try {
        const {name , level } = body;
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const newClass = new Class({
            name, level, teacher : session.user.id
        });
        const saveClass = await newClass.save();
        return Response.json({ success: true, class : saveClass });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await connectDB();
    const body = await req.json();
    try {
        const { classId } = body;
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const deletedClass = await Class.findOneAndDelete({ _id: classId, teacher: session.user.id });
        if (!deletedClass) return Response.json({ message: 'Class not found' }, { status: 404 });
        await Student.deleteMany({ classId: classId });
        return Response.json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
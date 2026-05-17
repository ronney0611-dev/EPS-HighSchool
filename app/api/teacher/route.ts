import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Teacher from "@/app/models/Teacher";


export async function GET(req: Request) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const teacher = await Teacher.findOne({ userId: session.user.id });
        return Response.json({ success: true, teacher });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    await connectDB();
    const body = await req.json();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const teacher = await Teacher.findOneAndUpdate({ userId: session.user.id },
            { ...body },
            { new: true, upsert: true });
        if (!teacher) return Response.json({ message: 'Student not found' }, { status: 404 });
        return Response.json({ success: true, teacher });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
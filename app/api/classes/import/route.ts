import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Class from "@/app/models/Class";
import Student from "@/app/models/Student";


export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();
    try {
        const { classes } = body;
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        for (const cls of classes) {

            const newClass = await Class.create({ name: cls.name, level: cls.level, teacher: session.user.id });

            await Student.insertMany(cls.students.map(s => ({ ...s, classId: newClass._id })));
        }
        return Response.json({ success: true });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
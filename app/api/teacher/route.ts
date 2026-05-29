import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Teacher from "@/app/models/Teacher";

export async function GET(req: Request) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);

        // Block unauthenticated users or missing IDs
        if (!session || !session.user?.id) {
            return Response.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 🎯 Now session.user.id perfectly matches your Schema's userId!
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

        if (!session || !session.user?.id) {
            return Response.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Safely find and update using the verified User Object ID
        const teacher = await Teacher.findOneAndUpdate(
            { userId: session.user.id },
            { ...body },
            { new: true, upsert: true } // Creates the profile doc if it doesn't exist yet
        );

        return Response.json({ success: true, teacher });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Teacher from "@/app/models/Teacher";

// Only these fields can be changed from the client
const ALLOWED_FIELDS = [
    'name', 'school', 'birthloc', 'nationality', 'birthday', 'statu',
    'email', 'phone', 'univerLic', 'anneLic', 'univerMas', 'anneMas',
    'review', 'photo',
] as const;

const LOCKED_FIELDS = ['name'] as const;

export async function GET(req: Request) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return Response.json({ message: 'Unauthorized' }, { status: 401 });
        }

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

        // keep only allowed fields
        const update: Record<string, unknown> = {};
        for (const key of ALLOWED_FIELDS) {
            if (key in body) update[key] = body[key];
        }

        const current = await Teacher.findOne({ userId: session.user.id }).select('nameLocked').lean();

        if (current?.nameLocked) {
            // locked → name / school can't change
            for (const key of LOCKED_FIELDS) delete update[key];
        } else if (String(update.name ?? '').trim()) {
            update.nameLocked = true;
        }

        const teacher = await Teacher.findOneAndUpdate(
            { userId: session.user.id },
            { $set: update },
            { new: true, upsert: true }
        );

        return Response.json({ success: true, teacher });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
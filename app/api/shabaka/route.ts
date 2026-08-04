import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Shabaka from "@/app/models/Shabaka";

export async function GET(req: Request) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const classId = searchParams.get('classId');
        const maidanIndex = searchParams.get('maidanIndex');
        const level = searchParams.get('level');

        if (!classId || !level || maidanIndex === null) {
            return Response.json({ message: 'classId و level و maidanIndex مطلوبان' }, { status: 400 });
        }

        const doc = await Shabaka.findOne({
            classId,
            level,
            maidanIndex: Number(maidanIndex),
            teacher: session.user.id,
        });

        return Response.json({ success: true, shabaka: doc });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        const { classId, level, maidanIndex, type, students } = body;

        if (!classId || !level || maidanIndex === undefined || !type || !students) {
            return Response.json({ message: 'بيانات ناقصة' }, { status: 400 });
        }
        if (type !== 'tashkhisi' && type !== 'tahsili') {
            return Response.json({ message: 'نوع غير صحيح' }, { status: 400 });
        }

        const update = {
            $set: {
                classId,
                level,
                maidanIndex,
                teacher: session.user.id,
                [type]: { students },
            },
        };

        const saved = await Shabaka.findOneAndUpdate(
            { classId, level, maidanIndex, teacher: session.user.id },
            update,
            { upsert: true, new: true }
        );

        return Response.json({ success: true, shabaka: saved });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
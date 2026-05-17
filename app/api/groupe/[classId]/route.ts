import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Groupe, { IGroup, IGroupStudent } from "@/app/models/Groupe";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: Promise<{ classId: string }> }) {
    await connectDB();
    const { classId } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });
        const groupe = await Groupe.findOne({ classId });
        return Response.json({ success: true, groupe });
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

        const sanitized: IGroup[] = (body.groupe as IGroup[]).map((g) => ({
            name: g.name,
            leader: g.leader || undefined,
            students: g.students.map((s: IGroupStudent & { id?: string }) => ({
                _id: new mongoose.Types.ObjectId(s.id ?? s._id.toString()),
                name: s.name,
                gender: s.gender,
                level: s.level
            }))
        }));

        const newGroupe = await Groupe.findOneAndUpdate(
            { classId },
            { $set: { groupe: sanitized } },
            { upsert: true, returnDocument: 'after' }
        );
        return Response.json({ success: true, newGroupe });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
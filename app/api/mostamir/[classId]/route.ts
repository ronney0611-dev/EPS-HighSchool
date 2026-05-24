import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import MostamirDoc from "@/app/models/Mostamir";

export async function GET(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId } = await params;
    await connectDB();

    const doc = await MostamirDoc.findOne({ classId });
    return NextResponse.json(doc || { classId, students: [] }, { status: 200 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId } = await params;
    await connectDB();

    const { students } = await req.json();

    if (!students || !Array.isArray(students)) {
        return NextResponse.json({ error: "students array is required" }, { status: 400 });
    }

    const doc = await MostamirDoc.findOneAndUpdate(
        { classId },
        { students },
        { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json(doc, { status: 200 });
}
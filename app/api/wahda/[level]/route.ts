import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { connectDB } from "@/app/lib/mongo";
import WahdaDoc, { IWahdaDoc } from "@/app/models/WahdaDoc";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ level: string }> }
) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { level } = await params;
        const { searchParams } = new URL(request.url);
        const sport = searchParams.get("sport");
        const trimester = searchParams.get("trimester");

        if (!sport || !trimester) {
            return NextResponse.json({ error: "Missing sport or trimester query" }, { status: 400 });
        }

        // 'as const' forces the compiler to read level and trimester as their exact literal types
        const doc = await WahdaDoc.findOne({
            teacherId: session.user.id,
            level: level as '1' | '2' | '3',
            sport,
            trimester: trimester as '1' | '2' | '3',
        } as const).lean();

        return NextResponse.json(doc || { sessions: [] });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ level: string }> }
) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { level } = await params;
        const body = await request.json() as Partial<IWahdaDoc>;
        const { sport, trimester, sessions } = body;

        if (!sport || !trimester || !Array.isArray(sessions)) {
            return NextResponse.json({ error: "Invalid payload layout" }, { status: 400 });
        }

        const updatedDoc = await WahdaDoc.findOneAndUpdate(
            {
                teacherId: session.user.id,
                level: level as '1' | '2' | '3',
                sport,
                trimester: trimester as '1' | '2' | '3',
            } as const,
            {
                teacherId: session.user.id,
                level: level as '1' | '2' | '3',
                sport,
                trimester: trimester as '1' | '2' | '3',
                sessions,
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true,
            }
        ).lean();

        return NextResponse.json({ 
            success: true, 
            data: JSON.parse(JSON.stringify(updatedDoc)) as IWahdaDoc 
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TakwiniWeeks from "@/app/models/TakwiniWeeks";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongo";

const ACTIVITIES = ['sprint', 'longjump', 'throw'];

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const teacher = (session?.user as { id?: string } | undefined)?.id;
    if (!teacher) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const activity = req.nextUrl.searchParams.get('activity') ?? '';
    if (!ACTIVITIES.includes(activity)) return NextResponse.json({ error: 'النشاط غير صالح' }, { status: 400 });

    await connectDB();
    const doc = await TakwiniWeeks.findOne({ teacher, activity }).lean();
    return NextResponse.json({ weeks: doc?.weeks ?? [] });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const teacher = (session?.user as { id?: string } | undefined)?.id;
    if (!teacher) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const activity = body?.activity;
    if (!ACTIVITIES.includes(activity)) return NextResponse.json({ error: 'النشاط غير صالح' }, { status: 400 });

    const weeks: number[] = Array.isArray(body?.weeks)
        ? body.weeks.slice(0, 9).filter((n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < 36)
        : [];

    await connectDB();
    await TakwiniWeeks.updateOne({ teacher, activity }, { $set: { weeks } }, { upsert: true });
    return NextResponse.json({ weeks });
}
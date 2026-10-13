import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Timetable from "@/app/models/Timetable";
import { connectDB } from "@/app/lib/mongo";

const MAX_SLOTS = 60;

type SlotInput = { day: number; start: number; end: number; classId: string };

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const doc = await Timetable.findOne({ owner: session.user.id }).lean();
    return NextResponse.json(doc ?? { slots: [] }, { status: 200 });
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const slots: SlotInput[] = Array.isArray(body?.slots) ? body.slots : [];

    if (slots.length > MAX_SLOTS) {
        return NextResponse.json({ error: "Too many slots" }, { status: 400 });
    }

    const PERIOD_STARTS = [480, 540, 600, 660, 810, 870, 930, 990]
    const PERIOD_ENDS = [540, 600, 660, 720, 870, 930, 990, 1050]
    const LUNCH = 720 // 12:00

    for (const s of slots) {
        const ok =
            Number.isInteger(s.day) && s.day >= 0 && s.day <= 4 &&
            PERIOD_STARTS.includes(s.start) && PERIOD_ENDS.includes(s.end) &&
            s.end > s.start && s.end - s.start <= 210 &&      // max 3 periods
            !(s.start < LUNCH && s.end > LUNCH) &&            // can't cross lunch
            mongoose.isValidObjectId(s.classId);
        if (!ok) return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }

    // no overlaps on the same day
    for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
            const a = slots[i], b = slots[j];
            if (a.day === b.day && a.start < b.end && b.start < a.end) {
                return NextResponse.json({ error: "Overlapping slots" }, { status: 400 });
            }
        }
    }

    await connectDB();
    const doc = await Timetable.findOneAndUpdate(
        { owner: session.user.id },
        { owner: session.user.id, slots },
        { upsert: true, returnDocument: "after", new: true }
    );

    return NextResponse.json(doc, { status: 200 });
}
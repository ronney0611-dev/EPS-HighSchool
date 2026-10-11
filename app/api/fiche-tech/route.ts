import { NextRequest, NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FicheTech from "@/app/models/FicheTech";
import { connectDB } from "@/app/lib/mongo";

const MAX_FIELDS_SIZE = 100_000; // ~100 KB per fiche
const MAX_FICHES = 300;

export const ownerOf = (session: Session | null) => {
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  return user?.id ?? user?.email ?? null;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const owner = ownerOf(session);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const list = await FicheTech.find({ owner })
    .select("title level sessionNumber updatedAt")
    .sort({ updatedAt: -1 })
    .limit(MAX_FICHES)
    .lean();

  return NextResponse.json(list, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const owner = ownerOf(session);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { _id, title, level, sessionNumber, individual, collective, fields } = body;

  if (!level || sessionNumber === undefined || !individual || !collective || typeof fields !== "object") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (JSON.stringify(fields).length > MAX_FIELDS_SIZE) {
    return NextResponse.json({ error: "Fiche too large" }, { status: 413 });
  }

  await connectDB();

  const data = { owner, title: String(title ?? ""), level, sessionNumber, individual, collective, fields };

  if (_id) {
    if (!mongoose.isValidObjectId(_id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    // owner in the filter = a teacher can only update their own fiche
    const doc = await FicheTech.findOneAndUpdate({ _id, owner }, data, { returnDocument: "after", new: true });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc, { status: 200 });
  }

  const count = await FicheTech.countDocuments({ owner });
  if (count >= MAX_FICHES) {
    return NextResponse.json({ error: "Limit reached" }, { status: 403 });
  }

  const doc = await FicheTech.create(data);
  return NextResponse.json(doc, { status: 201 });
}
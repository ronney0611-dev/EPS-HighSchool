import { connectDB } from "@/app/lib/mongo";
import mongoose from "mongoose";

export async function GET() {
    await connectDB();
    await mongoose.connection.collection('groupes').drop();
    return Response.json({ success: true });
}
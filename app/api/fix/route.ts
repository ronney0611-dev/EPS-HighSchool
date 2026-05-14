import { connectDB } from "@/app/lib/mongo";
import mongoose from "mongoose";

export async function GET() {
    await connectDB();
    await mongoose.connection.collection('classes').dropIndexes();
    return Response.json({ success: true });
}
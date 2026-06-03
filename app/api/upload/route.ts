import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) return Response.json({ message: 'No file provided' }, { status: 400 });

        // convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        // upload to cloudinary
        const result = await cloudinary.uploader.upload(base64, {
            folder: 'eps-payments',
        });

        return Response.json({ success: true, url: result.secure_url });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
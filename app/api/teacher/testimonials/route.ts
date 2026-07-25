// app/api/teachers/testimonials/route.ts
import { connectDB } from "@/app/lib/mongo";
import Teacher from "@/app/models/Teacher";

export async function GET() {
    await connectDB();
    try {
        const teachers = await Teacher.find(
            { review: { $exists: true, $ne: "" } },
            "name birthloc photo review"
        ).limit(12);

        return Response.json({ success: true, teachers });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
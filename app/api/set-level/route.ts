import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/mongo"
import User from "@/app/models/User"

export async function POST(req: Request) {
    try {
        const { level, email } = await req.json()

        if (!['lycee', 'cem', 'primaire'].includes(level)) {
            return NextResponse.json({ message: 'مستوى غير صحيح' }, { status: 400 })
        }

        await connectDB()
        await User.findOneAndUpdate(
            { email },
            { level },
            { returnDocument: 'after' }
        )

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ message: 'خطأ في الخادم' }, { status: 500 })
    }
}
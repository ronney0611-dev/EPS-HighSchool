import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongo";
import User from "@/app/models/User";

interface IUserDoc {
    isPaid?: boolean;
    paidUntil?: Date | null;
    role?: string;
    level?: 'lycee' | 'cem' | 'primaire';  // ← added
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { isPaid: false, paidUntil: null, role: "user", level: "lycee", error: "غير مصرح" },
            { status: 401 }
        );
    }

    try {
        await connectDB();

        const user = await User.findById(session.user.id)
            .select("isPaid paidUntil role level")  // ← added level
            .lean() as IUserDoc | null;

        if (!user) {
            return NextResponse.json(
                { isPaid: false, paidUntil: null, role: "user", level: "lycee", error: "المستخدم غير موجود" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            isPaid: user.isPaid === true,
            paidUntil: user.paidUntil ? new Date(user.paidUntil).toISOString() : null,
            role: user.role || "user",
            level: user.level || "lycee",  // ← added
        });

    } catch (error) {
        console.error("Auth refresh error:", error);
        return NextResponse.json(
            { isPaid: false, paidUntil: null, role: "user", level: "lycee", error: "خطأ في الخادم" },
            { status: 500 }
        );
    }
}
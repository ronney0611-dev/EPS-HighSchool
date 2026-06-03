import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongo";
import User from "@/app/models/User";

// واجهة لتحديد الأنواع بصرامة تامة تماشياً مع TypeScript Strict
interface IUserDoc {
    isPaid?: boolean;
    paidUntil?: Date | null;
    role?: string;
}

export async function GET() {
    const session = await getServerSession(authOptions);

    // 1. التحقق الصارم من وجود المعرف في الجلسة
    if (!session?.user?.id) {
        return NextResponse.json(
            { isPaid: false, paidUntil: null, role: "user", error: "غير مصرح" },
            { status: 401 }
        );
    }

    try {
        await connectDB();

        // 2. جلب الحقول مع ضمان جلبها حتى لو كانت مفقودة أو غير محددة في المستند
        const user = await User.findById(session.user.id)
            .select("isPaid paidUntil role")
            .lean() as IUserDoc | null;

        if (!user) {
            return NextResponse.json(
                { isPaid: false, paidUntil: null, role: "user", error: "المستخدم غير موجود" },
                { status: 404 }
            );
        }

        // 3. 🚨 خط الدفاع الحديدي: إجبار القيم على العودة بصيغة Booleans ونصوص صريحة
        // إذا كان الحقل undefined أو مفقود، سيتحول حتماً إلى false أو null ولن يخدع الـ Proxy أبداً!
        return NextResponse.json({
            isPaid: user.isPaid === true, // تضمن عودة true أو false صريحة فقط
            paidUntil: user.paidUntil ? new Date(user.paidUntil).toISOString() : null, // تحويل التاريخ لنص موحد
            role: user.role || "user",
        });

    } catch (error) {
        console.error("Auth refresh error:", error);
        return NextResponse.json(
            { isPaid: false, paidUntil: null, role: "user", error: "خطأ في الخادم" },
            { status: 500 }
        );
    }
}
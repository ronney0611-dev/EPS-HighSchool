import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongo";
import User from "@/app/models/User";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "غير مصرح", status: 401 };
    if (session.user.role !== "admin") return { error: "ممنوع", status: 403 };
    return { session };
}

function nextJune30(): Date {
    const today = new Date();
    const currentYear = today.getFullYear();
    const thisYearJune30 = new Date(currentYear, 5, 30, 23, 59, 59);

    if (today <= thisYearJune30) {
        return thisYearJune30;
    } else {
        return new Date(currentYear + 1, 5, 30, 23, 59, 59);
    }
}

// ✅ Fix: params typed as Promise<{ id: string }> — required in Next.js 16
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if ("error" in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await connectDB();

        // ✅ Fix: await params before destructuring
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "معرف المستخدم مفقود" }, { status: 400 });
        }

        const body = await req.json();
        const { action }: { action: string } = body;

        if (!["ACTIVATE", "DEACTIVATE"].includes(action)) {
            return NextResponse.json(
                { error: "الإجراء يجب أن يكون ACTIVATE أو DEACTIVATE" },
                { status: 400 }
            );
        }

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
        }

        if (user.role === "admin") {
            return NextResponse.json(
                { error: "لا يمكن تعديل حساب المشرف" },
                { status: 403 }
            );
        }

        if (action === "ACTIVATE") {
            const paidUntil = nextJune30();
            user.isPaid = true;
            user.paidUntil = paidUntil;
            await user.save();

            return NextResponse.json({
                message: "تم تفعيل الاشتراك بنجاح",
                paidUntil: paidUntil.toISOString(),
            });
        }

        // action === "DEACTIVATE"
        user.isPaid = false;
        user.paidUntil = null;
        await user.save();

        return NextResponse.json({ message: "تم إلغاء تفعيل الاشتراك" });

    } catch (error) {
        console.error("Admin users PATCH error:", error);
        return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
    }
}
// app/api/admin/payments/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongo";
import ManualPayment from "@/app/models/ManualPayment";
import User from "@/app/models/User";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "غير مصرح", status: 401 };
    if (session.user.role !== "admin") return { error: "ممنوع", status: 403 };
    return { session };
}

function calcPaidUntil(paymentDate: Date): Date {
    const date = new Date(paymentDate);
    const paymentYear = date.getFullYear();
    const june30ThisYear = new Date(`${paymentYear}-06-30`);

    if (date > june30ThisYear) {
        return new Date(`${paymentYear + 2}-06-30`);
    } else {
        return new Date(`${paymentYear + 1}-06-30`);
    }
}

// ✅ Fix: params typed as Promise<{ id: string }> and awaited — required in Next.js 16
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
            return NextResponse.json({ error: "معرف الدفعة مفقود" }, { status: 400 });
        }

        const body = await req.json();
        const { action, adminNotes }: { action: string; adminNotes?: string } = body;

        if (!["APPROVE", "REJECT"].includes(action)) {
            return NextResponse.json(
                { error: "الإجراء يجب أن يكون APPROVE أو REJECT" },
                { status: 400 }
            );
        }

        const payment = await ManualPayment.findById(id);
        if (!payment) {
            return NextResponse.json({ error: "الدفعة غير موجودة" }, { status: 404 });
        }

        if (payment.status !== "PENDING") {
            return NextResponse.json(
                { error: "لا يمكن تعديل دفعة تمت معالجتها مسبقاً" },
                { status: 409 }
            );
        }

        if (action === "APPROVE") {
            const paidUntil = calcPaidUntil(payment.createdAt);

            payment.status = "APPROVED";
            payment.adminNotes = adminNotes ?? "";
            await payment.save();

            await User.findByIdAndUpdate(payment.userId, {
                isPaid: true,
                paidUntil,
            });

            return NextResponse.json({
                message: "تمت الموافقة على الدفعة وتفعيل الاشتراك",
                paidUntil,
            });
        }

        // action === "REJECT"
        payment.status = "REJECTED";
        payment.adminNotes = adminNotes ?? "";
        await payment.save();

        return NextResponse.json({ message: "تم رفض الدفعة" });

    } catch (error) {
        console.error("Admin payments PATCH error:", error);
        return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
    }
}
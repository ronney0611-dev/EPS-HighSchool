// app/api/admin/payments/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongo";
import ManualPayment from "@/app/models/ManualPayment";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "غير مصرح", status: 401 };
  if (session.user.role !== "admin") return { error: "ممنوع", status: 403 };
  return { session };
}

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    // ?status=PENDING | APPROVED | REJECTED (required)
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "يجب تحديد الحالة: PENDING أو APPROVED أو REJECTED" },
        { status: 400 }
      );
    }

    const [payments, total] = await Promise.all([
      ManualPayment.find({ status })
        .populate("userId", "name email isPaid paidUntil")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ManualPayment.countDocuments({ status }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin payments GET error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
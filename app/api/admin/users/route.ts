import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongo";
import User from "@/app/models/User";

// Define a strict document structure interface for type-safety
interface IUserRaw {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isPaid: boolean;
  paidUntil: Date | string | null;
  createdAt: Date;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "غير مصرح", status: 401 };
  if (session.user.role !== "admin") return { error: "ممنوع", status: 403 };
  return { session };
}

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Concurrently fetch users list and total count for high performance
    const [rawUsers, total] = await Promise.all([
      User.find({}, "-password") // Safely strip out the password hash field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() as unknown as IUserRaw[],
      User.countDocuments(),
    ]);

    const now = new Date();

    // Transform raw DB objects to include reliable, runtime evaluated status values
    const users = rawUsers.map((user) => {
      const hasPaidFlag = user.isPaid === true;
      const hasValidDate = user.paidUntil ? new Date(user.paidUntil) > now : false;
      
      let computedStatus: 'unpaid' | 'active' | 'expired' = 'unpaid';

      if (hasPaidFlag) {
        computedStatus = hasValidDate ? 'active' : 'expired';
      }

      return {
        ...user,
        // Send this clean status tag to your frontend table row styles
        accountStatus: computedStatus, 
      };
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
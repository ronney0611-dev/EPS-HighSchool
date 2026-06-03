import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import ManualPayment from "@/app/models/ManualPayment";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { method, plan, amount, receiptUrl, transactionNumber } = body;

        // validate required fields
        if (!method || !plan || !amount || !receiptUrl) {
            return Response.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        // check if user already has a pending request
        const existing = await ManualPayment.findOne({
            userId: session.user.id,
            status: 'PENDING'
        });
        if (existing) {
            return Response.json({ message: 'لديك طلب دفع قيد المراجعة بالفعل' }, { status: 400 });
        }

        const payment = await ManualPayment.create({
            userId: session.user.id,
            method,
            plan,
            amount,
            receiptUrl,
            transactionNumber,
        });

        return Response.json({ success: true, payment }, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

        // get current user's payment history
        const payments = await ManualPayment.find({ userId: session.user.id }).sort({ createdAt: -1 });
        return Response.json({ success: true, payments });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Server error' }, { status: 500 });
    }
}
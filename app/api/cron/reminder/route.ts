import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongo';
import User from '@/app/models/User';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `السلام عليكم استاذ(ة)，

لاحظنا أنك سجلت مؤخرًا في منصة EPSDZ،

ونود أن نطمئن عليك ونسألك إذا واجهتك أي مشكلة أو استفسار أثناء استخدام المنصة، رأيك يهمنا كثيرًا في تطوير المنصة لخدمتك بشكل أفضل.

هل هناك أمر معين منعك من إكمال التسجيل أو التفعيل؟ أي ملاحظة، مهما كانت بسيطة، تفيدنا.

لا تتردد في التواصل معي مباشرة: 0795972858

بانتظار ردك، وشكرًا لك على وقتك.

مع خالص التقدير، منصة EPSDZ`;

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const thirtyMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const targets = await User.find({
        isPaid: false,
        reminderSent: false,
        createdAt: { $lte: thirtyMinAgo },
    });

    let sent = 0;

    for (const user of targets) {
        try {
            await resend.emails.send({
                from: 'EPS High <contact@epsdz.com>',
                to: user.email,
                subject: 'هل واجهتك مشكلة في EPSDZ؟',
                text: EMAIL_TEXT(),
            });
            user.reminderSent = true;
            await user.save();
            sent++;
        } catch (err) {
            console.error(`Failed for ${user.email}:`, err);
        }
    }

    return NextResponse.json({ sent, checked: targets.length });
}
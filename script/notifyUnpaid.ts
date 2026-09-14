import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `
الأستاذ(ة) الفاضل(ة)،

السلام عليكم ورحمة الله وبركاته،

مع استئناف النشاط التربوي وعودة الأساتذة إلى المدارس هذا الأسبوع تحضيراً لاستقبال التلاميذ الأسبوع القادم، يسعدنا في منصة EPS DZ أن نتقدم إليكم بأزكى التهاني وأطيب التبريكات بمناسبة الدخول المدرسي.

إذا كان لديكم أي استفسار حول كيفية استخدام المنصة، أو واجهتكم أي صعوبة، أو رغبتم في التعرف على مزايا الاشتراكات المتقدمة، فلا تترددوا في التواصل معنا 0795972858.

نتمنى لكم بداية موفقة وموسماً دراسياً ناجحاً ومكللاً بالتوفيق.

مع خالص التقدير والاحترافية،

فريق منصة EPS DZ`;

async function main() {
    await mongoose.connect(process.env.MONGODB_URI!, {
        dbName: process.env.DATABASE_NAME,
    });

    const unpaidUsers = await User.find({ isPaid: false }, 'email');

    for (const user of unpaidUsers) {
        try {
            await resend.emails.send({
                from: 'EPSDZ <contact@epsdz.com>',
                to: user.email,
                subject: 'EPSDZ رفيقكم الدائم',
                text: EMAIL_TEXT(),
            });
            console.log(`Sent to ${user.email}`);
        } catch (err) {
            console.error(`Failed for ${user.email}:`, err);
        }

        await new Promise((r) => setTimeout(r, 1500));
    }

    await mongoose.disconnect();
    console.log('Done.');
}

main();
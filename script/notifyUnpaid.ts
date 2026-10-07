import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `تحديث ! 📚⚡

مع نهاية الفصل الدراسي، نعلم جميعاً حجم الضغط والوقت الطويل المستغرق في صبّ العلامات يدوياً. ولأننا نواصل العمل لتسهيل مهامكم الشاقة، أطلقنا تحديثاً جديداً ومباشراً على المنصة 

عند نهاية الفصل، كل ما عليك هو رفع ملف الايكسال المستلم من إدارة الثانوية مباشرة على المنصة.

 تقوم المنصة بصب وتعبئة جميع العلامات والحسابات داخل نفس الملف في أقل من دقيقة واحدة.

تنزل الملف المكتمل بنفس التنسيق الرسمي المطلوب لتسليمه فوراً للادارة دون أي جهد أو كتابة يدوية.

وفر وقتك وجهدك في نهاية الفصل الدراسي وركّز على ما هو أهم.

مع خالص التقدير،

EPS DZ `;

async function main() {
    await mongoose.connect(process.env.MONGODB_URI!, {
        dbName: process.env.DATABASE_NAME,
    });

    const unpaidUsers = await User.find({ isPaid: false, level: 'lycee' }, 'email');

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
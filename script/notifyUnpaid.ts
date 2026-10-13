import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `تحديث ضخم ! 📚⚡

السلام عليكم أستاذ(ة)،

في الاستمرار مع التحديث 2.0 :

 البرنامج الأسبوعي: تدخلون استعمال الزمن مرة واحدة فقط، ويمكنكم طباعته أيضا.

حصصكم تنتظركم: كل يوم يقترح عليكم التطبيق حصص اليوم مع النشاط الفردي والجماعي وهدف كل حصة مأخوذ مباشرة من وحدتكم التعلمية.

ضغطة واحدة «تمت الحصة» وتسجل في الدفتر.

     حصة لم تنجز؟ اختاروا السبب والمقترح بضغطة، بدون كتابة.

⚠️ نسيتم يوما؟ التطبيق يذكركم بالحصص غير المسجلة، و«قبول الكل» يسجلها دفعة واحدة.

🖨️ طباعة حسب طلب مفتشكم: هذا الأسبوع، أو كل أسبوع وكل مستوى في صفحة مستقلة، أو الدفتر كاملا متواصلا.

هدفنا أن تقضوا وقتكم مع تلاميذكم في الميدان، لا أمام الأوراق.

EPS DZ `;

async function main() {
    await mongoose.connect(process.env.MONGODB_URI!, {
        dbName: process.env.DATABASE_NAME,
    });

    const unpaidUsers = await User.find({ isPaid: true, level: 'lycee' }, 'email');

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
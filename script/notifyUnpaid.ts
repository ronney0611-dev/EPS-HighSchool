import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `السلام عليكم استاذ(ة) 

سمعنا ملاحظاتكم، وهذا تحديث اليوم 

EPSDZ أصبح تطبيقا

افتح المنصة وحمل التطبيق على هاتفك

المذكرات (الثانوي) 

كل تمرين في البطاقة التقنية أصبح بشرح كامل: عدد الأفواج، المساحة والوسائل، طريقة العمل، التكرار والراحة، وما يتابعه الأستاذ. بطاقة جاهزة للمفتش دون إضافات.
(للبطاقات المحفوظة مسبقا: اضغط «إعادة التوليد» للحصول على الشرح الجديد.)

تواريخ الوحدة التعلمية تلقائية

تظهر الآن أسابيع كل حصة مباشرة من المخطط السنوي 2026/2027: التقويم التشخيصي، الحصص التعليمية والتقويم التحصيلي. لا حاجة لكتابة أي تاريخ.


شكرا لكل من راسلنا بملاحظة، المنصة تتحسن بفضلكم 💙

فريق EPSDZ

`;

async function main() {
    await mongoose.connect(process.env.MONGODB_URI!, {
        dbName: process.env.DATABASE_NAME,
    });

    const unpaidUsers = await User.find({ isPaid: true }, 'email');

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
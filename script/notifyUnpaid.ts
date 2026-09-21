import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `نتمنى لك دخولاً مدرسياً موفقاً وسنة دراسية مليئة بالنشاط والنجاح! 📚⚡

نعلم أن بداية السنة الدراسية كأستاذ للتربية البدنية والرياضية تكون مليئة بالضغط وتحضير الوثائق.. ولهذا السبب تحديداً قمنا بإطلاق أضخم تحديث على منصة EPS DZ!

لقد قمنا بتطوير المنصة وإضافة أكثر من 700 تمرين رياضي جاهز، إلى جانب الأدوات الذكية التي تُعد لك المذكرات البيداغوجية، شبكات التقويم، 

لماذا تضيع وقتك في التحضير اليدوي هذا العام بينما كل ما تحتاجه جاهز بين يديك؟

تواصل معنا للمزيد من المعلومات 0795972858

نتمنى لك يوماً رائعاً وبداية موفقّة، ونحن هنا دائماً لندعمك في كل خطوة!

مع خالص التقدير،

EPS DZ `;

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
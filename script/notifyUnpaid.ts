import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `تحديث ضخم ! 📚⚡

السلام عليكم أستاذ(ة)،

نعرف أن وقتكم ثمين وأن الميدان متعب، لذلك استمعنا لملاحظاتكم وعملنا على التحديث 2.0 :

 الاختبار الميداني (جديد): الهاتف ينادي التلميذ، الميقاتي يسجل النتيجة، وكل شيء يحفظ تلقائيا في بطاقة التقويم التشخيصي. (الان لا تحتاج حتى لكتابة الاداء).

(مسيرتك التربوية محفوظة الان) حفظ المذكرات : طلبتموه، وأصبح متوفرا. عدلوا بطاقتكم واحفظوها وارجعوا إليها متى شئتم.

 مخطط التوزيع السنوي للابتدائي: جاهز للطباعة وفق الرزنامة الرسمية 2026/2027.

 لحماية وثائقكم وخصوصية المنصة، أصبح اسمكم ثابتا على كل الوثائق. إن احتاج تصحيحا، راسلونا ونعدله فورا.

مع خالص التقدير，

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
import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => ` لاول مرة في الجزائر.

📚 والمفاجأة الكبرى: مكتبة الأساتذة
لأول مرة، أساتذة التربية البدنية في كل الجزائر في مكان واحد.
أستاذ في وهران حضّر وحدة رائعة في كرة اليد؟ ينشرها بضغطة… وأستاذة في سطيف تنسخها إلى حسابها بضغطة أخرى.
قيّم، علّق، اسأل، شارك تجربتك في القسم.
وربما… تصبح وحدتك أنت الأكثر نسخا في الجزائر 🏆

⚡ البطاقة الجاهزة
تفتح البطاقة التقنية، تضغط «بطاقة جاهزة»… وها هي.
EPS DZ يعرف أين وصلت في الدفتر اليومي، ويعرف وحدتك التعلمية، فيحضّر لك بطاقة واحدة لكل مستوى: الحصة الصحيحة، المؤشر، التمارين، الأهداف، الكفاءة القاعدية.
7 أقسام أولى ثانوي؟ بطاقة واحدة. راجعها، اطبعها، انتهى.

✏️ بطاقة تبهر المفتش
التمارين أصبحت مرسومة: الأروقة، الأقماع، الملعب، مكان الأستاذ والتلاميذ… في الثانوي والابتدائي.
والطباعة؟ صفحة A4 واحدة. دائما. مهما كان عدد التمارين.

💾 ولأن التفاصيل تهمّ
• بطاقة الابتدائي تُحفظ وتُفتح من جديد
• الوحدة تحفظ الكفاءة القاعدية والتواريخ
• الدفتر اليومي يكتب الهدف حتى عند عدم إنجاز الحصة
• قائمة جرد الوسائل تُحفظ

كل هذا موجود الآن في حسابك.

وإن أعجبك التحديث، ابعث هذا البريد لزميل واحد. كلما كبرت المكتبة، استفاد الجميع.

أسبوعا خفيفا وحصصا ممتعة 💪

فريق EPS DZ
`;

async function main() {
    await mongoose.connect(process.env.MONGODB_URI!, {
        dbName: process.env.DATABASE_NAME,
    });

    const unpaidUsers = await User.find({ isPaid: true}, 'email');

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
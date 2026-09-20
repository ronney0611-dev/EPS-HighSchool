import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `شكراً لكونك مشتركاً مميزاً معنا!

يسعدنا أن نعلن لك عن تحديث جديد لحسابك المدفوع. ابتداءً من اليوم، أصبح بإمكانك الوصول إلى مكتبتنا الجديدة التي تضم أكثر من 99 لعبة متنوعة بانتظارك لاستكشافها وخوض التحدي!

سواء كنت تبحث عن الإثارة، ألعاب الذكاء، أو التسلية السريعة، ستجد كل ما تحبه في مكان واحد.

استمتع بالتحديث الجديد، ونشكرك دائماً على ثقتك ودعمك المستمر لنا!

مع أطيب التحيات،

مطور منصة EPSDZ `;

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
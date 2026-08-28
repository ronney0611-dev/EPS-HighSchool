import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `السلام عليكم أستاذ(ة)，

لاحظنا أنك سجلت مؤخرًا في منصة EPSDZ، ونود أن نطمئن عليك ونسألك إذا واجهتك أي مشكلة أو استفسار أثناء استخدام المنصة، رأيك يهمنا كثيرًا في تطوير المنصة لخدمتك بشكل أفضل.

لا تتردد في التواصل معي مباشرة عبر الهاتف او الواتساب : 0795972858

بانتظار ردك، وشكرًا لك على وقتك.

مع خالص التقدير، منصة EPSDZ`;

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
                subject: 'هل واجهتك مشكلة في EPSDZ؟',
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
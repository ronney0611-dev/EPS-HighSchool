import { config } from 'dotenv';
config({ path: '.env.local' });
import User from '../app/models/User';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEXT = () => `تحديث ! 📚⚡

تعلن منصة EPSDZ اساذة الطور الثانوي عن توفر الدفتر اليومي الالكتروني

تواصل معنا للمزيد من المعلومات 0795972858

نتمنى لك يوماً رائعاً وبداية موفقّة، ونحن هنا دائماً لندعمك في كل خطوة!

مع خالص التقدير،

EPS DZ `;

async function main() {
    await mongoose.connect(process.env.MONGODB_URI!, {
        dbName: process.env.DATABASE_NAME,
    });

    const unpaidUsers = await User.find({ level: 'lycee' }, 'email');

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
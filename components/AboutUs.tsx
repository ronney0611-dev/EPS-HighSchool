import { Code, Award, Users, Mail, Phone, UserCheck } from 'lucide-react'

// Common className constant for section containers to maintain width consistency
const SECTION_CONTAINER_CLASS = "max-w-[1400px] mx-auto px-6 md:px-12 py-4 md:py-28";

const AboutUs = () => {
    return (
        // Main dark background wrapper
        <div dir='rtl' className="w-full bg-black items-center text-white font-sans antialiased dir-rtl min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": "بن حمادة محمد",
                        "jobTitle": "أستاذ التربية البدنية والرياضية / مطور Full-Stack",
                        "url": "https://epsdz.com",
                        "email": "mailto:mohammedbenhamada0611@gmail.com",
                        "worksFor": {
                            "@type": "Organization",
                            "name": "EPS DZ",
                            "url": "https://epsdz.com"
                        }
                    })
                }}
            />
            <section className={SECTION_CONTAINER_CLASS}>
                <div className="grid md:grid-cols-12 gap-12 items-center">

                    <div className="md:col-span-7 space-y-6">
                        <div className="flex items-center gap-3 text-red-500">
                            <UserCheck className="w-10 h-10 ml-4" />
                            <h2 className="text-4xl md:text-4xl font-bold text-red-500 tracking-tight">بن حمادة محمد</h2>
                        </div>

                        <p className="text-xl text-neutral-200 leading-relaxed font-medium">
                            استاذ التربية البدنية والرياضية تعليم ثانوي, مؤسس ومطور منصة <strong className='text-red-500'>EPSDZ</strong>.
                        </p>

                        <p className="text-xl text-neutral-200 leading-relaxed border-r-4 border-red-600 pr-4 my-4 font-semibold">
                            صُممت هذه المنصة من قلب الميدان لخدمة أستاذ التربية البدنية. رقمنة حقيقية، أدوات بيداغوجية جبارة، وتوفير تام للوقت والجهد.
                        </p>
                    </div>

                    {/* Visual Element (Large Screen Right/Bottom) */}
                    <div className="md:col-span-5 bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-5 bg-black rounded-full border-4 border-red-600 shadow-xl">
                            <Code className="w-16 h-16 text-red-600" />
                        </div>
                        <p className="text-neutral-500 font-mono text-sm">DEVELOPMENT / PEDAGOGY</p>
                        <p className="text-2xl font-semibold text-white">Full-Stack Solution for PE</p>
                    </div>
                </div>
            </section>


            {/* =========================================
          3. Special Thanks Section (The 'Impact' part)
          ========================================= */}
            <div className="w-full bg-neutral-950 border-y border-neutral-800">
                <section className={SECTION_CONTAINER_CLASS}>
                    <header className="text-center mb-16 flex flex-col items-center space-y-3">
                        <div className="flex items-center justify-center gap-3 text-red-600">
                            <Award className="w-9 h-9" />
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                لا يَشكُرُ اللهَ مَن لا يَشكُرُ النَّاسَ
                            </h2>
                        </div>
                        <p className="text-xl text-neutral-400 max-w-3xl mx-auto">لم يكن لهذا العمل أن يرى النور لولا دعم وتوجيه كفاءات وشخصيات مخلصة  </p>
                    </header>

                    <div className="grid lg:grid-cols-2 gap-10">

                        {/* Inspector Thanks Card - Highlighted */}
                        <div className="bg-red-600 p-10 rounded-3xl shadow-2xl border-4 border-red-700 space-y-6 transform hover:-translate-y-2 transition-transform duration-300">
                            <h3 className="text-3xl font-bold text-white flex flex-col md:flex-row items-center gap-3">
                                <span>مفتشة التربية البدنية :</span>
                                <span className="font-extrabold text-white">اسلمى نورية</span>
                            </h3>
                            <p className="text-lg text-red-50 leading-relaxed font-medium">
                                نتقدم بأسمى عبارات الشكر والتقدير اليها، نظيرا لإشرافها الدقيق، وتوجيهاتها البيداغوجية القيمة، ومعلوماتها السديدة التي كان لها الأثر البالغ في إثراء محتوى المنصة وضبطها وفق أرقى المعايير التعليمية المطلوبة. شكراً لكونكِ منارة للعلم والاحترافية.
                            </p>
                        </div>

                        {/* Friends/Teachers Thanks Card - Complementary */}
                        <div className="bg-black p-10 rounded-3xl shadow-xl border border-neutral-800 space-y-6 hover:border-red-900 transition-colors">
                            <div className="flex items-center gap-4 text-red-600">
                                <Users className="w-10 h-10" />
                                <h3 className="text-3xl font-bold text-white">الزملاء والأساتذة الأصدقاء</h3>
                            </div>
                            <p className="text-lg text-neutral-300 leading-relaxed">
                                كل الشكر والامتنان لزملائي أساتذة التربية البدنية والأصدقاء المقربين. شكراً لكم على وقتكم في تجريب المنصة، ملاحظاتكم النقدية البناءة، واقتراحاتكم التي ساهمت بشكل مباشر في تطوير الأدوات وتحسين تجربة المستخدم لتناسب احتياجات الأستاذ الجزائري. دعمكم هو وقودنا للاستمرار.
                            </p>
                        </div>

                    </div>
                </section>
            </div>


            {/* =========================================
          4. Contact Section (The 'Action' part)
          ========================================= */}
            <section className={`${SECTION_CONTAINER_CLASS} text-center`}>
                <div className="bg-neutral-950 p-12 md:p-20 rounded-[2rem] border border-neutral-800 shadow-inner flex flex-col items-center">
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        نحن نقدر رأيك! إذا كان لديك أي استفسار، اقتراح للتطوير، أو تحتاج إلى دعم فني، فلا تتردد في الاتصال بنا مباشرة. رأيكم يهمنا لبناء مستقبل أفضل للرياضة المدرسية.
                    </p>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-white w-full max-w-4xl">

                        {/* Email Link Card */}
                        <div
                            dir='ltr'
                            className="group flex items-center gap-4 px-8 py-5 bg-black rounded-2xl border-2 border-neutral-800 hover:border-red-600 hover:bg-neutral-900 transition-all duration-300 w-full justify-center shadow-lg"
                        >
                            <Mail className="w-8 h-8 text-neutral-600 group-hover:text-red-500 transition-colors" />
                            <div className="flex flex-col items-start">
                                <span className="text-sm text-neutral-500 group-hover:text-neutral-300">البريد الإلكتروني</span>
                                <span className="text-xs lg:text-lg font-bold dir-ltr tracking-wide group-hover:text-red-500">mohammed<br/>benhamada0611<br />@gmail.com</span>
                            </div>
                        </div>

                        {/* Phone Link Card */}
                        <div
                            dir='ltr'
                            className="group flex items-center gap-4 px-8 py-5 bg-black rounded-2xl border-2 border-neutral-800 hover:border-red-600 hover:bg-neutral-900 transition-all duration-300 w-full justify-center shadow-lg"
                        >
                            <Phone className="w-8 h-8 text-neutral-600 group-hover:text-red-500 transition-colors" />
                            <div className="flex flex-col items-start">
                                <span className="text-sm text-neutral-500 group-hover:text-neutral-300">رقم الهاتف</span>
                                <span className="text-xl font-bold dir-ltr tracking-wide group-hover:text-red-500">07 95972858</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    )
}

export default AboutUs
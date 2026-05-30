'use client'

import { assets } from "@/public/videos/assets";
import BorderAnimationButton from "@/src/components/nurui/border-button";

const Hero = () => {
    return (
        <>
            <style>
                {`
                    @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
                    *{
                        font-family: "Poppins", sans-serif;
                    }
                    @keyframes rotate {
                        100% {
                            transform: rotate(1turn);
                        }
                    }
            
                    .rainbow::before {
                        content: '';
                        position: absolute;
                        z-index: -2;
                        left: -50%;
                        top: -50%;
                        width: 200%;
                        height: 200%;
                        background-position: 100% 50%;
                        background-repeat: no-repeat;
                        background-size: 50% 30%;
                        filter: blur(6px);
                        background-image: linear-gradient(#FFF);
                        animation: rotate 4s linear infinite;
                    }
                `}
            </style>

            <header dir="rtl" className='bg-black lg:mt-[-20] lg:mb-[-100] text-white flex flex-col items-center bg-[url("https://assets.prebuiltui.com/images/components/hero-section/hero-background-image.png")] bg-cover bg-center bg-no-repeat pb-10'>

                <div className="rainbow mt-8 lg:mt-20 relative z-0 bg-white/15 overflow-hidden p-px flex items-center justify-center rounded-full transition duration-300 active:scale-100 md:mt-32">
                    <button className="flex items-center justify-center gap-3 pl-4 pr-6 py-3 text-white rounded-full font-medium bg-gray-900/80 backdrop-blur">
                        <div className="relative flex size-3.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-[#A6FF5D] opacity-75 animate-ping duration-300"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-[#A6FF5D]"></span>
                        </div>
                        <span className='text-xs'>designed for Sport Teachers</span>
                    </button>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-center max-w-4xl tracking-wide leading-tight px-4 mt-8 bg-linear-to-b from-white to-gray-300 bg-clip-text text-transparent font-['Cairo',sans-serif]">
                    مستقبل التعليم بين يديك.<span className="text-red-500"> قف في الملعب</span>، ودع تطبيقنا يتولى صياغة وثائقك البيداغوجية في ثوان.
                </h1>
                <p className="text-center text-sm md:text-lg text-gray-400 max-w-2xl mx-auto mt-6 px-6 leading-relaxed font-['Tajawal',sans-serif]">
                    ودع الأوراق المبعثرة وساعات الصياغة الطويلة. ركّز جهدك على تدريب وتطوير طلابك، ونحن من نتكفل بجميع الوثائق؛ من قوائم الأقسام والتلاميذ إلى رصد النقاط وإرسالها للإدارة.
                </p>

                <div className='flex flex-col sm:flex-row gap-4 md:gap-6 my-10 justify-center items-center mx-4 [font-family:\ Cairo\,sans-serif]'>

                    <div className="text-center w-full sm:w-auto" onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        <BorderAnimationButton text="تصفح العروض والخدمات 📋" />
                    </div>

                    {/* الزر الثاني: التواصل المباشر لحل مشاكل الدفع أو الإجابة على استفسارات الأساتذة */}
                    <a
                        href="https://wa.me/+213558241309?text=مرحباً،%20أريد%20الاستفسار%20عن%20تطبيق%20الوثائق%20البيداغوجية"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center w-full sm:w-auto block"
                    >
                        <BorderAnimationButton text="تواصل معنا عبر واتساب 💬" />
                    </a>

                </div>

                <div className=" lg:my-10 w-full max-w-4xl mx-auto px-4  relative flex items-center justify-center">
                    {/* Video with spinning glow border */}
                    <video controls loop playsInline
                        className='rounded-3xl w-full relative'
                        style={{
                            zIndex: 1,
                            animation: 'glowSpin 4s linear infinite',
                        }}>
                        <source src={assets.video} type="video/mp4" />
                    </video>
                </div>


            </header >
        </>
    )
}

export default Hero;
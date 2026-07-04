'use client'

import { assets } from "@/public/videos/assets";
import BorderAnimationButton from "@/src/components/nurui/border-button";
import Offers from "./Offers";

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

                <h1 className="text-3xl mt-20 md:text-5xl font-extrabold text-center max-w-4xl tracking-wide leading-tight px-4 bg-linear-to-b from-white to-gray-300 bg-clip-text text-transparent font-['Cairo',sans-serif]">
                    <span className="text-red-500"> قف في الملعب</span> و دع تطبيقنا يتولى صياغة وثائقك البيداغوجية في ثوان.
                </h1>
                <p className="text-center text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mt-6 px-6 leading-relaxed font-['Tajawal',sans-serif]">
                    ودع الأوراق المبعثرة وساعات الصياغة الطويلة. ركّز جهدك على تدريب وتطوير طلابك، ونحن من نتكفل بجميع الوثائق؛ من قوائم الأقسام والتلاميذ إلى رصد النقاط وإرسالها للإدارة.
                </p>

                <div className='flex flex-col sm:flex-row gap-4 md:gap-6 my-10 justify-center items-center mx-4 [font-family:\ Cairo\,sans-serif]'>

                    <div className="text-center w-full sm:w-auto" onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        <BorderAnimationButton text="تصفح العروض والخدمات 📋" />
                    </div>
                    <a
                        href="https://wa.me/+213795972858?text=مرحباً،%20أريد%20الاستفسار%20عن%20تطبيق%20الوثائق%20البيداغوجية"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center w-full sm:w-auto block"
                    >
                        <BorderAnimationButton text="تواصل معنا عبر واتساب 💬" />
                    </a>

                </div>

                <div className=" lg:my-10 w-full max-w-4xl mx-auto px-4  relative flex items-center justify-center">
                    {/* Video with spinning glow border */}
                    <div className="lg:my-10 w-full max-w-4xl mx-auto px-4 relative flex items-center justify-center">
                        <iframe
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            src='https://www.youtube.com/embed/uBFFxl2f-S0'
                            className='rounded-3xl w-full aspect-video relative'
                            style={{
                                zIndex: 1,
                                animation: 'glowSpin 4s linear infinite',
                            }}
                        />
                    </div>
                </div>
                <Offers />
            </header >
        </>
    )
}

export default Hero;
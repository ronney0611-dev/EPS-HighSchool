'use client'

import Image from "next/image";
import Link from "next/link";
import React from "react";

const Hero = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

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

                <div className="rainbow relative z-0 bg-white/15 overflow-hidden p-px flex items-center justify-center rounded-full transition duration-300 active:scale-100 mt-8 md:mt-32">
                    <button className="flex items-center justify-center gap-3 pl-4 pr-6 py-3 text-white rounded-full font-medium bg-gray-900/80 backdrop-blur">
                        <div className="relative flex size-3.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-[#A6FF5D] opacity-75 animate-ping duration-300"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-[#A6FF5D]"></span>
                        </div>
                        <span className='text-xs'>Designed for Sport Teachers</span>
                    </button>
                </div>

                <h1 className="text-4xl md:text-[64px]/[82px] text-center max-w-4xl mt-5 bg-clip-text leading-tight px-4">
                    أدر وثائقك البيداغوجية بسهولة | بطاقات التقويم، البرمجة السنوية، والتمارين، كل شيء في مكان واحد
                </h1>
                <p className="text-center text-xl text-gray-200 my-6">
                    منصة رقمية مخصصة لأساتذة التربية البدنية والرياضية في الجزائر. أنشئ بطاقات التقويم، برمج حصصك، وولّد تمارينك بضغطة زر واحدة.
                </p>

                <div className="mx-4 my-10 grid lg:grid-cols-2 gap-6 sm:grid-rows-2">
                    <div className="flex flex-col items-center text-center border border-gray-500 rounded-2xl py-2 transition-transform duration-300 hover:scale-102 " >
                        <Link href={`/documents`} >
                            <Image src={'/images/Entraîneur avec un clipboard sur le terrain.png'} alt="sport teacher" width={'200'} height={100}
                                className="rounded-2xl my-2" />

                        </Link>
                        <div>
                            <p className="text-lg my-2 px-4" >
                                أنشئ بطاقات تقويم رسمية بسرعة | أدخل أسماء التلاميذ، سجّل النتائج، واحسب النسب المئوية تلقائياً ثم صدّرها كملف
                                PDF جاهز للطباعة |
                                نماذج البرمجة السنوية والمخططات الجاهزة لجميع المستويات — حمّلها مباشرة ووفّر وقتك
                            </p>
                        </div>
                        <Link href={`/documents`} className="rainbow my-4 relative z-0 bg-white/15 overflow-hidden p-px flex items-center justify-center rounded-full transition duration-300 active:scale-100">
                            <button className="flex items-center justify-center gap-3 cursor-pointer pl-4 pr-6 py-3 text-white rounded-full font-medium bg-gray-900/80 backdrop-blur">
                                <div className="relative flex size-3.5 items-center justify-center">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#A6FF5D] opacity-75 animate-ping duration-300"></span>
                                    <span className="relative inline-flex size-2 rounded-full bg-[#A6FF5D]"></span>
                                </div>
                                <span className='text-lg px-4'>اكتشف المزيد</span>
                            </button>
                        </Link>
                    </div>
                    <div className="flex flex-col items-center text-center border border-gray-500 rounded-2xl py-2  transition-transform duration-300 hover:scale-102" >
                        <Link href={`/exercises`} >
                            <Image src={'/images/Sports en action.png'} alt="sport teacher" width={200} height={100}
                                className="rounded-2xl my-2 object-contain" />
                        </Link>
                        <div>
                            <p className="text-lg my-2 px-4 flex text-center  " >
                                - تمارين جاهزة لكل نشاط -
                                كرة الطائرة، كرة السلة، كرة اليد، الجري السريع والمزيد <br /> اختر النشاط، صف ما تحتاجه، <br /> وذكاؤنا الاصطناعي يقترح عليك التمارين المناسبة فوراً.
                            </p>
                        </div>
                        <Link href={`/exercises`} className="rainbow my-4 relative z-0 bg-white/15 overflow-hidden p-px flex items-center justify-center rounded-full transition duration-300 active:scale-100">
                            <button className="flex items-center justify-center gap-3 cursor-pointer pl-4 pr-6 py-3 text-white rounded-full font-medium bg-gray-900/80 backdrop-blur">
                                <div className="relative flex size-3.5 items-center justify-center">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#A6FF5D] opacity-75 animate-ping duration-300"></span>
                                    <span className="relative inline-flex size-2 rounded-full bg-[#A6FF5D]"></span>
                                </div>
                                <span className='text-lg px-4'>اكتشف المزيد</span>
                            </button>
                        </Link>
                    </div>
                </div>


            </header >
        </>
    )
}

export default Hero;
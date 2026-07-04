"use client";

import React, { useRef, useEffect, useState } from "react";
import { features } from "@/src/config/features";
import GradientText from "./GradientText";

function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{
                transitionDelay: `${index * 0.1}s`,
            }}
            className={`bg-white border-2 border-gray-200 rounded-[20px] p-8 flex flex-col gap-4 relative overflow-hidden transition-all duration-550 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
                }`}
        >
            {/* Decorative colored corner */}
            <div
                style={{ background: f.bg }}
                className="absolute top-0 right-0 w-30 h-30 rounded-bl-[100%] rounded-tr-[20px] opacity-70"
            />

            {/* Icon */}
            <div className="text-[36px] current-line-height-1 z-10">{f.icon}</div>

            {/* Content wrapper */}
            <div className="z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-[1.4] font-['Noto_Kufi_Arabic','Cairo',sans-serif]">
                    {f.title}
                </h3>
                <p className="text-lg text-red-500 font-semibold mb-3 ">
                    {f.pain}
                </p>
                <p className="text-md text-gray-900 leading-[1.8] m-0 ">
                    {f.value}
                </p>
            </div>

            {/* Stats footer panel */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-baseline gap-2 z-10">
                <span
                    style={{ color: f.color }}
                    className="text-[28px] font-extrabold font-['Cairo',sans-serif]"
                >
                    {f.stat}
                </span>
                <span className="text-[13px] text-gray-700 font-['Noto_Kufi_Arabic','Cairo',sans-serif]">
                    {f.statLabel}
                </span>
            </div>
        </div>
    );
}

export default function WhatWeOffer() {
    const [headerVisible, setHeaderVisible] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setHeaderVisible(true); },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section dir="rtl" id="features-section" className="py-20 px-6 w-full mx-auto font-['Noto_Kufi_Arabic','Cairo',sans-serif]">
            {/* Animated Main Header Block */}
            <div
                ref={headerRef}
                className={`text-center mb-14 transition-all duration-600 ease-out ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
            >
                <div className="flex items-center justify-center gap-3 mx-auto">
                    <hr className='border border-white w-full my-4 mx-8' />
                    <div className='flex justify-center text-center w-full'>
                        <GradientText
                            colors={["#ffffff", "#ff0000", "#ffffff"]}
                            animationSpeed={5}
                            showBorder={false}
                            className="custom-class my-6 text-5xl md:text-6xl lg:text-6xl"
                        >
                            لماذا تختارنا؟
                        </GradientText>
                    </div>
                    <hr className='border border-white w-full my-4 mx-8' />
                </div>

                <h2 className="text-[clamp(0.75rem,4vw,1.75rem)] font-extrabold text-gradient-red my-4 leading-[1.35]">
                    كل ما تحتاجه كأستاذ تربية بدنية
                    <span className="text-red-600 mx-2">في مكان واحد</span>
                </h2>

                <p className="text-[16px] text-white max-w-130 mx-auto leading-[1.9]">
                    المنصة الأولى في الجزائر المصممة خصيصاً لأستاذ التربية البدنية والرياضية. وفّر وقتك، نظّم عملك، وركّز على ما يهم — تلاميذك.
                </p>
            </div>

            {/* Dynamic Features Grid layout */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-16">
                {features.map((f, i) => (
                    <FeatureCard key={i} f={f} index={i} />
                ))}
            </div>

            {/* High-Converting Pricing CTA Card */}
            <div className="bg-linear-to-br from-white to-gray-300 rounded-[24px] p-8 md:p-10 text-center text-black shadow-xl">
                <p className="text-[20px] font-semibold mb-2 tracking-wide uppercase">
                    لا تضيّع وقتك أكثر
                </p>
                <h3 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold mb-3 leading-[1.4]">
                    ابدأ العام الدراسي بشكل مختلف هذه المرة
                </h3>
                <p className="text-[15px] opacity-85 max-w-120 mx-auto leading-[1.8] mb-8">
                   <span className="font-bold text-2xl text-red-600"> بـ 3000 دج فقط، للعام الدراسي كاملا</span>    — أقل من تكلفة كراريس — احصل على منصة كاملة حتى 01 جويلية 2027.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    <a
                        href="/payment"
                        className="bg-white text-blue-700 font-bold text-[15px] px-8 py-3.5 rounded-xl inline-block transition-transform duration-200 hover:scale-[1.03] shadow-md"
                    >
                        احصل على العرض الآن ←
                    </a>
                </div>
            </div>

        </section>
    );
}
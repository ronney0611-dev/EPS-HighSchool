"use client";

import React, { useRef, useEffect, useState } from "react";
import { features } from "@/src/config/features";
import GradientText from "./GradientText";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { FileSpreadsheet, Layers, FileCheck2, ArrowLeft, CheckCircle2 } from "lucide-react";

function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${(index % 4) * 0.08}s` }}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-red-600/40 hover:bg-neutral-900/90 hover:shadow-lg hover:shadow-red-600/5 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
        >
            {/* Subtle Background Radial Glow */}
            <div
                style={{ background: f.color || "#ef4444" }}
                className="absolute -top-12 -left-12 h-24 w-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
            />

            <div className="space-y-3 z-10 relative">
                {/* Header: Icon + Badge Stat */}
                <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/90 border border-neutral-700/60 text-xl">
                        {f.icon}
                    </div>
                    
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white leading-snug">
                    {f.title}
                </h3>



                {/* Solution Description */}
                <p className="text-xs text-neutral-400 leading-relaxed pt-1">
                    {f.pain}
                </p>
            </div>

            {/* Footer Stat Label */}
            <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 z-10 relative">
                <span>{f.statLabel}</span>
                <CheckCircle2 size={13} className="text-red-500 opacity-80" />
            </div>
        </div>
    );
}

export default function WhatWeOffer() {
    const [headerVisible, setHeaderVisible] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    const { data: session, status, update } = useSession();
    const [paymentStatus, setPaymentStatus] = useState<'checking' | 'none' | 'pending' | 'rejected'>('checking');
    const [livePaid, setLivePaid] = useState<boolean>(false);

    const isPaid = session?.user.isPaid || livePaid;

    useEffect(() => {
        const handleFocus = () => {
            if (status === 'authenticated') update();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [status, update]);

    useEffect(() => {
        if (status !== 'authenticated' || !session || session.user.isPaid) return;

        let cancelled = false;
        axios.get('/api/payment/manual')
            .then((res) => {
                if (cancelled) return;
                const payments = res.data?.payments || [];
                const dbPaid = res.data?.isPaid ?? false;

                if (dbPaid) {
                    setLivePaid(true);
                    return;
                }

                const hasPending = payments.some((p: { status: string }) => p.status === 'PENDING');
                const latestRejected = payments.find((p: { status: string }) => p.status === 'REJECTED');
                setPaymentStatus(hasPending ? 'pending' : latestRejected ? 'rejected' : 'none');
            })
            .catch(() => {
                if (!cancelled) setPaymentStatus('none');
            });

        return () => { cancelled = true; };
    }, [status, session]);

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setHeaderVisible(true); },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section dir="rtl" id="features-section" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto font-['Noto_Kufi_Arabic','Cairo',sans-serif]">

            <div className="flex items-center justify-center gap-3 mx-auto mb-4">
                <hr className='border border-white w-full my-4 ' />
                <div className='flex justify-center text-center w-full'>
                    <GradientText
                        colors={["#ffffff", "#ff0000", "#ffffff"]}
                        animationSpeed={5}
                        showBorder={false}
                        className="custom-class mb-6 text-3xl md:text-4xl p-4 "
                    >
                        لماذا تختارنا ؟
                    </GradientText>
                </div>
                <hr className='border border-red-500 w-full my-4 ' />
            </div>
            {/* Header */}
            <div
                ref={headerRef}
                className={`text-center mt-10 mb-16 transition-all duration-500 ease-out ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    }`}
            >
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    كل ما تحتاجه كأستاذ تربية بدنية <span className="text-red-500  decoration-red-600/80 ">في مكان واحد</span>
                </h2>
            </div>

            {/* 3-Step Compact Workflow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-16 border border-neutral-800/80 bg-neutral-900/40 p-3 sm:p-4 rounded-xl">
                <div className="flex items-center gap-3 p-3 bg-neutral-900/70 rounded-lg border border-neutral-800">
                    <div className="p-2 rounded-md bg-red-600/10 text-red-500 shrink-0">
                        <FileSpreadsheet size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-bold text-red-500">بداية الفصل</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">رفع ملف التلاميذ الاقسام (Excel)</h4>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-900/70 rounded-lg border border-neutral-800">
                    <div className="p-2 rounded-md bg-red-600/10 text-red-500 shrink-0">
                        <Layers size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-bold text-red-500">خلال الفصل</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">توليد المذكرات وجميع الوثائق بلمسة واحدة</h4>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-900/70 rounded-lg border border-neutral-800">
                    <div className="p-2 rounded-md bg-red-600/10 text-red-500 shrink-0">
                        <FileCheck2 size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-bold text-red-500">نهاية الفصل</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">نملء النقاط ونرسلها للادارة</h4>
                    </div>
                </div>
            </div>

            {/* 8 Feature Cards Grid (4 cols on Desktop, 2 on Tablet) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {features.map((f, i) => (
                    <FeatureCard key={i} f={f} index={i} />
                ))}
            </div>

            {/* Call to Action Banner */}

            <div className="relative overflow-hidden mt-16 rounded-3xl border border-neutral-800 bg-linear-to-br from-neutral-900 via-neutral-950 to-black p-8 sm:p-12 text-center text-white shadow-2xl">
                <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
                <span className="inline-block px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/30 text-red-400 text-xs font-bold mb-4 tracking-wide">
                    اشتراك سنوي شامل بدون مصاريف خفية
                </span>
                <h3 className="text-2xl sm:text-4xl font-black mb-4 leading-tight">
                    جاهز لتوديع المشاكل الورقية؟ <span className="text-red-500">ابدأ الآن</span>
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed mb-8">
                    مقابل <span className="font-extrabold text-red-500 text-xl mx-1">3000 دج فقط</span> للعام الدراسي كاملاً (حتى 01 جويلية 2027) — احصل على تفعيل فوري وشامل لجميع أوراقك ومذكراتك التربوية.
                </p>

                {status !== 'loading' && (
                    session ? (
                        isPaid ? (
                            <div className="flex justify-center">
                                <Link
                                    href="/documents"
                                    className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-green-600 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-green-900/20"
                                >
                                    حسابك مفعل الآن — الانتقال للوثائق
                                    <ArrowLeft size={18} />
                                </Link>
                            </div>
                        ) : paymentStatus === 'pending' ? (
                            <div className="flex justify-center">
                                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm px-8 py-4 rounded-xl cursor-default">
                                    شكرًا لثقتك! جاري مراجعة طلب التفعيل الخاص بك...
                                </span>
                            </div>
                        ) : paymentStatus === 'rejected' ? (
                            <div className="flex justify-center">
                                <a
                                    href="/payment"
                                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-red-900/30"
                                >
                                    تم رفض الطلب précédent — إعادة المحاولة
                                    <ArrowLeft size={18} />
                                </a>
                            </div>
                        ) : paymentStatus === 'checking' ? (
                            <div className="flex justify-center">
                                <span className="bg-neutral-800 text-neutral-400 font-bold text-sm px-8 py-4 rounded-xl cursor-default">
                                    جاري التحقق من حالة الحساب...
                                </span>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <a
                                    href="/payment"
                                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-red-900/30"
                                >
                                    فعل حسابك الآن عبر BaridiMob / CCP
                                    <ArrowLeft size={18} />
                                </a>
                            </div>
                        )
                    ) : (
                        <div className="flex justify-center">
                            <a
                                href="/login"
                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-red-900/30"
                            >
                                سجل الدخول وابدأ الآن
                                <ArrowLeft size={18} />
                            </a>
                        </div>
                    )
                )}
            </div>

        </section>
    );
}
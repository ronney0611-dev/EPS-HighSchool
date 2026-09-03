'use client'

import Offers from "./Offers";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Testimonials from "./Trstimonials";

const Hero = () => {

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

    return (
        <>
            <style>
                {`
                    @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap");

                    .hero-font {
                         font-family: 'Cairo', system-ui, -apple-system, sans-serif;
                    }                       

                    @keyframes softGlowPulse {
                        0%, 100% {
                            box-shadow: 0 0 20px rgba(239, 68, 68, 0.25), 0 0 40px rgba(99, 102, 241, 0.12);
                        }
                        50% {
                            box-shadow: 0 0 35px rgba(239, 68, 68, 0.45), 0 0 60px rgba(99, 102, 241, 0.22);
                        }
                    }

                    .video-glow {
                        animation: softGlowPulse 4s ease-in-out infinite;
                    }
                `}
            </style>

            <header dir="rtl" className='hero-font mt-6 relative bg-zinc-950 text-white flex flex-col items-center overflow-hidden pb-12 pt-8 '>

                {/* Sub-Header Announcement Badge */}
                <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-[11px] sm:text-xs font-medium text-zinc-300 mb-5 backdrop-blur-md">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>EPSDZ</span>
                </div>

                {/* Main Heading */}
                <h1 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-bold text-center max-w-3xl tracking-normal leading-relaxed px-4 text-white">
                    <span className="text-red-500 font-extrabold">قف في الملعب.</span> واترك تطبيقنا يتولى صياغة وثائقك البيداغوجية في ثوان
                </h1>

                {/* Subtitle */}
                <p className="relative z-10 text-center text-xs sm:text-sm md:text-base text-zinc-400 max-w-xl mx-auto mt-4 px-6 leading-relaxed font-normal">
                   من ملف إكسل واحد إلى دفتر الوثائق التربوية كاملاً
                </p>

                {/* Navbar-Styled Buttons */}
                <div className="relative z-10 flex flex-col sm:flex-row gap-3 my-8 justify-center items-center w-full max-w-2xl px-4">

                    {
                        status !== 'loading' && (
                            session ? (
                                isPaid ? (
                                    <div className="flex gap-3 justify-center w-full sm:w-auto">
                                        <Link
                                            href="/documents"
                                            className="w-full sm:w-auto bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/2 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-block text-center transition-all duration-200 hover:border-blue-500/50 active:scale-95 shadow-lg shadow-blue-500/10 backdrop-blur-md"
                                        >
                                            شكرا على ثقتك بنا، حسابك مفعل الان 🎉
                                        </Link>
                                    </div>
                                ) : paymentStatus === 'pending' ? (
                                    <div className="flex gap-3 justify-center w-full sm:w-auto">
                                        <span className="w-full sm:w-auto bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-block text-center cursor-default backdrop-blur-md">
                                            شكرا على ثقتك بنا، جاري تفعيل حسابك...
                                        </span>
                                    </div>
                                ) : paymentStatus === 'rejected' ? (
                                    <div className="flex gap-3 justify-center w-full sm:w-auto">
                                        <a
                                            href="/payment"
                                            className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-block text-center transition-all duration-200 hover:border-red-500/50 active:scale-95 shadow-lg shadow-red-500/10 backdrop-blur-md"
                                        >
                                            تم رفض طلبك، يرجى المحاولة مرة أخرى ←
                                        </a>
                                    </div>
                                ) : paymentStatus === 'checking' ? (
                                    <div className="flex gap-3 justify-center w-full sm:w-auto">
                                        <span className="w-full sm:w-auto bg-zinc-900/80 border border-zinc-800 text-zinc-400 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-block text-center cursor-default backdrop-blur-md">
                                            معالجة..
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 justify-center w-full sm:w-auto">
                                        <a
                                            href="/payment"
                                            className="w-full sm:w-auto bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-block text-center transition-all duration-200 hover:border-green-500/50 active:scale-95 shadow-lg shadow-green-500/10 backdrop-blur-md"
                                        >
                                            فعل حسابك الان ←
                                        </a>
                                    </div>
                                )
                            ) : (
                                /* Blue Glow for Login/Signup (Unauthenticated) */
                                <div className="flex gap-3 justify-center w-full sm:w-auto">
                                    <a
                                        href="/login"
                                        className="w-full sm:w-auto bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl inline-block text-center transition-all duration-200 hover:border-blue-500/50 active:scale-95 shadow-lg shadow-blue-500/10 backdrop-blur-md"
                                    >
                                        سجل الدخول الآن ←
                                    </a>
                                </div>
                            )
                        )
                    }

                    <div
                        className="text-center w-full sm:w-auto cursor-pointer"
                        onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <div className="w-full sm:w-auto bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-300 border border-zinc-800/80 font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-block transition-all duration-200 hover:border-zinc-700 active:scale-95 shadow-sm backdrop-blur-md">
                            لماذا تختارنا ؟
                        </div>
                    </div>

                    <Link
                        href="/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center w-full sm:w-auto block"
                    >
                        <div className="w-full sm:w-auto bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-300 border border-zinc-800/80 font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-block transition-all duration-200 hover:border-zinc-700 active:scale-95 shadow-sm backdrop-blur-md">
                            تواصل معنا هنا ←
                        </div>
                    </Link>

                </div>

                {/* Video Player */}
                <div className="w-full max-w-3xl mx-auto px-4 relative flex items-center justify-center lg:my-6">
                    <iframe
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        src='https://www.youtube.com/embed/hTxMJjAuQZ0'
                        className='rounded-xl w-full aspect-video relative z-10 border border-zinc-800/80 video-glow'
                    />
                </div>

                <Testimonials />
                <Offers />
            </header >
        </>
    )
}

export default Hero;
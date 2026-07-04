'use client'

import React, { useState, useRef, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useSessionRefresh } from "@/hooks/useSessionRefresh";
import { useSession } from 'next-auth/react';

type PaymentMethod = 'BARIDIMOB' | 'BARIDI' | 'CHARGILY'

export default function Payment() {
    const router = useRouter()
    const [method, setMethod] = useState<PaymentMethod | null>(null)
    const [step, setStep] = useState<'select' | 'pay'>('select')
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [receiptUrl, setReceiptUrl] = useState('')
    const [transactionNumber, setTransactionNumber] = useState('')
    const [fileName, setFileName] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)
    const { refresh } = useSessionRefresh();

    const AMOUNT = 3000
    const PLAN = 'YEARLY'

    const { status } = useSession();

    useEffect(() => {
        if (status !== 'authenticated') return;

        refresh().then((data) => {
            if (data?.isPaid) {
                const params = new URLSearchParams(window.location.search);
                const callbackUrl = params.get("callbackUrl");
                window.location.href = callbackUrl || "/documents";
            }
        });
    }, [status]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/payment');
        }
    }, [status]);

    if (status === 'loading' || status === 'unauthenticated') return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setFileName(file.name)
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await axios.post('/api/upload', formData)
            setReceiptUrl(res.data.url)
        } catch {
            setError('فشل رفع الصورة، حاول مرة أخرى')
        } finally {
            setUploading(false)
        }
    }

    const handleBaridiSubmit = async () => {
        if (!receiptUrl) return setError('يرجى رفع صورة الإيصال')
        setLoading(true)
        setError('')
        try {
            await axios.post('/api/payment/manual', {
                method: 'BARIDIMOB',
                plan: PLAN,
                amount: AMOUNT,
                receiptUrl,
                transactionNumber,
            })
            setSuccess(true)
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى')
            }
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white antialiased select-none overflow-hidden" style={{ direction: 'rtl' }}>
                <Blobs />
                <Grid />
                <div className="relative z-10 w-full max-w-md m-4 bg-[#0f0f14]/80 border border-emerald-500/15 backdrop-blur-xl rounded-3xl p-10 shadow-[0_24px_64px_rgba(0,0,0,0.7)] text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                        ✅
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">تم إرسال الطلب!</h2>
                    <p className="text-gray-400 text-sm mb-8">
                        سيتم مراجعة طلبك وتفعيل حسابك خلال 24 ساعة. شكراً على ثقتك!
                    </p>
                    <button
                        onClick={() => router.push('/profile')}
                        className="w-full h-12 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl text-white text-sm font-bold transition-all duration-200"
                    >
                        العودة إلى الملف الشخصي
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white antialiased select-none overflow-hidden" style={{ direction: 'rtl' }}>
            <Blobs />
            <Grid />

            <div className="relative z-10 w-full max-w-lg m-4">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-semibold mb-4">
                        🎓 اشتراك الموسم الدراسي
                    </div>
                    <h1 className="text-3xl font-black text-white">تفعيل الحساب</h1>
                    <p className="text-gray-500 text-sm mt-2">اشترك للوصول إلى جميع مميزات المنصة</p>
                </div>

                {/* Plan card */}
                <div className="bg-[#0f0f14]/80 border border-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">الخطة المختارة</p>
                            <p className="text-white font-bold text-lg">اشتراك موسمي كامل</p>
                            <p className="text-gray-500 text-xs mt-1">وصول كامل لجميع الوثائق والأدوات</p>
                        </div>
                        <div className="text-left">
                            <p className="text-3xl font-black text-emerald-400">3000</p>
                            <p className="text-gray-500 text-xs text-left">دج / موسم</p>
                        </div>
                    </div>
                </div>

                {/* Method selection */}
                {step === 'select' && (
                    <div className="bg-[#0f0f14]/80 border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
                        <p className="text-sm font-semibold text-gray-400 mb-4">اختر طريقة الدفع</p>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <MethodCard
                                selected={method === 'BARIDIMOB'}
                                onClick={() => setMethod('BARIDIMOB')}
                                icon="📮"
                                title="بريدي موب"
                                subtitle="تحويل يدوي"
                            />
                            <MethodCard
                                selected={method === 'BARIDI'}
                                onClick={() => setMethod('BARIDI')}
                                icon="📮"
                                title="مكتب البريد ccp"
                                subtitle="تحويل يدوي"
                            />
                            <MethodCard
                                selected={method === 'CHARGILY'}
                                onClick={() => setMethod('CHARGILY')}
                                icon="💳"
                                title="Chargily"
                                subtitle="دفع تلقائي"
                                badge="قريباً"
                            />
                        </div>
                        <button
                            disabled={!method}
                            onClick={() => method && setStep('pay')}
                            className="w-full h-12 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-white text-sm font-bold transition-all duration-200"
                        >
                            متابعة →
                        </button>
                    </div>
                )}

                {/* BaridiMob payment */}
                {step === 'pay' && method === 'BARIDIMOB' && (
                    <div className="bg-[#0f0f14]/80 border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
                        <button onClick={() => setStep('select')} className="text-gray-500 hover:text-gray-300 text-xs mb-5 flex items-center gap-1 transition-colors">
                            ← رجوع
                        </button>

                        {/* Instructions */}
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 mb-5">
                            <p className="text-emerald-400 text-xs font-bold mb-3">📋 خطوات الدفع عبر بريدي موب</p>
                            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                                <li>افتح تطبيق بريدي موب</li>
                                <li>أرسل <span className="text-white font-bold">3000 دج</span> إلى الرقم:</li>
                                <div className="bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2 text-center my-2">
                                    <p dir="ltr" className="text-emerald-400 font-black text-lg tracking-widest">00799999<br></br>0023698984 83</p>
                                </div>
                                <li>خذ لقطة شاشة للإيصال ( سكرين شوت ) </li>
                                <li>ارفع الصورة أدناه وأرسل الطلب</li>
                            </ol>
                        </div>

                        {/* Transaction number */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">رقم العملية (اختياري)</label>
                            <input
                                type="text"
                                value={transactionNumber}
                                onChange={e => setTransactionNumber(e.target.value)}
                                placeholder="مثال: TXN123456"
                                className="w-full h-11 bg-white/3 border border-white/8 focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10 rounded-xl px-4 text-white text-sm outline-none transition-all duration-200 text-left"
                            />
                        </div>

                        {/* Receipt upload */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">صورة الإيصال <span className="text-red-400">*</span></label>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 ${receiptUrl ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-white/2'}`}
                            >
                                {uploading ? (
                                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : receiptUrl ? (
                                    <>
                                        <span className="text-2xl">✅</span>
                                        <span className="text-emerald-400 text-xs font-semibold">{fileName}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl">📎</span>
                                        <span className="text-gray-500 text-xs">اضغط لرفع صورة الإيصال</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center mb-4">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            disabled={loading || uploading || !receiptUrl}
                            onClick={() => { handleBaridiSubmit() }}
                            className="w-full h-12 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-white text-sm font-bold transition-all duration-200"
                        >
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'إرسال طلب التفعيل'}
                        </button>
                    </div>
                )}

                {/* Chargily - coming soon */}
                {step === 'pay' && method === 'CHARGILY' && (
                    <div className="bg-[#0f0f14]/80 border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
                        <button onClick={() => setStep('select')} className="text-gray-500 hover:text-gray-300 text-xs mb-5 flex items-center gap-1 transition-colors">
                            ← رجوع
                        </button>
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4">🚧</div>
                            <p className="text-white font-bold text-lg mb-2">قريباً</p>
                            <p className="text-gray-500 text-sm">الدفع التلقائي عبر Chargily سيكون متاحاً قريباً</p>
                        </div>
                        <button
                            onClick={() => setStep('select')}
                            className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/8 rounded-xl text-white text-sm font-semibold transition-all duration-200"
                        >
                            اختر طريقة دفع أخرى
                        </button>
                    </div>
                )}
                {step === 'pay' && method === 'BARIDI' && (
                    <div className="bg-[#0f0f14]/80 border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
                        <button onClick={() => setStep('select')} className="text-gray-500 hover:text-gray-300 text-xs mb-5 flex items-center gap-1 transition-colors">
                            ← رجوع
                        </button>

                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 mb-5">
                            <p className="text-emerald-400 text-xs font-bold mb-3">📋 خطوات الدفع عبر مكتب البريد CCP</p>
                            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                                <li>توجه إلى أقرب مكتب بريد</li>
                                <li>حوّل <span className="text-white font-bold">3000 دج</span> إلى حساب CCP رقم:</li>
                                <div className="bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2 text-center my-2">
                                    <p dir="ltr" className="text-emerald-400 font-black text-lg tracking-widest">00799999<br />0023698984 83</p>
                                </div>
                                <li>الاسم واللقب ادناه</li>
                                <div className="bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2 text-center my-2">
                                    <p dir="ltr" className="text-emerald-400 font-black text-lg tracking-widest">BENHAMADA MOHAMMED</p>
                                </div>
                                <li>رقم الهاتف ( يمكنك التواصل معنا قبل العملية )</li>
                                <div className="bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2 text-center my-2">
                                    <p dir="ltr" className="text-emerald-400 font-black text-lg tracking-widest">0795972858</p>
                                </div>
                                <li>احتفظ بوصل التحويل</li>
                                <li>ارفع صورة الوصل أدناه وأرسل الطلب</li>
                            </ol>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">رقم العملية (اختياري)</label>
                            <input
                                type="text"
                                value={transactionNumber}
                                onChange={e => setTransactionNumber(e.target.value)}
                                placeholder="مثال: TXN123456"
                                className="w-full h-11 bg-white/3 border border-white/8 focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10 rounded-xl px-4 text-white text-sm outline-none transition-all duration-200 text-left"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">صورة الوصل <span className="text-red-400">*</span></label>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 ${receiptUrl ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-white/2'}`}
                            >
                                {uploading ? (
                                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : receiptUrl ? (
                                    <>
                                        <span className="text-2xl">✅</span>
                                        <span className="text-emerald-400 text-xs font-semibold">{fileName}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl">📎</span>
                                        <span className="text-gray-500 text-xs">اضغط لرفع صورة الوصل</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center mb-4">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            disabled={loading || uploading || !receiptUrl}
                            onClick={() => { handleBaridiSubmit() }}
                            className="w-full h-12 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-white text-sm font-bold transition-all duration-200"
                        >
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'إرسال طلب التفعيل'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function MethodCard({ selected, onClick, icon, title, subtitle, badge }: {
    selected: boolean
    onClick: () => void
    icon: string
    title: string
    subtitle: string
    badge?: string
}) {
    return (
        <button
            onClick={onClick}
            className={`relative p-4 rounded-xl border text-right transition-all duration-200 ${selected
                ? 'border-emerald-500/40 bg-emerald-500/8 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'border-white/8 bg-white/2 hover:border-white/15'
                }`}
        >
            {badge && (
                <span className="absolute top-2 left-2 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 font-semibold">
                    {badge}
                </span>
            )}
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-white text-sm font-bold">{title}</p>
            <p className="text-gray-500 text-xs">{subtitle}</p>
            {selected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}
        </button>
    )
}

function Blobs() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
            <div className="absolute top-[-10%] right-[10%] w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[15%] w-100 h-100 bg-emerald-600/5 rounded-full blur-[100px]" />
        </div>
    )
}

function Grid() {
    return (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '45px 45px' }}
        />
    )
}
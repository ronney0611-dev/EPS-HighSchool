'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import axios, { AxiosError } from "axios"

const levels = [
    {
        key: 'lycee',
        label: 'ثانوي',
        sub: 'التعليم الثانوي — السنة الأولى إلى الثالثة ثانوي',
        emoji: '🎓',
        color: 'from-emerald-500/20 to-emerald-600/10',
        border: 'border-emerald-500/60',
        shadow: 'shadow-[0_0_24px_rgba(16,185,129,0.12)]',
    },
    {
        key: 'cem',
        label: 'متوسط',
        sub: 'التعليم المتوسط — السنة الأولى إلى الرابعة متوسط',
        emoji: '📚',
        color: 'from-sky-500/20 to-sky-600/10',
        border: 'border-sky-500/60',
        shadow: 'shadow-[0_0_24px_rgba(14,165,233,0.12)]',
    },
    {
        key: 'primaire',
        label: 'ابتدائي',
        sub: 'التعليم الابتدائي — السنة الأولى إلى الخامسة ابتدائي',
        emoji: '✏️',
        color: 'from-violet-500/20 to-violet-600/10',
        border: 'border-violet-500/60',
        shadow: 'shadow-[0_0_24px_rgba(139,92,246,0.12)]',
    },
]

export default function ChooseLevel() {
    const router = useRouter()
    const [selected, setSelected] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleConfirm = async () => {
        if (!selected) return
        setLoading(true)
        setError('')

        try {
            const email = sessionStorage.getItem('registered_email')
            const password = sessionStorage.getItem('registered_password')

            if (!email || !password) {
                router.push('/login')
                return
            }

            // Save level to DB
            await axios.post('/api/set-level', { level: selected, email })

            // Clean up sessionStorage
            sessionStorage.removeItem('registered_email')
            sessionStorage.removeItem('registered_password')

            // Auto login → go straight to profile
            await signIn('credentials', {
                email,
                password,
                callbackUrl: '/profile'
            })

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<{ message?: string }>
                setError(axiosError.response?.data?.message || 'حدث خطأ، يرجى المحاولة مجدداً')
            } else {
                setError('حدث خطأ غير متوقع، يرجى المحاولة مجدداً')
            }
            setLoading(false)
        }
    }

    return (
        <div
            className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white antialiased select-none overflow-hidden font-sans"
            style={{ direction: 'rtl' }}
        >
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
                <div className="absolute top-[-10%] right-[10%] w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[15%] w-100 h-100 bg-emerald-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
                    backgroundSize: '45px 45px'
                }}
            />

            <div className="relative z-10 w-full max-w-110 m-4 bg-[#0f0f14]/80 border border-emerald-500/15 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-11 h-11 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
                        🏃
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">
                        EPS <span className="text-emerald-400 font-medium">High</span>
                    </span>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <span className="text-[11px] text-emerald-400/70">إنشاء الحساب</span>
                    </div>
                    <div className="w-8 h-px bg-white/10" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                            <span className="text-[10px] font-bold text-white">2</span>
                        </div>
                        <span className="text-[11px] text-white font-semibold">اختيار المستوى</span>
                    </div>
                </div>

                <h1 className="text-center text-2xl font-bold text-white mb-1">
                    ما هو مستواك التعليمي؟
                </h1>
                <p className="text-center text-xs text-gray-500 mb-8">
                    ستحصل على الوثائق والأدوات المناسبة لمستواك فقط
                </p>

                {/* Level Cards */}
                <div className="space-y-3 mb-8">
                    {levels.map((level) => {
                        const isSelected = selected === level.key
                        return (
                            <button
                                key={level.key}
                                type="button"
                                onClick={() => setSelected(level.key)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-right
                                    ${isSelected
                                        ? `bg-linear-to-l ${level.color} ${level.border} ${level.shadow}`
                                        : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-3xl">{level.emoji}</span>
                                <div className="flex-1 text-right">
                                    <div className={`font-bold text-base transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                        {level.label}
                                    </div>
                                    <div className="text-gray-500 text-xs mt-0.5">{level.sub}</div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                                    ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-white/20 bg-transparent'}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center font-medium mb-4">
                        ⚠️ {error}
                    </div>
                )}

                <button
                    onClick={handleConfirm}
                    disabled={!selected || loading}
                    className="w-full h-12 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99] disabled:opacity-30 disabled:pointer-events-none rounded-xl text-white text-sm font-bold shadow-[0_4px_24px_rgba(16,185,129,0.2)] transition-all duration-200"
                >
                    {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'تأكيد الدخول إلى المنصة ✓'
                    )}
                </button>

                <p className="text-center text-[11px] text-gray-600 mt-4">
                    يمكنك التواصل معنا لتغيير المستوى لاحقاً
                </p>

            </div>
        </div>
    )
}
'use client'

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from 'axios'

export default function Login() {
    const router = useRouter()
    const [state, setState] = useState<'login' | 'register'>('login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (state === 'login') {
                const res = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                })
                if (res?.error) {
                    setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
                } else {
                    router.push('/profile')
                    router.refresh()
                }
            } else {
                const response = await axios.post('/api/register', formData)
                if (response.data.success) {
                    await signIn('credentials', {
                        email: formData.email,
                        password: formData.password,
                        callbackUrl: '/profile'
                    })
                }
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<{ message?: string }>
                setError(axiosError.response?.data?.message || 'حدث خطأ في الاتصال بالخادم')
            } else {
                setError('حدث خطأ غير متوقع، يرجى المحاولة مجدداً')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white antialiased select-none overflow-hidden font-sans" style={{ direction: 'rtl' }}>

            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
                <div className="absolute top-[-10%] right-[10%] w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[15%] w-100 h-100 bg-emerald-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '45px 45px' }}
            />

            <div className="relative z-10 w-full max-w-110 m-4 bg-[#0f0f14]/80 border border-emerald-500/15 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">

                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-11 h-11 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
                        🏃
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">
                        EPS <span className="text-emerald-400 font-medium">High</span>
                    </span>
                </div>

                <h1 className="text-center text-2xl font-bold text-white mb-1">
                    {state === 'login' ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
                </h1>
                <p className="text-center text-xs text-gray-500 mb-8">
                    {state === 'login' ? 'سجّل الدخول للوصول إلى فضائك التربوي' : 'انضم إلى منصة أساتذة التربية البدنية والرياضية'}
                </p>

                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/profile' })}
                    className="w-full h-12 flex items-center justify-center gap-3 bg-white/4 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.99] rounded-xl text-gray-200 text-sm font-semibold transition-all duration-200 mb-6"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" className="w-4 h-4">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    المتابعة عبر نظام Google
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-[11px] text-gray-600 font-medium tracking-wide whitespace-nowrap">أو عبر البريد الإلكتروني</span>
                    <div className="flex-1 h-px bg-white/8" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {state === 'register' && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-400">الاسم واللقب الكامل</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
                                </span>
                                <input
                                    className="w-full h-12 bg-white/3 border border-white/8 focus:border-emerald-500/40 focus:bg-emerald-500/2 focus:ring-4 focus:ring-emerald-500/10 rounded-xl pr-11 pl-4 text-white text-sm outline-none transition-all duration-200"
                                    type="text"
                                    name="name"
                                    placeholder="الأستاذ(ة)"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-400">البريد الإلكتروني المعتمد</label>
                        <div className="relative">
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg>
                            </span>
                            <input
                                className="w-full h-12 bg-white/3 border border-white/8 focus:border-emerald-500/40 focus:bg-emerald-500/2 focus:ring-4 focus:ring-emerald-500/10 rounded-xl pr-11 pl-4 text-white text-sm outline-none transition-all duration-200 text-left"
                                type="email"
                                name="email"
                                placeholder="teacher@institution.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-400">كلمة المرور السرية</label>
                        <div className="relative">
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </span>
                            <input
                                className="w-full h-12 bg-white/3 border border-white/8 focus:border-emerald-500/40 focus:bg-emerald-500/2 focus:ring-4 focus:ring-emerald-500/10 rounded-xl pr-11 pl-12 text-white text-sm outline-none transition-all duration-200 text-left"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {state === 'login' && (
                        <div className="text-left">
                            <button type="button" className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline transition-all">
                                نسيت كلمة المرور؟
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-white text-sm font-bold shadow-[0_4px_24px_rgba(16,185,129,0.2)] transition-all duration-200 mt-2"
                    >
                        {loading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            state === 'login' ? 'دخول آمن للمنصة' : 'إنشاء حساب جديد وتأكيده'
                        )}
                    </button>
                </form>

                <div className="text-center mt-6 text-xs text-gray-500">
                    {state === 'login' ? 'ليس لديك حساب بيداغوجي؟' : 'تملك حساباً مسجلاً مسبقاً؟'}
                    <button
                        onClick={() => { setState(prev => prev === 'login' ? 'register' : 'login'); setError('') }}
                        className="text-emerald-400 font-bold mr-1.5 hover:underline text-xs"
                    >
                        {state === 'login' ? 'سجّل الآن هنا' : 'اضغط لتسجيل الدخول'}
                    </button>
                </div>

            </div>
        </div>
    )
}
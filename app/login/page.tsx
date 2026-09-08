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
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (state === 'register' && formData.password !== formData.confirmPassword) {
            setError('كلمتا المرور غير متطابقتين، يرجى التأكد والمحاولة مجدداً')
            setLoading(false)
            return
        }

        try {
            if (state === 'login') {
                const res = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                })
                if (res?.error) {
                    setError(' البريد الإلكتروني أو كلمة المرور غير صحيحة')
                } else {
                    window.location.href = '/profile'
                }
            } else {
                const response = await axios.post('/api/register', formData)
                if (response.data.success) {
                    sessionStorage.setItem('registered_email', formData.email)
                    sessionStorage.setItem('registered_password', formData.password)
                    router.push('/choose-level')
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
        <div className="relative min-h-screen flex items-center justify-center bg-black text-white antialiased select-none overflow-hidden font-sans" style={{ direction: 'rtl' }}>

            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
                <div className="absolute top-[-10%] right-[10%] w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[15%] w-100 h-100 bg-emerald-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '45px 45px' }}
            />

            <div className="relative z-10 w-full max-w-110 m-4 bg-[#0f0f14]/80 border border-emerald-500/15 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-11 h-11 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
                        🏃
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">
                        EPSDZ
                    </span>
                </div>

                <h1 className="text-center text-xl font-bold text-white mb-6">
                    {state === 'login' ? ' مرحبا بعودتك ! ادخل إلى حسابك ' : 'انشئ حساب جديد وانضم إلى منصة أساتذة التربية البدنية والرياضية'}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-[11px] text-gray-600 font-medium tracking-wide whitespace-nowrap"></span>
                    <div className="flex-1 h-px bg-white/8" />
                </div>
                <div className="text-center text-gray-300 my-8">
                    {state === 'login' ? 'اذا كنت لا تملك حساباً ؟' : ' اذا كنت تملك حساباً مسجلاً مسبقاً ؟ '}
                    <button
                        onClick={() => { setState(prev => prev === 'login' ? 'register' : 'login'); setError('') }}
                        className="w-full h-12 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-white text-sm font-bold shadow-[0_4px_24px_rgba(16,185,129,0.2)] transition-all duration-200 mt-2"
                    >
                        {state === 'login' ? 'انشئ حساباً جديداً' : 'اضغط لتسجيل الدخول'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                dir="ltr"
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
                                dir="ltr"
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

                    {state === 'register' && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-400">تأكيد كلمة المرور</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </span>
                                <input
                                    dir="ltr"
                                    className="w-full h-12 bg-white/3 border border-white/8 focus:border-emerald-500/40 focus:bg-emerald-500/2 focus:ring-4 focus:ring-emerald-500/10 rounded-xl pr-11 pl-4 text-white text-sm outline-none transition-all duration-200 text-left"
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="أعد كتابة كلمة المرور"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {state === 'login' && (
                        <div className="text-left">
                            <a href="https://wa.me/+213795972858" target="_blank"
                                rel="noopener noreferrer" aria-label="WhatsApp"
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline underline transition-all">
                                الرجاء التواصل معنا اذا نسيت كلمة المرور
                            </a>
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
                            state === 'login' ? 'دخول آمن للمنصة' : 'التالي — اختيار المستوى'
                        )}
                    </button>
                </form>

            </div>
        </div>
    )
}
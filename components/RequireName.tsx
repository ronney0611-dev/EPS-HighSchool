'use client'

import Link from 'next/link'
import { useTeacher } from '@/hooks/useTeacher'

export default function RequireName({ children }: { children: React.ReactNode }) {
    const { teacher, loaded } = useTeacher()

    if (!loaded) {
        return <div className="p-10 text-center text-gray-500">⏳ جاري التحميل...</div>
    }

    if (!teacher?.name?.trim()) {
        return (
            <div dir="rtl" className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#0f0f14] border border-amber-500/30 rounded-2xl p-6 text-center space-y-4">
                    <div className="text-4xl">🪪</div>
                    <h2 className="text-lg font-bold text-white">أدخل اسمك أولا</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        الاسم واللقب يظهر على جميع وثائقك، لذلك يجب إدخاله قبل استعمال الوثائق.
                    </p>
                    <Link
                        href="/manage-profile"
                        className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition"
                    >
                        إدخال الاسم الآن
                    </Link>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
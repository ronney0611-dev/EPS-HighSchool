'use client'

import Image from 'next/image'
import { images } from '@/src/config/documents'

type Teacher = {
    name: string
    photo: string
    review: string
    birthloc: string
}

const RenderCard = ({ teacher, index }: { teacher: Teacher, index: number }) => {
    if (!teacher) return null;

    return (
        <div key={index} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 w-full max-w-sm mx-auto flex flex-col justify-between min-h-55 backdrop-blur-md shadow-sm transition-all duration-200 hover:border-zinc-700">
            {/* Review text */}
            <p className="text-zinc-300 text-xs sm:text-sm mb-6 text-right leading-relaxed font-normal" dir="rtl">
                {teacher.review || ""}
            </p>

            {/* Author Profile section */}
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/60" dir="rtl">
                <Image
                    src={teacher.photo || images.xx}
                    alt={teacher.name || 'أستاذ'}
                    width={44}
                    height={44}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-800 bg-zinc-800"
                />
                <div className="text-right">
                    <p className="font-semibold text-white text-xs sm:text-sm">{teacher.name || 'أستاذ'}</p>
                    {teacher.birthloc && (
                        <p className="text-zinc-400 text-[11px] sm:text-xs font-medium mt-0.5">{teacher.birthloc}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RenderCard
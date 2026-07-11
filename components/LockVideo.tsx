'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BorderAnimationButton from '@/src/components/nurui/border-button'

type LockedDocCardProps = {
    title: string
    description: string
    imageSrc: string
    youtubeVideoId: string
    documentHref: string
    activationHref: string
    isActivated: boolean
}

export default function LockedDocCard({
    title,
    description,
    imageSrc,
    youtubeVideoId,
    documentHref,
    activationHref,
    isActivated,
}: LockedDocCardProps) {
    const [showPreview, setShowPreview] = useState(false)
    const router = useRouter()

    const handleCardClick = () => {
        if (isActivated) {
            router.push(documentHref)
        } else {
            setShowPreview((prev) => !prev)
        }
    }

    return (
        <div
            dir="rtl"
            className="relative bg-black flex flex-col items-center text-center transition overflow-hidden"
        >
            <div
                onClick={handleCardClick}
                className="w-full md:p-10 flex flex-col gap-2 items-center text-center cursor-pointer hover:border-gray-600 hover:-translate-y-0.5"
            >
                {/* lock badge */}
                {!isActivated && (
                    <div className="absolute lg:top-6 lg:right-6 top-[-12] right-[-12] text-black rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-md z-10">
                        🔒
                    </div>
                )}

                <div className="w-full aspect-square relative rounded-lg overflow-hidden mb-3">
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        sizes="100vw"
                        className="w-60 h-60 my-2 object-fill rounded-2xl"
                    />
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-3 ">{description}</p>

                {!isActivated && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowPreview((prev) => !prev)
                        }}
                        className="text cursor-pointer font-bold px-4 py-2 rounded-2xl bg-amber-400 text-black hover:bg-amber-300 transition flex items-center gap-1"
                    >
                        ▶ شاهد الوثيقة
                    </button>
                )}
            </div>

            {/* preview overlay, centered over the card itself (same footprint as the card) */}
            {showPreview && (
                <div
                    className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
                    onClick={() => setShowPreview(false)}
                >
                    <div
                        className="bg-gray-900 border border-gray-700 rounded-2xl w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-3 border-b border-gray-800">
                            <h2 className="text-sm font-bold text-white truncate">{title} — معاينة</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-white text-xl leading-none px-2"
                                aria-label="إغلاق"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="w-full aspect-video bg-black relative">
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1&disablekb=1&showinfo=0`}
                                title={`${title} — معاينة`}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-0"
                            />
                        </div>

                        <div className="p-3 flex flex-col gap-2">
                            <p className="text-xs text-gray-300 text-center">
                                الوثيقة جاهزة في انتظارك يرجى تفعيل حسابك.
                            </p>

                            <div onClick={() => router.push(activationHref)} className="flex justify-center my-2">
                                <BorderAnimationButton text="  تفعيل الحساب 🔓" className='my-1 h-10' />
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
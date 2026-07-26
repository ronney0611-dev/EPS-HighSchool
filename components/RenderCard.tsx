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
        <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-87.5 mx-auto flex flex-col justify-between min-h-55">
            <p className="text-neutral-700 text-sm mb-6 text-right" dir="rtl">
                {teacher.review || 'لا يوجد تعليق'}
            </p>
            <div className="flex items-center gap-3">
                <Image src={images.xx} alt={'أستاذ'} width={44} height={44} className="w-11 h-11 rounded-full object-cover shrink-0" />
                <div className="text-right" dir="rtl">
                    <p className="font-bold text-black">{teacher.name || 'أستاذ'}</p>
                    <p className="text-gray-600 text-sm">{teacher.birthloc || ''}</p>
                </div>
            </div>
        </div>
    )
}

export default RenderCard
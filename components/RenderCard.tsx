import { images } from '@/src/config/documents'
import Image from 'next/image'

type Teacher = {
    name: string
    photo: string
    review: string
    birthloc: string
}

const RenderCard = ({ teacher, index }: { teacher: Teacher, index: number }) => {
    return (
        <div key={index} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shrink-0 w-87.5">
            <p className="text-neutral-700 text-sm mb-6">{teacher.review}</p>
            <div className="flex items-center gap-3">
                <Image src={images.xx} alt={'random'} width={44} height={44} className="w-11 h-11 rounded-full object-cover" />
                <div>
                    <p className="font-bold text-black">{teacher.name}</p>
                    <p className="text-gray-600 text-sm">{teacher.birthloc}</p>
                </div>
            </div>
        </div>
    )
}

export default RenderCard
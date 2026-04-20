'use client'

import { useTeacher } from '@/hooks/useTeacher';
import Image from 'next/image';

const ProfileDoc = () => {
    const { teacher } = useTeacher();

    return (
        <div dir="rtl" className='p-4'>
            {/* print button */}
            <button
                onClick={() => window.print()}
                className='print:hidden bg-blue-500 text-white px-6 py-2 rounded-xl mb-4 block mx-auto'>
                طباعة
            </button>

            {/* A4 card */}
            <div id="a4-card" className='w-full max-w-[210mm] mx-auto bg-white text-black p-4 md:p-10 shadow-lg'>
                
                {/* header */}
                <div className='flex justify-between items-center border-b-2 border-blue-600 pb-4 mb-6'>
                    <div className='flex flex-col gap-1'>
                        <h1 className='text-2xl font-bold text-blue-600'>بطاقة المعلومات الشخصية</h1>
                        <p className='text-sm text-gray-500'>السنة الدراسية: 2025/2026</p>
                    </div>
                    {teacher.photo && (
                        <Image
                            src={teacher.photo}
                            alt="profile"
                            width={200}
                            height={200}
                            className='w-34 h-34 rounded-full object-cover border-2 border-blue-600'
                        />
                    )}
                </div>

                {/* info grid */}
                <div className='grid grid-cols-1 gap-4 mb-6'>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs text-gray-400'>الاسم واللقب</span>
                        <span className='font-semibold border-b border-gray-300 pb-1'>{teacher.name || '—'}</span>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs text-gray-400'>الثانوية</span>
                        <span className='font-semibold border-b border-gray-300 pb-1'>{teacher.school || '—'}</span>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs text-gray-400'>الجنسية</span>
                        <span className='font-semibold border-b border-gray-300 pb-1'>{teacher.nationality || '—'}</span>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs text-gray-400'>تاريخ الميلاد</span>
                        <span className='font-semibold border-b border-gray-300 pb-1'>{teacher.birthday || '—'}</span>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs text-gray-400'>الولاية</span>
                        <span className='font-semibold border-b border-gray-300 pb-1'>{teacher.birthloc || '—'}</span>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs text-gray-400'>الحالة المدنية</span>
                        <span className='font-semibold border-b border-gray-300 pb-1'>{teacher.statu || '—'}</span>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs text-gray-400'>البريد الإلكتروني</span>
                        <span className='font-semibold border-b border-gray-300 pb-1'>{teacher.email || '—'}</span>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs text-gray-400'>رقم الهاتف</span>
                        <span className='font-semibold border-b border-gray-300 pb-1'>{teacher.phone || '—'}</span>
                    </div>
                </div>

                {/* qualifications */}
                <div className='mb-6'>
                    <h2 className='text-lg font-bold text-blue-600 mb-3 border-b border-blue-200 pb-1'>المؤهلات العلمية</h2>
                    <table className='w-full border-collapse text-center'>
                        <thead>
                            <tr className='bg-blue-600 text-white'>
                                <th className='border border-blue-400 py-2 px-4'>الشهادة</th>
                                <th className='border border-blue-400 py-2 px-4'>الجامعة</th>
                                <th className='border border-blue-400 py-2 px-4'>السنة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className='border border-gray-300 py-2 px-4 font-semibold'>ليسانس</td>
                                <td className='border border-gray-300 py-2 px-4'>{teacher.univerLic || '—'}</td>
                                <td className='border border-gray-300 py-2 px-4'>{teacher.anneLic || '—'}</td>
                            </tr>
                            <tr className='bg-gray-50'>
                                <td className='border border-gray-300 py-2 px-4 font-semibold'>ماستر</td>
                                <td className='border border-gray-300 py-2 px-4'>{teacher.univerMas || '—'}</td>
                                <td className='border border-gray-300 py-2 px-4'>{teacher.anneMas || '—'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* footer */}
                <div className='flex justify-between items-center border-t border-gray-300 pt-4 text-sm text-gray-500'>
                    <span>التوقيع: ___________________</span>
                    <span>الختم</span>
                </div>
            </div>
        </div>
    )
}

export default ProfileDoc
'use client'
import { useClasses } from '@/hooks/useClasses';
import { useState } from 'react'

const TakwinTahsili = () => {
    const { classes, setClasses } = useClasses();
    const [classSlecet, setClassSelect] = useState('');

    const selectedClassData = classes.find(c => c.name === classSlecet);

    const isSecondary = ['أولى ثانوي', 'ثانية ثانوي']
        .includes(selectedClassData?.level || '');

    return (
        <div dir="rtl" className="mx-4 mt-20">
            {/* controls */}
            <div className="print:hidden flex flex-col md:flex-row flex-wrap gap-3 items-center border rounded-xl p-4 w-full mb-6">

                <div className='flex gap-2 items-center'>
                    <label className='font-semibold text-sm'>اختر القسم</label>
                    <select
                        className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
                        onChange={e => setClassSelect(e.target.value)}>
                        <option value="">— اختر —</option>
                        {classes.map((c, i) => (
                            <option key={i} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => window.print()}
                    className='bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold text-sm w-full md:w-auto'>
                    طباعة 🖨️
                </button>
            </div>
            {/* the form */}
            <main id="a4-card" dir="rtl" className='w-full bg-white text-black p-2 md:p-6'>
                <table className="w-full border-collapse border border-black text-center text-xs">
                    <thead className='border border-black' >
                        <tr className="" >
                            <th ></th>
                            <th ></th>
                            <th className="border border-black bg-blue-200" colSpan={10}>نقطة الاختبار  </th>
                            <th className="border border-black bg-blue-200">معدل المادة  </th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th className='border border-black' colSpan={7}>النشـــــــــــــــاط الفــــــــــــــردي </th>
                            <th className='border border-black' colSpan={2}>النشاط الجماعي</th>
                            <th className='border-l border-black' >النقطة</th>
                            <th >(مس+فر+اخ*2)</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th className='border border-black' colSpan={2}>التقويم التصرفي</th>
                            <th className='border border-black' colSpan={5}>التقويـــــــــــــم التحـــصيلي</th>
                            <th className='border border-black'>المستوى</th>
                            <th className='border border-black'>نقطة </th>
                            <th className='border-l border-black'>النهائية</th>
                            <th>/</th>
                        </tr>
                        <tr>
                            <th className='border border-black'>الرقم</th>
                            <th className='border border-black'> الاسم و اللقب</th>
                            <th className='border border-black'>نتيجة
                                %
                            </th>
                            <th className='border border-black'>النقطة
                                20
                            </th>
                            <th className='border border-black'>نتيجة</th>
                            <th className='border border-black'>
                                {isSecondary ? 'النقطة 14' : 'النقطة 16'}
                            </th>
                            <th className='border border-black'>تـطــور الحاصل</th>
                            <th className='border border-black'>
                                {isSecondary ? 'نتيجة التطور 6' : 'نتيجة التطور 4'}
                            </th>
                            <th className='border border-black'>ت تصر+
                                ت تحصي/2
                            </th>
                            <th className='border border-black'>A/B/C/D/E</th>
                            <th className='border border-black'>20</th>
                            <th className='border-l border-black'>

                                20
                            </th>
                            <th>4</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedClassData?.students.map((s, i) => (
                            <tr key={i}>
                                <td className='border bg-blue-200 border-black'>{i + 1}</td>
                                <td className='border bg-amber-100 border-black'>{s.name}</td>
                                {Array.from({ length: 11 }).map((_, j) => (
                                    <td key={j} className='border border-black'>
                                        <input type="text" className="w-full border-none outline-none text-center bg-transparent appearance-none" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    )
}

export default TakwinTahsili

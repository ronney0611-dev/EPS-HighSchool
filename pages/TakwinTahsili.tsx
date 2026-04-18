'use client'
import { useClasses } from '@/hooks/useClasses';
import React, { useState } from 'react'

const TakwinTahsili = () => {
    const { classes, setClasses } = useClasses();
    const [classSlecet, setClassSelect] = useState('');
    const selectedClassData = classes.find(c => c.name === classSlecet);
    return (
        <div dir="rtl" className="mx-4 mt-20">
            {/* class select */}
            <div className='flex justify-center gap-2 my-4 mx-8 border border-gray-200 p-4'>
                <label htmlFor="" className="font-bold">اختر القسم</label>
                <select className='text-center py-1 px-4 bg-black' name="" id="" onChange={e => setClassSelect(e.target.value)}>
                    {
                        classes.map((c, i) => {
                            return (
                                <option key={i} value={c.name}> {c.name} </option>
                            )
                        })}
                </select>
            </div>
            {/* the form */}
            <main dir="rtl" className="bg-white text-black px-4 py-8 overflow-x-auto ">
                <table className=" w-full text-center ">
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
                            <th className='border border-black'>نقطة14</th>
                            <th className='border border-black'>تـطــور الحاصل</th>
                            <th className='border border-black'>نتيجة
                                تطور6
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
                                <td className='border bg-amber-100 border-black'>{s}</td>
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

'use client'
import { useClasses } from "@/hooks/useClasses"
import { useTeacher } from "@/hooks/useTeacher"
import React, { useState } from "react"

const TaqwimTakwini = () => {
    const { classes } = useClasses();
    const { teacher } = useTeacher();
    const [classSelect, setClassSelect] = useState('');
    const selectedClassData = classes.find(c => c.name === classSelect);

    return (
        <div dir="rtl" className='m-2 md:m-4 flex flex-col items-center'>

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

            {/* A4 document */}
            <div id="a4-card" className='w-full bg-white text-black p-2 md:p-6'>

                
                {/* main table */}
                <div className="overflow-x-auto mt-1">
                    <table className="w-full border-collapse text-center text-xs">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200" colSpan={14}>التقويم التكويني للنشاط الفردي</th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200" colSpan={6}>التقويم التكويني للنشاط الجماعي</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th></th>
                                {['1', '2', '3', '4', '5', '6', '7'].map((n, i) => (
                                    <th colSpan={2} className="border border-black bg-blue-200 print:bg-blue-200" key={i}>ح{n}</th>
                                ))}
                                <th colSpan={6} className="border border-black bg-blue-200 print:bg-blue-200 p-1 text-xs">
                                    (A +17) / (B 15-17) / (C 11-14) / (D 07-10) / (E 03-06) المستوى
                                </th>
                            </tr>
                            <tr className="border border-black bg-amber-100 print:bg-amber-100">
                                <th className="border border-black">رقم</th>
                                <th className="border border-black">أسماء التلاميذ</th>
                                {Array(7).fill(0).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th className="border border-black w-10">الأداء</th>
                                        <th className="border border-black w-10">النتيجة</th>
                                    </React.Fragment>
                                ))}
                                {Array(6).fill(0).map((_, i) => (
                                    <th key={i} className="border border-black w-10">ح{i + 1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {selectedClassData?.students.map((s, i) => (
                                <tr key={i}>
                                    <td className='border bg-blue-200 print:bg-blue-200 border-black'>{i + 1}</td>
                                    <td className='border bg-amber-100 print:bg-amber-100 border-black whitespace-nowrap px-1'>{s.name}</td>
                                    {Array.from({ length: 14 }).map((_, j) => (
                                        <td key={j} className='border border-black'>
                                            <input type="text" className="w-full border-none outline-none text-center bg-transparent" />
                                        </td>
                                    ))}
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <td key={j} className='border border-black'>
                                            <select className="border-none w-full text-center outline-none appearance-none bg-transparent">
                                                <option value="">-</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                            </select>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TaqwimTakwini
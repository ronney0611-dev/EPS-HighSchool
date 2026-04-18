'use client'
import { useClasses } from "@/hooks/useClasses"
import React, { useState } from "react"

const TaqwimTakwini = () => {
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
                    <thead >
                        <tr className="" >
                            <th ></th>
                            <th ></th>
                            <th className="border border-black bg-blue-200" colSpan={14}>التقويم التكويني للنشاط الفردي</th>
                            <th className="border border-black bg-blue-200" colSpan={6}>التقويم التكويني للنشاط الجماعي</th>
                        </tr>
                        <tr >
                            <th ></th>
                            <th ></th>
                            {['1', '2', '3', '4', '5', '6', '7'].map((n, i) => (
                                <th colSpan={2} className="border border-black text-xs bg-blue-200" key={i}>ح{n}</th>
                            ))}
                            <th colSpan={6} className="border border-black text-xs p-2 bg-blue-200">(A +17) / (B 15-17) / (C 11-14) / (D 07-10) / (E 03-06) المستوى</th>
                        </tr>
                        <tr className="border border-black bg-amber-100">
                            <th className="border border-black ">رقم</th>
                            <th className="border border-black text-xs">أسماء التلاميذ</th>
                            {Array(7).fill(0).map((_, i) => (
                                <React.Fragment key={i}>
                                    <th className="border border-black text-xs w-12">الأداء الحركي</th>
                                    <th className="border border-black text-xs w-12">النتيجة الرياضية</th>
                                </React.Fragment>
                            ))}
                            {Array(6).fill(0).map((_, i) => (
                                <th key={i} className="border border-black text-xs w-12">ح{i + 1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {selectedClassData?.students.map((s, i) => (
                            <tr key={i}>
                                <td className='border bg-blue-200 border-black'>{i + 1}</td>
                                <td className='border bg-amber-100 border-black'>{s}</td>
                                {Array.from({ length: 14 }).map((_, j) => (
                                    <td key={j} className='border border-black'>
                                        <input type="text" className="w-full border-none outline-none text-center bg-transparent appearance-none" />
                                    </td>
                                ))}
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <td key={j} className='border border-black items-center text-center'>
                                        <select name="" id="" className="border-none w-full text-center outline-none appearance-none bg-transparent">
                                            <option value="">.</option>
                                            <option value="">A</option>
                                            <option value="">B</option>
                                            <option value="">C</option>
                                            <option value="">D</option>
                                            <option value="">E</option>
                                        </select>
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

export default TaqwimTakwini

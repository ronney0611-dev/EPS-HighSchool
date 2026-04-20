'use client'

import { useTeacher } from "@/hooks/useTeacher"
import { useState } from "react"

const MaterialsCalc = () => {
    const { teacher } = useTeacher()
    const [newMaterial, setNewMaterial] = useState('');
    const [material, setMaterial] = useState<{
        name: string,
        quantity: string,
        quandition: { bad: string, good: string, new: string },
        note: string,
    }[]>([]);

    const addMaterial = () => {
        if (!newMaterial.trim()) return
        setMaterial([...material, {
            name: newMaterial,
            quantity: '',
            quandition: { bad: '', good: '', new: '' },
            note: '',
        }]);
        setNewMaterial('');
    }

    const updateMaterial = (index: number, field: string, value: string) => {
        const updated = [...material];
        updated[index] = { ...updated[index], [field]: value };
        setMaterial(updated);
    }

    const updateCondition = (index: number, field: string, value: string) => {
        const updated = [...material];
        updated[index] = {
            ...updated[index],
            quandition: { ...updated[index].quandition, [field]: value }
        };
        setMaterial(updated);
    }

    return (
        <div dir="rtl" className="m-4 lg:m-10 flex justify-center  flex-col">
            {/* input handler - hidden on print */}
            <div className="print:hidden flex flex-col justify-center items-center  my-4 p-2 lg:p-6 gap-2">
                <div className='flex-col justify-center w-fit items-center lg:flex lg:flex-row gap-2 border p-2'>
                    <div className="flex flex-col justify-center md:flex-row items-center gap-2 p-2">
                        <label>الوسائل التدريبية</label>
                        <input type="text" value={newMaterial} onChange={e => setNewMaterial(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addMaterial()}
                            placeholder="اسم الوسيلة"
                            className="border p-1 rounded" />
                    </div>
                    <button onClick={addMaterial} className="rounded-full cursor-pointer bg-red-600 text-white px-4 py-1">ادخال</button>
                </div>
            </div>

            {/* print button */}
            <button onClick={() => window.print()}
                className='print:hidden bg-blue-500 text-white px-6 py-2 rounded-xl mb-4 w-fit mx-auto'>
                طباعة
            </button>

            {/* A4 document */}
            <div id="a4-card" className="w-full max-w-[210mm] mx-auto bg-white text-black p-4 md:p-10 shadow-lg">
                {/* header */}
                <div className='flex justify-center items-center border border-gray-400 bg-blue-600 text-white font-bold text-xl py-4 rounded-2xl my-2'>
                    <h1>قائمة جرد وسائل التربية البدنية والرياضية</h1>
                </div>
                <div className="flex flex-col my-2">
                    <p className='text-xl font-bold text-blue-600'>الاستاذ: <span className='font-medium text-black mx-2'>{teacher.name || '—'}</span></p>
                    <p className='text-xl font-bold text-blue-600'>المؤسسة: <span className='font-medium text-black mx-2'>{teacher.school || '—'}</span></p>
                </div>

                {/* table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border"></th>
                                <th className="border"></th>
                                <th className="border"></th>
                                <th className="border" colSpan={3}>حالة العتاد</th>
                                <th className="border"></th>
                            </tr>
                            <tr className="border">
                                <th className="border">الرقم</th>
                                <th className="border">اسم العتاد</th>
                                <th className="border">العدد</th>
                                <th className="border">سيئ</th>
                                <th className="border">مستعمل</th>
                                <th className="border">جديد</th>
                                <th className="border">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {material.map((m, i) => (
                                <tr className="border" key={i}>
                                    <td className="border text-center font-semibold">{i + 1}</td>
                                    <td className="border text-center font-semibold">{m.name}</td>
                                    <td className="border text-center">
                                        <input className="w-full text-center border-none outline-none" type="number" value={m.quantity} onChange={e => updateMaterial(i, 'quantity', e.target.value)} />
                                    </td>
                                    <td className="border text-center">
                                        <input className="w-full text-center border-none outline-none" type="number" value={m.quandition.bad} onChange={e => updateCondition(i, 'bad', e.target.value)} />
                                    </td>
                                    <td className="border text-center">
                                        <input className="w-full text-center border-none outline-none" type="number" value={m.quandition.good} onChange={e => updateCondition(i, 'good', e.target.value)} />
                                    </td>
                                    <td className="border text-center">
                                        <input className="w-full text-center border-none outline-none" type="number" value={m.quandition.new} onChange={e => updateCondition(i, 'new', e.target.value)} />
                                    </td>
                                    <td className="border text-center">
                                        <input className="w-full text-center border-none outline-none" type="text" value={m.note} onChange={e => updateMaterial(i, 'note', e.target.value)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* footer */}
                <div className="my-6 font-semibold flex justify-between">
                    <div>الاستاذ</div>
                    <div>المقتصد</div>
                    <div>المدير</div>
                </div>
            </div>
        </div>
    )
}

export default MaterialsCalc
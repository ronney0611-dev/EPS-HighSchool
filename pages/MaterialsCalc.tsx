'use client'

import { useTeacher } from "@/hooks/useTeacher"
import { useState } from "react"

interface MaterialItem {
    name: string;
    quantity: string;
    condition: { bad: string; used: string; new: string };
    note: string;
}

const DEFAULT_MATERIALS: MaterialItem[] = [
    { name: 'كرة الطائرة', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'كرات السلة', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'كرات اليد', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'كرات القدم', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'كرات طبية', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'كرات طبية', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'كرات حديدية', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'كرات حديدية', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'كرات بلاستيكية', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'بساط ارضي', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'حواجز', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'أقماع ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'شواخص ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'حبال القفز', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'صدرية رياضية ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'حلقات ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'مضخة هواء ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'ديكامتر ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'ميقاتي ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'معالم ارضية assiette ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'جهاز الانطلاق Starting Block ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
    { name: 'لوحة الارتقاء ', quantity: '', condition: { bad: '', used: '', new: '' }, note: '' },
];

const MaterialsCalc = () => {
    const { teacher } = useTeacher();
    const [newMaterial, setNewMaterial] = useState('');
    const [materials, setMaterials] = useState<MaterialItem[]>(DEFAULT_MATERIALS);

    const addMaterial = () => {
        if (!newMaterial.trim()) return;
        setMaterials([
            ...materials,
            {
                name: newMaterial.trim(),
                quantity: '',
                condition: { bad: '', used: '', new: '' },
                note: '',
            }
        ]);
        setNewMaterial('');
    };

    const removeMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const updateMaterial = (index: number, field: keyof MaterialItem, value: string) => {
        const updated = [...materials];
        updated[index] = { ...updated[index], [field]: value };
        setMaterials(updated);
    };

    const updateCondition = (index: number, field: keyof MaterialItem['condition'], value: string) => {
        const updated = [...materials];
        updated[index] = {
            ...updated[index],
            condition: { ...updated[index].condition, [field]: value }
        };
        setMaterials(updated);
    };

    return (
        <div dir="rtl" className="m-4 lg:m-10 flex justify-center flex-col">
            {/* Input Handler - Hidden on Print */}
            <div className="print:hidden flex flex-col justify-center items-center my-4 p-2 lg:p-6 gap-2">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 border p-3 rounded-xl bg-gray-50">
                    <label className="font-semibold text-gray-700">إضافة وسيلة جديدة:</label>
                    <input
                        type="text"
                        value={newMaterial}
                        onChange={e => setNewMaterial(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addMaterial()}
                        placeholder="اسم الوسيلة (مثال: شريط قياس)"
                        className="border p-2 rounded-lg bg-white text-black"
                    />
                    <button
                        onClick={addMaterial}
                        className="rounded-lg cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 transition-all"
                    >
                        إضافة
                    </button>
                </div>
            </div>

            {/* Print Button */}
            <button
                onClick={() => window.print()}
                className="print:hidden bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl mb-6 w-fit mx-auto shadow-md cursor-pointer transition-all"
            >
                طباعة الوثيقة
            </button>

            {/* A4 Document Container */}
            <div id="matcal" className="w-full max-w-[210mm] mx-auto bg-white text-black p-4 md:p-8 shadow-lg print:shadow-none print:p-0 print:m-0">
                {/* Header */}
                <div className="flex justify-center items-center border border-blue-700 bg-blue-600 text-white font-bold text-xl py-3 rounded-xl mb-4">
                    <h1>قائمة جرد وسائل التربية البدنية والرياضية</h1>
                </div>

                <div className="flex justify-between items-center my-3 border-b pb-2 text-sm font-bold text-blue-900">
                    <p>الأستاذ(ة): <span className="font-medium text-black mr-1">{teacher?.name || '—'}</span></p>
                    <p>المؤسسة: <span className="font-medium text-black mr-1">{teacher?.school || '—'}</span></p>
                    <p>الموسم الدراسي: <span className="font-medium text-black mr-1">2026 / 2027</span></p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-400 text-center text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-1 w-10" rowSpan={2}>الرقم</th>
                                <th className="border border-gray-400 p-2" rowSpan={2}>اسم العتاد</th>
                                <th className="border border-gray-400 p-1 w-16" rowSpan={2}>العدد الإجمالي</th>
                                <th className="border border-gray-400 p-1" colSpan={3}>حالة العتاد</th>
                                <th className="border border-gray-400 p-2" rowSpan={2}>ملاحظات</th>
                                <th className="border border-gray-400 p-1 w-10 print:hidden" rowSpan={2}>حذف</th>
                            </tr>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-1 w-14">سيئ</th>
                                <th className="border border-gray-400 p-1 w-14">مستعمل</th>
                                <th className="border border-gray-400 p-1 w-14">جديد</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map((m, i) => (
                                <tr className="border border-gray-400 hover:bg-gray-50" key={i}>
                                    <td className="border border-gray-400 font-semibold">{i + 1}</td>
                                    <td className="border border-gray-400 px-2 font-medium text-right">{m.name}</td>
                                    <td className="border border-gray-400 p-0">
                                        <input
                                            className="w-full text-center p-1 bg-transparent outline-none"
                                            type="number"
                                            value={m.quantity}
                                            onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-400 p-0">
                                        <input
                                            className="w-full text-center p-1 bg-transparent outline-none"
                                            type="number"
                                            value={m.condition.bad}
                                            onChange={e => updateCondition(i, 'bad', e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-400 p-0">
                                        <input
                                            className="w-full text-center p-1 bg-transparent outline-none"
                                            type="number"
                                            value={m.condition.used}
                                            onChange={e => updateCondition(i, 'used', e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-400 p-0">
                                        <input
                                            className="w-full text-center p-1 bg-transparent outline-none"
                                            type="number"
                                            value={m.condition.new}
                                            onChange={e => updateCondition(i, 'new', e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-400 p-0">
                                        <input
                                            className="w-full text-center p-1 bg-transparent outline-none"
                                            type="text"
                                            value={m.note}
                                            onChange={e => updateMaterial(i, 'note', e.target.value)}
                                        />
                                    </td>
                                    <td className="border border-gray-400 p-1 print:hidden">
                                        <button
                                            onClick={() => removeMaterial(i)}
                                            className="text-red-500 hover:text-red-700 font-bold px-1"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Signatures */}
                <div className="mt-12 font-semibold flex justify-between text-sm px-4">
                    <div>توقيع الأستاذ:</div>
                    <div>توقيع المقتصد:</div>
                    <div>توقيع وختم المدير:</div>
                </div>
            </div>

            {/* Print CSS Rules */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0mm;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        background: white !important;
                    }

                    body *:not(#matcal):not(#matcal *) {
                        visibility: hidden !important;
                    }

                    #matcal, #matcal * {
                        visibility: visible !important;
                    }

                    #matcal {
                        position: static !important;
                        width: 0 auto !important;
                        max-width: 0 auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tr {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    input {
                        border: none !important;
                        outline: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MaterialsCalc;
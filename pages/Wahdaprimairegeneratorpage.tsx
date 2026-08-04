'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { useClasses } from '@/hooks/useClasses'
import { useTeacher } from '@/hooks/useTeacher'
import { useWahdaPrimaire, type WahdaPrimaireState } from '@/hooks/Usewahdaprimaire '
import type { ISessionPrimaire } from '@/app/models/Wahdaprimairedoc'
import {
    PRIMAIRE_CURRICULUM,
    PRIMAIRE_LEVELS,
    PRIMAIRE_MAIDANS,
    getPrimaireLevelFromClassName,
    type PrimaireLevelKey,
} from '@/src/config/Wahdaprimairecurriculum'

const TYPE_LABEL: Record<ISessionPrimaire['type'], string> = {
    diagnostic: 'تقويم تشخيصي',
    learning: 'حصة تعليمية',
    integration: 'حصة إدماجية',
    summative: 'تقويم تحصيلي',
}

const TYPE_COLOR: Record<ISessionPrimaire['type'], string> = {
    diagnostic: 'text-red-600 bg-red-50/30',
    learning: 'text-blue-700 bg-blue-50/20',
    integration: 'text-purple-700 bg-purple-50/20',
    summative: 'text-green-700 bg-green-50/30',
}

export default function WahdaPrimaireGeneratorPage() {
    const { classes } = useClasses()
    const { teacher } = useTeacher()
    const { setWahda: setSavedFlag, fetchWahda, saveWahda, error } = useWahdaPrimaire()

    const primaireClasses = useMemo(
        () => (Array.isArray(classes) ? classes.filter(c => c.level === 'primaire') : []),
        [classes]
    )

    const [classId, setClassId] = useState<string>('')
    const [level, setLevel] = useState<PrimaireLevelKey>('s1')
    const [maidanId, setMaidanId] = useState<number>(1)
    const [current, setCurrent] = useState<WahdaPrimaireState | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (primaireClasses.length > 0 && !classId) {
            setClassId(primaireClasses[0]._id)
            setLevel(getPrimaireLevelFromClassName(primaireClasses[0].name))
        }
    }, [primaireClasses, classId])

    const loadWahda = async () => {
        if (!classId) return
        setIsLoading(true)
        try {
            const saved = await fetchWahda(classId, level, maidanId)
            if (saved && saved.sessions?.length > 0) {
                setCurrent({
                    level: saved.level,
                    maidanId: saved.maidanId,
                    maidanName: saved.maidanName,
                    kafaKhitamya: saved.kafaKhitamya,
                    sessions: saved.sessions,
                })
            } else {
                const template = PRIMAIRE_CURRICULUM[level]?.[maidanId]
                if (!template) {
                    toast('لا يوجد منهاج لهذا المستوى والميدان', { type: 'error' })
                    setCurrent(null)
                    return
                }
                setCurrent({
                    level: template.level,
                    maidanId: template.maidan_id,
                    maidanName: template.maidan_name,
                    kafaKhitamya: template.kafa_khitamya,
                    sessions: template.sessions.map(s => ({ ...s })),
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const fetchDoc = async () => {
            if (classId && level && maidanId) {
                await loadWahda();
            }
        };
        fetchDoc();
    }, [classId, level, maidanId])

    const handleClassChange = (id: string) => {
        setClassId(id)
        const cls = primaireClasses.find(c => c._id === id)
        setLevel(getPrimaireLevelFromClassName(cls?.name))
    }

    const handleCellChange = (index: number, field: keyof ISessionPrimaire, value: string) => {
        if (!current) return
        const updatedSessions = [...current.sessions]
        updatedSessions[index] = { ...updatedSessions[index], [field]: value }
        setCurrent({ ...current, sessions: updatedSessions })
    }

    const handleKafaChange = (value: string) => {
        if (!current) return
        setCurrent({ ...current, kafaKhitamya: value })
    }

    const handleSave = async () => {
        if (!current || !classId) return
        const result = await saveWahda(classId, current)
        if (result) {
            toast('تم حفظ الوحدة التعلمية بنجاح !', { type: 'success' })
        }
    }

    const levelName = PRIMAIRE_LEVELS.find(l => l.key === level)?.name || ''

    return (
        <div dir="rtl" className="p-6 max-w-7xl mx-auto space-y-6 text-right">

            {/* Control Panel */}
            <div className="print:hidden bg-white shadow-md rounded-2xl p-6 border border-gray-100 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800 border-b pb-2">🛠️ مولد الوحدة التعلمية (ابتدائي)</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-600">القسم</label>
                        <select
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={classId}
                            onChange={(e) => handleClassChange(e.target.value)}
                        >
                            {primaireClasses.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-600">الميدان</label>
                        <select
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={maidanId}
                            onChange={(e) => setMaidanId(Number(e.target.value))}
                        >
                            {PRIMAIRE_MAIDANS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    {current && current.sessions.length > 0 && (
                        <>
                            <button
                                onClick={handleSave}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
                            >
                                💾 حفظ في قاعدة البيانات
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
                            >
                                🖨️ طباعة
                            </button>
                        </>
                    )}
                </div>
                <ToastContainer />
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">{error}</div>}
            {isLoading && <div className="text-center p-4 text-gray-500">⏳ جاري التحميل...</div>}

            {/* Document Render Sheet */}
            {current && current.sessions.length > 0 ? (
                <div id="a4-card" className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">

                    <div className="grid grid-cols-3 text-sm font-bold text-gray-800 mb-6 border-b pb-4">
                        <div>
                            <p>المؤسسة: {teacher?.school}</p>
                            <p>الأستاذ(ة): {teacher?.name}</p>
                        </div>
                        <div className="text-center my-6">
                            <h2 className="text-2xl font-extrabold border-2 border-black inline-block px-8 py-2 rounded-xl bg-gray-50">
                                الوحدة التعلمية: {current.maidanName}
                            </h2>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p>السنة الدراسية: 2026/2027</p>
                            <p>المستوى: {levelName}</p>
                        </div>
                    </div>

                    <div className="text-black mb-4 mt-[-2] space-y-2">
                        <div className="flex items-center w-full">
                            <h1 className="text-xl whitespace-nowrap shrink-0">الكفاءة الختامية:</h1>
                            <textarea
                                value={current.kafaKhitamya}
                                onChange={(e) => handleKafaChange(e.target.value)}
                                className="flex-1 min-w-0 w-full bg-transparent resize-none border-none outline-none p-2 text-blue-700 font-semibold text-lg overflow-hidden"
                                rows={1}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    <table className="w-full border-collapse border-2 border-black text-center text-sm">
                        <thead>
                            <tr className="bg-gray-100 font-bold text-gray-900">
                                <th className="border border-black p-2 w-[13%]">طبيعة الحصة</th>
                                <th className="border border-black p-2 w-[19%]">مركبات الكفاءة</th>
                                <th className="border border-black p-2 w-[16%]">الموارد المعرفية</th>
                                <th className="border border-black p-2 w-[16%]">المحتوى التعلمي</th>
                                <th className="border border-black p-2 w-[13%]">محتوى الإنجاز</th>
                                <th className="border border-black p-2 w-[13%]">إرشادات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {current.sessions.map((session, index) => (
                                <tr key={index} className="border border-black hover:bg-gray-50/50">
                                    <td className={`border border-black p-2 font-bold cursor-default ${TYPE_COLOR[session.type]}`}>
                                        {session.unit_name || TYPE_LABEL[session.type]}
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            value={session.kafa_components}
                                            onChange={(e) => handleCellChange(index, 'kafa_components', e.target.value)}
                                            className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-800"
                                            rows={3}
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            value={session.knowledge_resources}
                                            onChange={(e) => handleCellChange(index, 'knowledge_resources', e.target.value)}
                                            className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-800"
                                            rows={3}
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            value={session.learning_content}
                                            onChange={(e) => handleCellChange(index, 'learning_content', e.target.value)}
                                            className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-900"
                                            rows={3}
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            value={session.execution_content}
                                            onChange={(e) => handleCellChange(index, 'execution_content', e.target.value)}
                                            className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-700"
                                            rows={3}
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            value={session.guidelines}
                                            onChange={(e) => handleCellChange(index, 'guidelines', e.target.value)}
                                            className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-600"
                                            rows={3}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="my-6 font-semibold flex justify-between text-gray-600 mt-12 mx-10">
                        <div>الأستاذ(ة)</div>
                        <div>المدير(ة)</div>
                        <div>المفتش(ة)</div>
                    </div>
                </div>
            ) : (
                !isLoading && (
                    <div className="text-center p-12 border-2 border-dashed rounded-2xl bg-gray-50 text-gray-500 font-medium">
                        📊 اختر القسم والميدان والفصل لعرض الوحدة التعلمية
                    </div>
                )
            )}

            <style jsx global>{`
    @media print {
        @page {
            size: A4 landscape;
            margin: 5mm;
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

        body *:not(#a4-card):not(#a4-card *) {
            visibility: hidden !important;
        }

        #a4-card, #a4-card * {
            visibility: visible !important;
        }

        #a4-card {
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            font-size: 12px !important;
        }

        #a4-card h2 {
            font-size: 18px !important;
            padding: 6px 20px !important;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px !important;
        }

        thead {
            display: table-header-group;
        }

        th, td {
            padding: 3px 5px !important;
            line-height: 1.25 !important;
        }

        tr {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        textarea {
            border: none !important;
            outline: none !important;
            resize: none !important;
            font-size: 11px !important;
            line-height: 1.25 !important;
            padding: 2px !important;
            min-height: unset !important;
        }
    }
`}</style>
        </div>
    )
}
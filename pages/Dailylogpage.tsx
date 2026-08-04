'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { useClasses } from '@/hooks/useClasses'
import { useTeacher } from '@/hooks/useTeacher'
import { useWahdaPrimaire } from '@/hooks/Usewahdaprimaire '
import { useDailyLog } from '@/hooks/useDailyLog'
import {
    PRIMAIRE_CURRICULUM,
    PRIMAIRE_MAIDANS,
    getPrimaireLevelFromClassName,
    type PrimaireLevelKey,
} from '@/src/config/Wahdaprimairecurriculum'

export default function DailyLogPage() {
    const { classes } = useClasses()
    const { teacher } = useTeacher()
    const { fetchWahda } = useWahdaPrimaire()
    const { entries, loading, error, addEntry, deleteEntry } = useDailyLog()

    const primaireClasses = useMemo(
        () => (Array.isArray(classes) ? classes.filter(c => c.level === 'primaire') : []),
        [classes]
    )

    const [classId, setClassId] = useState('')
    const [maidanId, setMaidanId] = useState<number>(1)
    const [sessionIndex, setSessionIndex] = useState<number>(0)
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [teachingContent, setTeachingContent] = useState('')
    const [learningContent, setLearningContent] = useState('')
    const [notes, setNotes] = useState('')
    const [sessionsPool, setSessionsPool] = useState<{ unit_name: string; kafa_components: string; learning_content: string }[]>([])
    const [isAdding, setIsAdding] = useState(false)

    // Derived, not synced via effect: falls back to the first primaire class
    // until the teacher explicitly picks one.
    const effectiveClassId = classId || primaireClasses[0]?._id || ''
    const level: PrimaireLevelKey = useMemo(
        () => getPrimaireLevelFromClassName(primaireClasses.find(c => c._id === effectiveClassId)?.name),
        [primaireClasses, effectiveClassId]
    )

    // Load the sessions pool for the selected level/maidan/trimester,
    // preferring the teacher's saved (edited) Wahda over the raw template.
    useEffect(() => {
        if (!effectiveClassId || !level || !maidanId) return
        let cancelled = false
        Promise.resolve().then(async () => {
            const saved = await fetchWahda(effectiveClassId, level, maidanId)
            if (cancelled) return
            const pool = saved && saved.sessions?.length > 0
                ? saved.sessions
                : (PRIMAIRE_CURRICULUM[level]?.[maidanId]?.sessions || [])
            setSessionsPool(pool)
            setSessionIndex(0)
            setTeachingContent(pool[0]?.kafa_components || '')
            setLearningContent(pool[0]?.learning_content || '')
        })
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveClassId, level, maidanId]);

    const handleClassChange = (id: string) => {
        setClassId(id)
    }

    const selectedClass = primaireClasses.find(c => c._id === effectiveClassId)

    const handleAdd = async () => {
        if (!effectiveClassId || !date) {
            toast('يرجى اختيار القسم والتاريخ', { type: 'error' })
            return
        }
        setIsAdding(true)
        try {
            const result = await addEntry({
                classId: effectiveClassId,
                className: selectedClass?.name || '',
                institution: teacher?.school || '',
                date,
                time,
                teachingContent,
                learningContent,
                notes,
                level,
                maidanId,
                sessionIndex,
            })
            if (result) {
                toast('تمت إضافة الحصة إلى الدفتر اليومي', { type: 'success' })
                setDate('')
                setTime('')
                setNotes('')
            }
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async (id: string) => {
        const ok = await deleteEntry(id)
        if (ok) toast('تم حذف السطر', { type: 'success' })
    }

    return (
        <div dir="rtl" className="p-6 max-w-7xl mx-auto space-y-6 text-right">

            {/* Control Panel */}
            <div className="print:hidden bg-white shadow-md rounded-2xl p-6 border border-gray-100 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800 border-b pb-2">📔 الدفتر اليومي</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-600">القسم</label>
                        <select
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={effectiveClassId}
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
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-600">الحصة</label>
                        <select
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={sessionIndex}
                            onChange={(e) => {
                                const i = Number(e.target.value)
                                setSessionIndex(i)
                                const s = sessionsPool[i]
                                setTeachingContent(s?.kafa_components || '')
                                setLearningContent(s?.learning_content || '')
                            }}
                        >
                            {sessionsPool.map((s, i) => (
                                <option key={i} value={i}>{s.unit_name || `حصة ${i + 1}`}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-600">التاريخ</label>
                        <input
                            type="date"
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-600">التوقيت</label>
                        <input
                            type="text"
                            placeholder="8:30 - 9:30"
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-1 text-gray-600">الملاحظات</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleAdd}
                        disabled={isAdding}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
                    >
                        {isAdding ? '⏳ جاري الإضافة...' : '➕ إضافة إلى الدفتر'}
                    </button>
                    {entries.length > 0 && (
                        <button
                            onClick={() => window.print()}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
                        >
                            🖨️ طباعة
                        </button>
                    )}
                </div>
                <ToastContainer />
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">{error}</div>}
            {loading && <div className="text-center p-4 text-gray-500">⏳ جاري التحميل...</div>}

            {/* Log Table */}
            {entries.length > 0 ? (
                <div id="a4-card" className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">
                    <table className="w-full border-collapse border-2 border-black text-center text-sm">
                        <thead>
                            <tr className="bg-gray-100 font-bold text-gray-900">
                                <th className="border border-black p-2 w-[10%]">التاريخ</th>
                                <th className="border border-black p-2 w-[10%]">التوقيت</th>
                                <th className="border border-black p-2 w-[10%]">القسم</th>
                                <th className="border border-black p-2 w-[13%]">المؤسسة</th>
                                <th className="border border-black p-2 w-[20%]">التعلمات</th>
                                <th className="border border-black p-2 w-[22%]">محتوى التعلم</th>
                                <th className="border border-black p-2 w-[15%]">الملاحظات</th>
                                <th className="border border-black p-2 w-[5%] print:hidden"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry._id} className="border border-black text-black hover:bg-gray-50/50">
                                    <td className="border border-black p-2 text-xs">{entry.date}</td>
                                    <td className="border border-black p-2 text-xs">{entry.time}</td>
                                    <td className="border border-black p-2 text-xs">{entry.className}</td>
                                    <td className="border border-black p-2 text-xs">{entry.institution}</td>
                                    <td className="border border-black p-2 text-xs">{entry.teachingContent}</td>
                                    <td className="border border-black p-2 text-xs">{entry.learningContent}</td>
                                    <td className="border border-black p-2 text-xs">{entry.notes}</td>
                                    <td className="border border-black p-2 print:hidden">
                                        <button
                                            onClick={() => handleDelete(entry._id)}
                                            className="text-red-600 hover:text-red-800 text-xs font-bold"
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && (
                    <div className="text-center p-12 border-2 border-dashed rounded-2xl bg-gray-50 text-gray-500 font-medium">
                        📔 لا توجد حصص مسجلة بعد في الدفتر اليومي
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
            font-size: 11px !important;
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
    }
`}</style>
        </div>
    )
}
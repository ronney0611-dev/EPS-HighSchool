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
        () => (Array.isArray(classes) ? classes : []),
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

    const effectiveClassId = classId || primaireClasses[0]?._id || ''
    const level: PrimaireLevelKey = useMemo(
        () => getPrimaireLevelFromClassName(primaireClasses.find(c => c._id === effectiveClassId)?.name),
        [primaireClasses, effectiveClassId]
    )

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
        <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8 font-sans">

            {/* Control Panel (Original) */}
            <div className="print:hidden bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <span>📔</span> الدفتر اليومي - الطور الابتدائي
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-400">القسم</label>
                        <select
                            className="w-full border border-slate-700 p-2.5 rounded-xl bg-slate-950 text-slate-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm transition"
                            value={effectiveClassId}
                            onChange={(e) => handleClassChange(e.target.value)}
                        >
                            {primaireClasses.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-400">الميدان</label>
                        <select
                            className="w-full border border-slate-700 p-2.5 rounded-xl bg-slate-950 text-slate-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm transition"
                            value={maidanId}
                            onChange={(e) => setMaidanId(Number(e.target.value))}
                        >
                            {PRIMAIRE_MAIDANS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-400">الحصة</label>
                        <select
                            className="w-full border border-slate-700 p-2.5 rounded-xl bg-slate-950 text-slate-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm transition"
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
                        <label className="block text-xs font-semibold mb-1 text-slate-400">التاريخ</label>
                        <input
                            type="date"
                            className="w-full border border-slate-700 p-2.5 rounded-xl bg-slate-950 text-slate-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm transition"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-400">التوقيت</label>
                        <input
                            type="text"
                            placeholder="8:30 - 9:30"
                            className="w-full border border-slate-700 p-2.5 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm transition"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-xs font-semibold mb-1 text-slate-400">الملاحظات</label>
                        <input
                            type="text"
                            placeholder="أدخل أي ملاحظات..."
                            className="w-full border border-slate-700 p-2.5 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm transition"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleAdd}
                        disabled={isAdding}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-red-600/20 text-sm cursor-pointer"
                    >
                        {isAdding ? '⏳ جاري الإضافة...' : '➕ إضافة إلى الدفتر'}
                    </button>
                    {entries.length > 0 && (
                        <button
                            onClick={() => window.print()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20 text-sm cursor-pointer"
                        >
                            🖨️ طباعة الدفتر
                        </button>
                    )}
                </div>
                <ToastContainer theme="dark" />
            </div>

            {error && <div className="p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-xl text-sm">{error}</div>}
            {loading && <div className="text-center p-4 text-slate-400 text-sm">⏳ جاري التحميل...</div>}

            {/* Modern, Official Printable Document Area */}
            {entries.length > 0 ? (
                <div id="a4-daily-log" className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0">

                    {/* Official Modern Header with Red Accent */}
                    <div className="border-2 border-slate-900 rounded-xl p-4 mb-5 bg-gradient-to-l from-red-50/40 via-white to-white print:bg-none">
                        <div className="flex justify-between items-center text-xs font-bold border-b-2 border-slate-900/10 pb-3 mb-3 text-slate-700">
                            <div>المؤسسة: <span className="text-slate-900 font-extrabold">{teacher?.school || 'ادخل المؤسسة'}</span></div>
                            <div>الأستاذ: <span className="text-slate-900 font-extrabold">{teacher?.name || 'ادخل اسم الاستاذ'}</span></div>
                            <div>السنة الدراسية: <span className="text-slate-900 font-extrabold">2026/2027</span></div>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">الدفتر اليومي</h1>
                            <p className="text-xs font-bold text-red-600 mt-0.5 uppercase tracking-wider">مادة التربية البدنية والرياضية</p>
                        </div>
                    </div>

                    {/* Clean Official Table */}
                    <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs">
                        <thead>
                            <tr className="bg-slate-900 text-white font-bold tracking-wide">
                                <th className="border border-slate-900 p-3 w-[11%]">التاريخ</th>
                                <th className="border border-slate-900 p-3 w-[10%]">التوقيت</th>
                                <th className="border border-slate-900 p-3 w-[10%]">القسم</th>
                                <th className="border border-slate-900 p-3 w-[14%]">المؤسسة</th>
                                <th className="border border-slate-900 p-3 w-[22%]">التعلمات</th>
                                <th className="border border-slate-900 p-3 w-[23%]">محتوى التعلم</th>
                                <th className="border border-slate-900 p-3 w-[10%]">الملاحظات</th>
                                <th className="border border-slate-900 p-3 w-[4%] print:hidden"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, index) => (
                                <tr key={entry._id} className={`border border-slate-900 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                    <td className="border border-slate-900 p-3 font-mono font-bold text-slate-800">{entry.date}</td>
                                    <td className="border border-slate-900 p-3 text-slate-700">{entry.time || '—'}</td>
                                    <td className="border border-slate-900 p-3 font-extrabold text-red-700">{entry.className}</td>
                                    <td className="border border-slate-900 p-3 text-slate-700">{entry.institution || '—'}</td>
                                    <td className="border border-slate-900 p-3 text-right leading-relaxed text-slate-900 font-medium">{entry.teachingContent}</td>
                                    <td className="border border-slate-900 p-3 text-right leading-relaxed text-slate-900 font-medium">{entry.learningContent}</td>
                                    <td className="border border-slate-900 p-3 text-right text-slate-700">{entry.notes || '—'}</td>
                                    <td className="border border-slate-900 p-3 print:hidden text-center">
                                        <button
                                            onClick={() => handleDelete(entry._id)}
                                            className="text-red-600 hover:text-red-800 font-bold transition p-1"
                                            title="حذف"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && (
                    <div className="text-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50 text-slate-400 font-medium text-sm">
                        📔 لا توجد حصص مسجلة بعد في الدفتر اليومي
                    </div>
                )
            )}

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 6mm;
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

                    body *:not(#a4-daily-log):not(#a4-daily-log *) {
                        visibility: hidden !important;
                    }

                    #a4-daily-log, #a4-daily-log * {
                        visibility: visible !important;
                    }

                    #a4-daily-log {
                        position: static !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    thead {
                        display: table-header-group;
                    }

                    th, td {
                        padding: 6px 8px !important;
                        line-height: 1.3 !important;
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
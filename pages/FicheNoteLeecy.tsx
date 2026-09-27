'use client'

import React, { useMemo, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { useClasses } from '@/hooks/useClasses'
import { useTeacher } from '@/hooks/useTeacher'
import { useDailyLogLycee, type DailyLogEntryLycee } from '@/hooks/useDailyLogLycee'
import { INDIVIDUAL_SPORTS, COLLECTIVE_SPORTS } from '@/src/config/ficheTechData'

export default function DailyLogPageLycee() {
    const { classes } = useClasses()
    const { teacher } = useTeacher()
    const { entries, loading, error, addEntry, deleteEntry } = useDailyLogLycee()

    const lyceeClasses = useMemo(() => (Array.isArray(classes) ? classes : []), [classes])
    const allSports = useMemo(() => [...INDIVIDUAL_SPORTS, ...COLLECTIVE_SPORTS], [])

    const SPORT_NAMES_AR: Record<string, string> = {
    sprint: 'سباق السرعة',
    basketball: 'كرة السلة',
    long_jump: 'الوثب الطويل',
    handball: 'كرة اليد',
    shot_put: 'دفع الجلة',
    volleyball: 'الكرة الطائرة',
    }
    const sportLabel = (key: string) => SPORT_NAMES_AR[key] ?? key

    const [classId, setClassId] = useState('')
    const [sport, setSport] = useState('')
    const [done, setDone] = useState<'yes' | 'no'>('yes')
    const [reason, setReason] = useState('')
    const [nextTime, setNextTime] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    const effectiveClassId = classId || lyceeClasses[0]?._id || ''
    const selectedClass = lyceeClasses.find(c => c._id === effectiveClassId)

    const handleAdd = async () => {
        if (!effectiveClassId || !sport || !date) {
            toast('يرجى اختيار القسم والرياضة والتاريخ', { type: 'error' })
            return
        }
        if (done === 'no' && !reason.trim()) {
            toast('يرجى كتابة سبب عدم إنجاز الحصة', { type: 'error' })
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
                sport,
                done: done === 'yes',
                reason: done === 'no' ? reason : '',
                nextTime: done === 'no' ? nextTime : '',
            })
            if (result) {
                toast('تمت إضافة الحصة إلى الدفتر اليومي', { type: 'success' })
                setDate('')
                setTime('')
                setReason('')
                setNextTime('')
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
        <div dir="rtl" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-right font-sans">
            
            {/* Form Section (Flat - No Shadows) */}
            <div className="print:hidden bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h2 className="text-xl font-bold text-gray-800">إضافة حصة للدفتر اليومي</h2>
                </div>

                {/* Form Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* Class Select */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">القسم</label>
                        <select
                            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 text-gray-800 focus:bg-white focus:border-red-600 transition outline-none text-sm font-medium"
                            value={effectiveClassId}
                            onChange={(e) => setClassId(e.target.value)}
                        >
                            {lyceeClasses.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sport Select */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">النشاط الرياضي</label>
                        <select
                            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 text-gray-800 focus:bg-white focus:border-red-600 transition outline-none text-sm font-medium"
                            value={sport}
                            onChange={(e) => setSport(e.target.value)}
                        >
                            <option value="">— اختر النشاط —</option>
                            {allSports.map(k => (
                                <option key={k} value={k}>{sportLabel(k)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Done Status */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">هل تم إنجاز الحصة؟</label>
                        <select
                            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 text-gray-800 focus:bg-white focus:border-red-600 transition outline-none text-sm font-medium"
                            value={done}
                            onChange={(e) => setDone(e.target.value as 'yes' | 'no')}
                        >
                            <option value="yes">نعم (تمت الحصة)</option>
                            <option value="no">لا (لم تُنجز)</option>
                        </select>
                    </div>

                    {/* Date Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">التاريخ</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 text-gray-800 focus:bg-white focus:border-red-600 transition outline-none text-sm font-medium"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Time Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">التوقيت</label>
                        <input
                            type="text"
                            placeholder="مثال: 08:30 - 09:30"
                            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 text-gray-800 focus:bg-white focus:border-red-600 transition outline-none text-sm font-medium"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                </div>

                {/* Conditional Inputs */}
                {done === 'no' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-red-50/50 border border-red-200 rounded-xl">
                        <div>
                            <label className="block text-xs font-bold text-red-800 mb-1">سبب عدم الإنجاز *</label>
                            <input
                                type="text"
                                placeholder="اكتب السبب..."
                                className="w-full border border-red-200 p-2 rounded-lg bg-white text-gray-800 focus:outline-none text-sm"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-red-800 mb-1">المقترحات أو البديل</label>
                            <input
                                type="text"
                                placeholder="المقترحات..."
                                className="w-full border border-red-200 p-2 rounded-lg bg-white text-gray-800 focus:outline-none text-sm"
                                value={nextTime}
                                onChange={(e) => setNextTime(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Simplified Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    {entries.length > 0 && (
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-sm transition"
                        >
                            🖨️ طباعة
                        </button>
                    )}
                    <button
                        onClick={handleAdd}
                        disabled={isAdding}
                        className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition active:scale-95 disabled:opacity-50"
                    >
                        {isAdding ? 'جاري الإضافة...' : 'إضافة الحصة'}
                    </button>
                </div>

                <ToastContainer />
            </div>

            {/* Error / Loading States */}
            {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold">{error}</div>}
            {loading && <div className="text-center p-6 text-gray-400 font-medium">⏳ جاري تحميل البيانات...</div>}

            {/* Document Printable View */}
            {entries.length > 0 ? (
                <div id="a4-daily-log" className="bg-white rounded-2xl border border-gray-200 p-6 print:p-0 print:border-none print:rounded-none">
                    
                    {/* Title inside printable document */}
                    <div className="text-center mb-6 pb-4 border-b-2 border-black">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-black uppercase tracking-wide">
                            الدفتر اليومي للتربية البدنية والرياضية
                        </h1>
                        <div className="flex justify-between items-center text-xs font-semibold text-gray-800 mt-3 px-2">
                            <span>المؤسسة: {teacher?.school || 'ادخل اسم المؤسسة'} </span>
                            <span>الأستاذ(ة): {teacher?.name || 'ادخل اسم الاستاذ'}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-right text-sm">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200 text-gray-900 font-bold text-xs uppercase print:bg-gray-200">
                                    <th className="p-3 border border-gray-300 print:border-black w-[12%] text-center">التاريخ</th>
                                    <th className="p-3 border border-gray-300 print:border-black w-[10%] text-center">التوقيت</th>
                                    <th className="p-3 border border-gray-300 print:border-black w-[12%] text-center">القسم</th>
                                    <th className="p-3 border border-gray-300 print:border-black w-[15%] text-center">النشاط</th>
                                    <th className="p-3 border border-gray-300 print:border-black w-[10%] text-center">الإنجاز</th>
                                    <th className="p-3 border border-gray-300 print:border-black w-[20%] text-center">السبب</th>
                                    <th className="p-3 border border-gray-300 print:border-black w-[16%] text-center">المقترحات</th>
                                    <th className="p-3 print:hidden text-center w-[5%]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 print:divide-black">
                                {entries.map((entry: DailyLogEntryLycee) => (
                                    <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 border border-gray-300 print:border-black font-semibold text-gray-800 text-center print:text-black print:p-2">{entry.date}</td>
                                        <td className="p-3 border border-gray-300 print:border-black text-gray-600 text-center print:text-black print:p-2">{entry.time || '—'}</td>
                                        <td className="p-3 border border-gray-300 print:border-black font-bold text-gray-900 text-center print:text-black print:p-2">{entry.className}</td>
                                        <td className="p-3 border border-gray-300 print:border-black font-medium text-gray-800 text-center print:text-black print:p-2">{sportLabel(entry.sport)}</td>
                                        <td className="p-3 border border-gray-300 print:border-black text-center print:p-2">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                                entry.done 
                                                    ? 'bg-green-100 text-green-800 print:bg-transparent print:text-black' 
                                                    : 'bg-red-100 text-red-800 print:bg-transparent print:text-black'
                                            }`}>
                                                {entry.done ? 'نعم' : 'لا'}
                                            </span>
                                        </td>
                                        <td className="p-3 border border-gray-300 print:border-black text-gray-600 text-center print:text-black print:p-2">{entry.reason || '—'}</td>
                                        <td className="p-3 border border-gray-300 print:border-black text-gray-600 text-center print:text-black print:p-2">{entry.nextTime || '—'}</td>
                                        <td className="p-3 print:hidden text-center">
                                            <button
                                                onClick={() => handleDelete(entry._id)}
                                                className="text-red-600 hover:text-red-800 text-xs font-bold p-1 rounded hover:bg-red-50 transition"
                                                title="حذف"
                                            >
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                !loading && (
                    <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200 text-gray-500">
                        <p className="font-bold text-gray-700 mb-1">لا توجد حصص مسجلة بعد في الدفتر اليومي</p>
                        <p className="text-xs text-gray-400">قم بإضافة الحصص من النموذج أعلاه لتظهر في القائمة</p>
                    </div>
                )
            )}

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 8mm;
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
                        font-size: 11px !important;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse !important;
                        border: 2px solid black !important;
                        font-size: 11px !important;
                    }

                    thead tr {
                        background-color: #f3f4f6 !important;
                        color: black !important;
                    }

                    th, td {
                        border: 1px solid black !important;
                        padding: 5px 6px !important;
                        text-align: center !important;
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
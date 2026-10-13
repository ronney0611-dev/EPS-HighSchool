'use client'

import React, { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useClasses } from '@/hooks/useClasses'
import { useTeacher } from '@/hooks/useTeacher'
import { useTimetable, type TimetableSlot } from '@/hooks/useTimetable'

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']

// minutes since midnight: 08:00-12:00 / 13:30-17:30
const PERIODS = [
    { start: 480, end: 540 }, { start: 540, end: 600 }, { start: 600, end: 660 }, { start: 660, end: 720 },
    { start: 810, end: 870 }, { start: 870, end: 930 }, { start: 930, end: 990 }, { start: 990, end: 1050 },
]
const MORNING = 4 // first afternoon period index
const halfOf = (i: number) => (i < MORNING ? 0 : 1)

const COLORS = [
    'bg-sky-100 border-sky-300 text-sky-900',
    'bg-emerald-100 border-emerald-300 text-emerald-900',
    'bg-amber-100 border-amber-300 text-amber-900',
    'bg-rose-100 border-rose-300 text-rose-900',
    'bg-purple-100 border-purple-300 text-purple-900',
    'bg-teal-100 border-teal-300 text-teal-900',
    'bg-orange-100 border-orange-300 text-orange-900',
    'bg-indigo-100 border-indigo-300 text-indigo-900',
]

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

type Editing = { day: number; startIdx: number; index: number | null }

type RowCell =
    | { kind: 'slot'; startIdx: number; span: number; slot: TimetableSlot }
    | { kind: 'empty'; idx: number }
    | { kind: 'lunch' }

export default function BarnamajUsbu3i() {
    const { classes } = useClasses()
    const { teacher } = useTeacher()
    const { slots, setSlots, loaded, saving, save } = useTimetable()

    const [editing, setEditing] = useState<Editing | null>(null)
    const [formClass, setFormClass] = useState('')
    const [formDuration, setFormDuration] = useState(2)
    const [dirty, setDirty] = useState(false)

    const classById = useMemo(() => new Map(classes.map(c => [String(c._id), c])), [classes])
    const colorOf = (classId: string) => {
        const i = classes.findIndex(c => String(c._id) === classId)
        return COLORS[(i < 0 ? 0 : i) % COLORS.length]
    }

    const slotAt = (day: number, i: number) =>
        slots.findIndex(s => s.day === day && PERIODS[i].start >= s.start && PERIODS[i].end <= s.end)

    const periodCount = (s: TimetableSlot) => PERIODS.filter(p => p.start >= s.start && p.end <= s.end).length

    // longest duration from startIdx without overlap and without crossing lunch
    const maxDuration = (day: number, startIdx: number, ignoreIndex: number | null) => {
        let d = 0
        for (let i = startIdx; i < PERIODS.length && d < 3 && halfOf(i) === halfOf(startIdx); i++) {
            const idx = slotAt(day, i)
            if (idx !== -1 && idx !== ignoreIndex) break
            d++
        }
        return Math.max(d, 1)
    }

    const buildRow = (day: number): RowCell[] => {
        const out: RowCell[] = []
        let i = 0
        while (i < PERIODS.length) {
            if (i === MORNING) out.push({ kind: 'lunch' })
            const idx = slotAt(day, i)
            if (idx !== -1 && slots[idx].start === PERIODS[i].start) {
                const span = periodCount(slots[idx])
                out.push({ kind: 'slot', startIdx: i, span, slot: slots[idx] })
                i += span
            } else {
                out.push({ kind: 'empty', idx: i })
                i++
            }
        }
        return out
    }

    const openCell = (day: number, i: number) => {
        const idx = slotAt(day, i)
        if (idx !== -1) {
            const s = slots[idx]
            setEditing({ day, startIdx: PERIODS.findIndex(p => p.start === s.start), index: idx })
            setFormClass(s.classId)
            setFormDuration(periodCount(s))
        } else {
            setEditing({ day, startIdx: i, index: null })
            setFormClass(classes[0]?._id ? String(classes[0]._id) : '')
            setFormDuration(Math.min(2, maxDuration(day, i, null)))
        }
    }

    const applyEdit = () => {
        if (!editing) return
        if (!formClass) return toast.error('اختر القسم')
        const slot: TimetableSlot = {
            day: editing.day,
            start: PERIODS[editing.startIdx].start,
            end: PERIODS[editing.startIdx + formDuration - 1].end,
            classId: formClass,
        }
        setSlots(prev =>
            editing.index === null ? [...prev, slot] : prev.map((s, i) => (i === editing.index ? slot : s))
        )
        setEditing(null)
        setDirty(true)
    }

    const removeEdit = () => {
        if (!editing || editing.index === null) return
        setSlots(prev => prev.filter((_, i) => i !== editing.index))
        setEditing(null)
        setDirty(true)
    }

    const handleSave = async () => {
        const ok = await save(slots)
        if (ok) {
            toast.success('تم حفظ البرنامج الأسبوعي')
            setDirty(false)
        } else {
            toast.error('فشل الحفظ، حاول مرة أخرى')
        }
    }

    const totalHours = slots.reduce((a, s) => a + (s.end - s.start) / 60, 0)

    if (!loaded) return <div className="text-center my-20 text-slate-500">⏳ جاري التحميل...</div>

    return (
        <div dir="rtl" className="min-h-screen p-3 md:p-8 text-right font-sans">
            {/* Control bar */}
            <div className="w-full md:max-w-[297mm] mx-auto mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-lg font-black text-slate-900">📅 البرنامج الأسبوعي</h1>
                    <p className="text-xs text-slate-500 mt-0.5">اضغط على أي خانة لإضافة حصة أو تعديلها</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving || !dirty}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
                    >
                        {saving ? '⏳ ...' : dirty ? '💾 حفظ' : '✓ محفوظ'}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
                    >
                        🖨️ طباعة
                    </button>
                </div>
            </div>

            {classes.length === 0 && (
                <div className="w-full md:max-w-[297mm] mx-auto mb-4 p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-sm font-bold">
                    لا توجد أقسام، أضف أقسامك أولا
                </div>
            )}

            {/* Printable sheet */}
            <div
                id="print-barnamaj"
                className="w-full md:w-[297mm] mx-auto bg-white border border-slate-200/90 shadow-xl p-6 print:shadow-none print:border-none print:p-0"
            >
                <div className="border border-slate-300 rounded-xl mb-4 overflow-hidden bg-slate-50/50">
                    <div className="bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 text-white text-center py-2.5 font-black text-lg tracking-wide">
                        استعمال الزمن
                    </div>
                    <div className="grid grid-cols-2 p-3 text-xs font-medium text-slate-700 gap-y-1.5">
                        <div>المؤسسة: <span className="font-bold text-slate-900">{teacher?.school || ''}</span></div>
                        <div className="text-left">السنة الدراسية: <span className="font-bold text-slate-900">2026/2027</span></div>
                        <div>الأستاذ: <span className="font-bold text-slate-900">{teacher?.name || ''}</span></div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-xs table-fixed">
                        <thead>
                            <tr className="bg-slate-800 text-slate-100 font-bold">
                                <th className="border border-slate-700 p-2 w-20">اليوم</th>
                                {PERIODS.map((p, i) => (
                                    <React.Fragment key={i}>
                                        {i === MORNING && <th className="border border-slate-700 p-1 w-8 text-[9px] bg-slate-700">راحة</th>}
                                        <th className="border border-slate-700 p-2 text-[10px]" dir="ltr">
                                            {fmt(p.start)} - {fmt(p.end)}
                                        </th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((dayName, day) => (
                                <tr key={day}>
                                    <td className="border border-slate-300 bg-slate-100 font-extrabold text-slate-800 p-2">{dayName}</td>
                                    {buildRow(day).map((cell, ci) => {
                                        if (cell.kind === 'lunch') {
                                            return <td key={`lunch-${ci}`} className="border border-slate-300 bg-slate-100" />
                                        }
                                        if (cell.kind === 'slot') {
                                            return (
                                                <td key={`s-${cell.startIdx}`} colSpan={cell.span} className="border border-slate-300 p-1 h-16">
                                                    <button
                                                        onClick={() => openCell(day, cell.startIdx)}
                                                        className={`w-full h-full rounded-lg border font-black text-sm ${colorOf(cell.slot.classId)} print:rounded-none`}
                                                    >
                                                        {classById.get(cell.slot.classId)?.name ?? '—'}
                                                        <div className="text-[10px] font-semibold opacity-70" dir="ltr">
                                                            {fmt(cell.slot.start)} - {fmt(cell.slot.end)}
                                                        </div>
                                                    </button>
                                                </td>
                                            )
                                        }
                                        return (
                                            <td key={`e-${cell.idx}`} className="border border-slate-200 p-1 h-16">
                                                <button
                                                    onClick={() => openCell(day, cell.idx)}
                                                    className="w-full h-full rounded-lg text-slate-300 hover:bg-slate-50 hover:text-slate-500 text-lg print:hidden"
                                                >
                                                    +
                                                </button>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 font-bold flex justify-between text-xs text-slate-800 px-8">
                    <div className="flex flex-col items-center gap-6">
                        <span>الأستاذ(ة):</span>
                        <span className="text-slate-400 font-normal text-[10px]">التوقيع</span>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        <span>السيد المدير:</span>
                        <span className="text-slate-400 font-normal text-[10px]">التوقيع والختم</span>
                    </div>
                </div>
            </div>

            {/* Edit panel */}
            {editing && (
                <div className="w-full md:max-w-[297mm] mx-auto mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-wrap items-end gap-3 print:hidden">
                    <div className="text-sm font-black text-blue-900">
                        {DAYS[editing.day]} · <span dir="ltr">{fmt(PERIODS[editing.startIdx].start)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-500">القسم</label>
                        <select
                            value={formClass}
                            onChange={e => setFormClass(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-bold text-black"
                        >
                            {classes.map(c => (
                                <option key={c._id} value={String(c._id)}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-500">المدة</label>
                        <div className="flex gap-1">
                            {[1, 2, 3].map(d => {
                                const allowed = d <= maxDuration(editing.day, editing.startIdx, editing.index)
                                return (
                                    <button
                                        key={d}
                                        disabled={!allowed}
                                        onClick={() => setFormDuration(d)}
                                        className={`px-3 py-2 rounded-lg text-sm font-bold border disabled:opacity-30 ${formDuration === d ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
                                    >
                                        {d} سا
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex gap-2 mr-auto">
                        {editing.index !== null && (
                            <button onClick={removeEdit} className="px-4 py-2 rounded-lg bg-rose-100 text-rose-800 text-sm font-bold">
                                حذف
                            </button>
                        )}
                        <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-bold">
                            إلغاء
                        </button>
                        <button onClick={applyEdit} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold">
                            تأكيد
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page { size: A4 landscape; margin: 0; }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
                    body *:not(#print-barnamaj):not(#print-barnamaj *) { visibility: hidden !important; }
                    #print-barnamaj, #print-barnamaj * { visibility: visible !important; }
                    #print-barnamaj {
                        position: absolute !important;
                        top: 0; right: 0;
                        width: 100% !important;
                        padding: 8mm !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    )
}
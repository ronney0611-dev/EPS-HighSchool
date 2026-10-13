'use client'

import type { DailyLogEntryLycee } from '@/hooks/useDailyLogLycee'
import {
    type Level, LEVEL_LABEL, DAYS, sportLabel, displayDate, weekNumberOf, weekRangeLabel,
} from '@/src/lib/daftarUtils'

export type DaftarPageData = {
    key: string
    weekStart?: string
    level?: Level
    subtitle?: string
    rows: DailyLogEntryLycee[]
}

const MIN_ROWS = 16
const td = 'px-2 py-1.5 border border-gray-500'

const dayLabel = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    return `${DAYS[dow] ?? ''} ${displayDate(iso)}`
}

export default function DaftarPage({
    page,
    teacherName,
    school,
    onDelete,
}: {
    page: DaftarPageData
    teacherName: string
    school: string
    onDelete?: (id: string) => void
}) {
    // one level of one week → cards; otherwise → table
    const useCards = !!page.level && !!page.weekStart

    return (
        <div className="daftar-page w-full bg-white text-black flex flex-col">
            {/* ---------- header ---------- */}
            <div className="text-center mb-4 pb-3 border-b-2 border-black">
                <h1 className="text-2xl font-extrabold">الدفتر اليومي للتربية البدنية والرياضية</h1>
                <div className="flex justify-between items-center text-sm font-bold text-gray-900 mt-3 px-2">
                    <span>المؤسسة: {school}</span>
                    <span>الأستاذ(ة): {teacherName}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-1 text-sm font-black text-gray-900 mt-2">
                    {page.level && <span>المستوى: {LEVEL_LABEL[page.level]}</span>}
                    {page.subtitle && <span>{page.subtitle}</span>}
                </div>
            </div>

            {/* ---------- body ---------- */}
            <div className="flex-1 flex flex-col">
                {useCards ? <CardsView rows={page.rows} onDelete={onDelete} /> : <TableView rows={page.rows} onDelete={onDelete} />}
            </div>

            {/* ---------- signatures ---------- */}
            <div className="pt-6 grid grid-cols-3 text-center text-sm font-black text-gray-900">
                <div>الأستاذ(ة)<div className="h-14" /></div>
                <div>السيد المدير<div className="h-14" /></div>
                <div>المفتش(ة)<div className="h-14" /></div>
            </div>
        </div>
    )
}

/* ================= cards (one level) ================= */
function CardsView({ rows, onDelete }: { rows: DailyLogEntryLycee[]; onDelete?: (id: string) => void }) {
    if (rows.length === 0) {
        return <p className="text-center text-sm text-gray-500 py-10">لا توجد حصص مسجلة في هذا الأسبوع</p>
    }

    // group by day, keeping the sorted order
    const days: { date: string; rows: DailyLogEntryLycee[] }[] = []
    rows.forEach(e => {
        const last = days[days.length - 1]
        if (last && last.date === e.date) last.rows.push(e)
        else days.push({ date: e.date, rows: [e] })
    })

    return (
        <div className="space-y-4">
            {days.map(day => (
                <div key={day.date} className="daftar-day space-y-2">
                    <h2 className="text-base font-black border-b border-gray-400 pb-1">{dayLabel(day.date)}</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {day.rows.map(e => (
                            <div key={e._id} className="daftar-card relative border-2 border-gray-800 rounded-lg p-3 space-y-1.5 text-sm min-h-[42mm]">
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(e._id)}
                                        className="print:hidden absolute top-2 left-2 text-red-600 text-xs font-bold"
                                    >
                                        حذف
                                    </button>
                                )}
                                <p className="text-base font-black">{e.className} · {sportLabel(e.sport)}</p>
                                <p className="font-bold text-gray-800" dir="rtl">
                                    التوقيت: <span dir="ltr">{e.time}</span>
                                </p>
                                <p className="leading-snug">
                                    <span className="font-black">هدف الحصة: </span>{e.goal || '................................................'}
                                </p>
                                <p className="font-black">
                                    الإنجاز: {e.done ? 'تم الانجاز' : 'لم يتم الانجاز'}
                                </p>
                                {!e.done && (
                                    <>
                                        <p><span className="font-black">السبب: </span>{e.reason || '........................'}</p>
                                        <p><span className="font-black">المقترحات: </span>{e.nextTime || '........................'}</p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ================= table (all levels) ================= */
function TableView({ rows, onDelete }: { rows: DailyLogEntryLycee[]; onDelete?: (id: string) => void }) {
    const padCount = Math.max(0, MIN_ROWS - rows.length)
    return (
        <table className="daftar-table w-full h-full border-collapse text-center text-sm">
            <thead>
                <tr className="bg-gray-100 text-gray-900 font-black text-sm">
                    <th className={`${td} w-[8%]`}>القسم</th>
                    <th className={`${td} w-[12%]`}>النشاط</th>
                    <th className={`${td} w-[28%]`}>هدف الحصة</th>
                    <th className={`${td} w-[10%]`}>التاريخ</th>
                    <th className={`${td} w-[11%]`}>التوقيت</th>
                    <th className={`${td} w-[7%]`}>الإنجاز</th>
                    <th className={`${td} w-[12%]`}>السبب</th>
                    <th className={`${td} w-[12%]`}>المقترحات</th>
                    {onDelete && <th className="p-1 print:hidden w-[3%]"></th>}
                </tr>
            </thead>
            <tbody>
                {rows.map(e => (
                    <tr key={e._id}>
                        <td className={`${td} font-black`}>{e.className}</td>
                        <td className={`${td} font-bold`}>{sportLabel(e.sport)}</td>
                        <td className={`${td} text-right leading-snug`}>{e.goal || ''}</td>
                        <td className={`${td} font-semibold`}>{displayDate(e.date)}</td>
                        <td className={td} dir="ltr">{e.time}</td>
                        <td className={`${td} font-black`}>{e.done ? 'نعم' : 'لا'}</td>
                        <td className={`${td} text-xs`}>{e.reason}</td>
                        <td className={`${td} text-xs`}>{e.nextTime}</td>
                        {onDelete && (
                            <td className="p-1 print:hidden">
                                <button onClick={() => onDelete(e._id)} className="text-red-600 text-xs font-bold">حذف</button>
                            </td>
                        )}
                    </tr>
                ))}
                {Array.from({ length: padCount }).map((_, i) => (
                    <tr key={`pad-${i}`}>
                        {Array.from({ length: 8 }).map((__, j) => (
                            <td key={j} className={td}>&nbsp;</td>
                        ))}
                        {onDelete && <td className="print:hidden" />}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
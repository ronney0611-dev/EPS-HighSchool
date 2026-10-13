'use client'

import React, { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import type { DailyLogEntryLycee } from '@/hooks/useDailyLogLycee'
import DaftarPage, { type DaftarPageData } from './DaftarPage'
import {
    type Level, isoLocal, weekStartOf, weekNumberOf, weekRangeLabel, trimesterOf, sortEntries,
} from '@/src/lib/daftarUtils'

type PrintMode = 'week' | 'weekLevel' | 'all'
type Range = 'all' | Level
type LevelFilter = 'all' | Level

const RANGE_LABEL: Record<Range, string> = { all: 'السنة كاملة', '1': 'الفصل الأول', '2': 'الفصل الثاني', '3': 'الفصل الثالث' }

export default function DaftarSheet({
    entries,
    teacherName,
    school,
    levelOf,
    onDelete,
}: {
    entries: DailyLogEntryLycee[]
    teacherName: string
    school: string
    levelOf: (classId: string, className?: string) => Level
    onDelete: (id: string) => void
}) {
    const currentWeek = weekStartOf(isoLocal(new Date()))
    const sorted = useMemo(() => sortEntries(entries), [entries])

    // weeks that have entries + the current week
    const weeks = useMemo(() => {
        const set = new Set(sorted.map(e => weekStartOf(e.date)))
        set.add(currentWeek)
        return [...set].sort()
    }, [sorted, currentWeek])

    const [weekSel, setWeekSel] = useState<string | null>(null)
    const week = weekSel && weeks.includes(weekSel) ? weekSel : currentWeek
    const weekIdx = weeks.indexOf(week)

    const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
    const [menuOpen, setMenuOpen] = useState(false)
    const [range, setRange] = useState<Range>('all')
    const [printMode, setPrintMode] = useState<PrintMode>('week')

    const lvl = (e: DailyLogEntryLycee) => levelOf(String(e.classId), e.className)
    const byLevel = (rows: DailyLogEntryLycee[], l: LevelFilter) => (l === 'all' ? rows : rows.filter(e => lvl(e) === l))

    const buildPages = (mode: PrintMode): DaftarPageData[] => {
        if (mode === 'week') {
            return [{
                key: `w-${week}`,
                weekStart: week,
                level: levelFilter === 'all' ? undefined : levelFilter,
                rows: byLevel(sorted.filter(e => weekStartOf(e.date) === week), levelFilter),
            }]
        }

        const rows = sorted.filter(e => range === 'all' || trimesterOf(e.date) === range)

        if (mode === 'all') {
            return [{
                key: 'all',
                level: levelFilter === 'all' ? undefined : levelFilter,
                subtitle: `السجل الكامل · ${RANGE_LABEL[range]}`,
                rows: byLevel(rows, levelFilter),
            }]
        }

        // one page per week per level
        const pages: DaftarPageData[] = []
        const ws = [...new Set(rows.map(e => weekStartOf(e.date)))].sort()
        ws.forEach(w => {
            (['1', '2', '3'] as Level[]).forEach(l => {
                const r = rows.filter(e => weekStartOf(e.date) === w && lvl(e) === l)
                if (r.length) pages.push({ key: `${w}-${l}`, weekStart: w, level: l, rows: r })
            })
        })
        return pages
    }

    const screenPage = buildPages('week')[0]
    const printPages = buildPages(printMode)

    const doPrint = (mode: PrintMode) => {
        const pages = buildPages(mode)
        if (pages.length === 0 || pages.every(p => p.rows.length === 0)) {
            toast.error('لا توجد حصص للطباعة في هذه الفترة')
            return
        }
        setPrintMode(mode)
        setMenuOpen(false)
        setTimeout(() => window.print(), 100)
    }

    return (
        <div className="space-y-4">
            {/* ---------- toolbar ---------- */}
            <div className="print:hidden space-y-3">
                {/* week navigator */}
                <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-2xl p-2">
                    <button
                        onClick={() => weekIdx > 0 && setWeekSel(weeks[weekIdx - 1])}
                        disabled={weekIdx <= 0}
                        className="px-3 py-2 rounded-xl bg-slate-100 text-black font-bold disabled:opacity-30"
                    >
                        →
                    </button>
                    <div className="text-center">
                        <p className="text-[14px] font-bold text-black ">{weekRangeLabel(week)}</p>
                    </div>
                    <button
                        onClick={() => weekIdx < weeks.length - 1 && setWeekSel(weeks[weekIdx + 1])}
                        disabled={weekIdx >= weeks.length - 1}
                        className="px-3 py-2 rounded-xl bg-slate-100 text-black font-black disabled:opacity-30"
                    >
                        ←
                    </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* level filter */}
                    <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                        {(['all', '1', '2', '3'] as const).map(l => (
                            <button
                                key={l}
                                onClick={() => setLevelFilter(l)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${levelFilter === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                            >
                                {l === 'all' ? 'الكل' : `المستوى ${l}`}
                            </button>
                        ))}
                    </div>

                    {/* print menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold"
                        >
                            🖨️ طباعة ▾
                        </button>

                        {menuOpen && (
                            <div className="absolute left-0 mt-2 w-72 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2">
                                <button
                                    onClick={() => doPrint('week')}
                                    className="w-full text-right p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100"
                                >
                                    <p className="text-sm font-black text-slate-900">📄 هذا الأسبوع</p>
                                    <p className="text-[11px] text-slate-500">الأسبوع المعروض {levelFilter !== 'all' && `· المستوى ${levelFilter}`}</p>
                                </button>

                                <div className="pt-1 border-t border-slate-100">
                                    <p className="text-[11px] font-bold text-slate-500 mb-1.5">الفترة:</p>
                                    <div className="grid grid-cols-4 gap-1">
                                        {(['all', '1', '2', '3'] as const).map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setRange(r)}
                                                className={`py-1.5 rounded-lg text-[11px] font-bold border ${range === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                                            >
                                                {r === 'all' ? 'السنة' : `ف${r}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => doPrint('weekLevel')}
                                    className="w-full text-right p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100"
                                >
                                    <p className="text-sm font-black text-slate-900">🗂️ كل أسبوع وكل مستوى في صفحة</p>
                                    <p className="text-[11px] text-slate-500">{RANGE_LABEL[range]}</p>
                                </button>

                                <button
                                    onClick={() => doPrint('all')}
                                    className="w-full text-right p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100"
                                >
                                    <p className="text-sm font-black text-slate-900">📜 الدفتر كاملا (متواصل)</p>
                                    <p className="text-[11px] text-slate-500">{RANGE_LABEL[range]} {levelFilter !== 'all' && `· المستوى ${levelFilter}`}</p>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- screen: current week ---------- */}
            <div className="print:hidden overflow-x-auto bg-slate-200 rounded-2xl p-4">
                <div className="mx-auto bg-white shadow-xl w-[210mm] min-h-[297mm] p-[10mm] flex">
                    <DaftarPage page={screenPage} teacherName={teacherName} school={school} onDelete={onDelete} />
                </div>
            </div>

            {/* ---------- print: selected mode ---------- */}
            <div id="a4-daftar-print" className="hidden print:block">
                {printPages.map(p => (
                    <DaftarPage key={p.key} page={p} teacherName={teacherName} school={school} />
                ))}
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: A4 portrait; margin: 0; }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
                    body *:not(#a4-daftar-print):not(#a4-daftar-print *) { visibility: hidden !important; }
                    #a4-daftar-print, #a4-daftar-print * { visibility: visible !important; }
                    #a4-daftar-print {
                        display: block !important;
                        position: absolute !important;
                        top: 0; right: 0;
                        width: 210mm !important;
                    }

                    /* one A4 sheet per page, padding inside the sheet */
                    #a4-daftar-print .daftar-page {
                        box-sizing: border-box;
                        width: 210mm;
                        min-height: 296mm;
                        padding: 12mm 12mm 10mm;
                        break-after: page;
                        page-break-after: always;
                    }
                    #a4-daftar-print .daftar-page:last-child { break-after: auto; page-break-after: auto; }

                    #a4-daftar-print .daftar-card,
                    #a4-daftar-print .daftar-day h2 { break-inside: avoid; page-break-inside: avoid; }

                    #a4-daftar-print h1 { font-size: 18px !important; }
                    #a4-daftar-print table { border-collapse: collapse !important; border: 1.5px solid black !important; font-size: 11px !important; }
                    #a4-daftar-print thead { display: table-header-group; }
                    #a4-daftar-print th, #a4-daftar-print td { border: 1px solid black !important; padding: 4px 5px !important; line-height: 1.3 !important; }
                    #a4-daftar-print tr { break-inside: avoid; }
                }
            `}</style>
        </div>
    )
}
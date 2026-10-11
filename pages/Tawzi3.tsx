'use client'

import React, { useMemo, useState } from 'react'
import { useClasses } from '@/hooks/useClasses'
import { useTeacher } from '@/hooks/useTeacher'
import type { ISessionPrimaire } from '@/app/models/Wahdaprimairedoc'
import {
  PRIMAIRE_CURRICULUM,
  PRIMAIRE_MAIDANS,
  getPrimaireLevelFromClassName,
  type PrimaireLevelKey,
} from '@/src/config/Wahdaprimairecurriculum'
import {
  ANNUAL_PLAN_PRIMAIRE,
  getTourFromLevel,
  fitSessions,
  dedupeConsecutive,
  pad2,
} from '@/src/config/primaireAnnualPlanConfig'

const TYPE_LABEL: Record<ISessionPrimaire['type'], string> = {
  diagnostic: 'تقويم تشخيصي',
  learning: 'حصة تعليمية',
  integration: 'حصة إدماجية',
  summative: 'تقويم تحصيلي',
}

const MONTHS = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

type RowType = 'regular' | 'organize' | 'diagnostic' | 'merged' | 'summative' | 'remedial' | 'holiday'

const ROW_STYLES: Record<RowType, string> = {
  organize: 'bg-amber-50/70 text-amber-900',
  diagnostic: 'bg-amber-50/70 text-amber-900',
  summative: 'bg-emerald-50/70 text-emerald-900 font-medium',
  merged: 'bg-sky-50/70 text-sky-900',
  remedial: 'bg-purple-50/70 text-purple-900',
  holiday: 'bg-rose-50/70 text-rose-900 font-medium',
  regular: 'bg-white text-slate-800',
}

const TYPE_BADGES: Record<RowType, { label: string; style: string }> = {
  organize: { label: 'تنظيم', style: 'bg-amber-100 text-amber-800 border-amber-300' },
  diagnostic: { label: 'تشخيصي', style: 'bg-amber-100 text-amber-800 border-amber-300' },
  summative: { label: 'تحصيلي', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  merged: { label: 'إدماج', style: 'bg-sky-100 text-sky-800 border-sky-300' },
  remedial: { label: 'معالجة', style: 'bg-purple-100 text-purple-800 border-purple-300' },
  holiday: { label: 'عطلة', style: 'bg-rose-100 text-rose-800 border-rose-300' },
  regular: { label: 'عادي', style: 'bg-slate-100 text-slate-700 border-slate-300' },
}

const rowTypeOf = (label: string): RowType => {
  if (label.includes('تحصيل')) return 'summative'
  if (label.includes('تشخيص')) return 'diagnostic'
  if (label.includes('إدماج') || label.includes('ادماج')) return 'merged'
  if (label.includes('معالجة')) return 'remedial'
  if (label.includes('تنظيم')) return 'organize'
  return 'regular'
}

const fmt = (d: string) => d.split('-').reverse().join('/')
const range = (from: string, to: string) => `${fmt(from)} - ${fmt(to)}`
const monthIndex = (d: string) => Number(d.slice(5, 7)) - 1

type Inner = { monthSpan: number; monthName: string; maidanSpan: number; maidanName: string; triIdx: number }
type Row =
  | ({ kind: 'week'; key: string; dates: string; nums: string; label: string } & Inner)
  | ({ kind: 'break'; key: string; label: string; dates: string } & Inner)
  | { kind: 'fullBreak'; key: string; label: string; dates: string }

export default function TawziSanawiPrimaire() {
  const { classes } = useClasses()
  const { teacher } = useTeacher()

  const primaireClasses = useMemo(() => (Array.isArray(classes) ? classes : []), [classes])
  const [classId, setClassId] = useState('')
  const effectiveClassId = classId || primaireClasses[0]?._id || ''

  const level: PrimaireLevelKey = useMemo(
    () => getPrimaireLevelFromClassName(primaireClasses.find(c => c._id === effectiveClassId)?.name),
    [primaireClasses, effectiveClassId]
  )
  const tour = getTourFromLevel(String(level))

  const { rows, missing } = useMemo(() => {
    const out: Row[] = []
    let missing = false

    ANNUAL_PLAN_PRIMAIRE.forEach((tri, ti) => {
      const template = PRIMAIRE_CURRICULUM[level]?.[tri.maidanId]
      if (!template) missing = true

      const names = dedupeConsecutive(
        (template?.sessions ?? []).map(s => s.unit_name?.trim() || TYPE_LABEL[s.type])
      )
      const total = tri.rows.reduce((n, r) => n + (r.kind === 'week' ? r.slots[tour] : 0), 0)
      const fitted = fitSessions(names, total)
      const maidanName =
        template?.maidan_name || PRIMAIRE_MAIDANS.find(m => m.id === tri.maidanId)?.name || ''

      const monthKeys: number[] = []
      let last = -1
      tri.rows.forEach(r => {
        if (r.kind === 'week') last = monthIndex(r.from)
        monthKeys.push(last)
      })

      let cursor = 0
      tri.rows.forEach((r, i) => {
        let monthSpan = 0
        if (i === 0 || monthKeys[i] !== monthKeys[i - 1]) {
          let j = i
          while (j < tri.rows.length && monthKeys[j] === monthKeys[i]) j++
          monthSpan = j - i
        }
        const base: Inner = {
          monthSpan,
          monthName: MONTHS[monthKeys[i]] ?? '',
          maidanSpan: i === 0 ? tri.rows.length : 0,
          maidanName,
          triIdx: ti,
        }

        if (r.kind === 'break') {
          out.push({ kind: 'break', key: `t${ti}-b${i}`, label: r.label, dates: range(r.from, r.to), ...base })
          return
        }

        const idx = Array.from({ length: r.slots[tour] }, (_, k) => cursor + k)
        cursor += idx.length
        out.push({
          kind: 'week',
          key: `t${ti}-w${i}`,
          dates: range(r.from, r.to),
          nums: idx.map(k => pad2(k + 1)).reverse().join(' + '),
          label: r.label ?? idx.map(k => fitted[k]).join(' + '),
          ...base,
        })
      })

      if (tri.breakAfter) {
        out.push({
          kind: 'fullBreak',
          key: `t${ti}-after`,
          label: tri.breakAfter.label,
          dates: range(tri.breakAfter.from, tri.breakAfter.to),
        })
      }
    })

    return { rows: out, missing }
  }, [level, tour])

  const Badge = ({ type }: { type: RowType }) =>
    type === 'regular' ? null : (
      <span className={`text-[9px] px-1.5 py-0.5 rounded border print:hidden font-bold whitespace-nowrap ${TYPE_BADGES[type].style}`}>
        {TYPE_BADGES[type].label}
      </span>
    )

  return (
    <div className="min-h-screen p-3 md:p-8 text-right font-sans" dir="rtl">
      {/* Top Control Bar */}
      <div className="w-full md:max-w-[210mm] mx-auto mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 print:hidden backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">القسم</label>
            <select
              value={effectiveClassId}
              onChange={e => setClassId(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            >
              {primaireClasses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {primaireClasses.length > 0 && (
          <button
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة التوزيع (A4)
          </button>
        )}
      </div>

      {primaireClasses.length === 0 && (
        <div className="w-full md:max-w-[210mm] mx-auto p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-sm font-bold">
          لا توجد أقسام، أضف قسما أولا
        </div>
      )}
      {primaireClasses.length > 0 && missing && (
        <div className="w-full md:max-w-[210mm] mx-auto mb-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold print:hidden">
          بعض الميادين لا تحتوي على منهاج لهذا المستوى
        </div>
      )}

      {primaireClasses.length > 0 && (
        <div
          id="print-tawzi-primaire"
          className="w-full md:w-[210mm] mx-auto bg-white border border-slate-200/90 shadow-xl p-6 print:shadow-none print:border-none print:p-0"
        >
          {/* Header Information Box */}
          <div className="border border-slate-300 rounded-xl mb-4 overflow-hidden bg-slate-50/50">
            <div className="bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 text-white text-center py-2.5 font-black text-lg tracking-wide shadow-inner">
              مخطط التوزيع السنوي للميادين لبناء التعلمات
            </div>

            <div className="grid grid-cols-2 p-3 text-xs border-b border-slate-200 font-medium text-slate-700 gap-y-1.5">
              <div>المؤسسة: <span className="font-bold text-slate-900">{teacher?.school || ''}</span></div>
              <div className="text-left">السنة الدراسية: <span className="font-bold text-slate-900">2026/2027</span></div>
              <div>الأستاذ: <span className="font-bold text-slate-900">{teacher?.name || ''}</span></div>
            </div>
          </div>

          {/* Main Schedule Table */}
          <div className="border border-slate-300 overflow-hidden print:rounded-none overflow-x-auto">
            <table key={`${level}`} className="w-full border-collapse text-[11px] text-center">
              <thead>
                <tr className="bg-slate-800 text-slate-100 font-bold">
                  <th className="border-b border-slate-700 p-2 w-12">الميدان</th>
                  <th className="border-b border-slate-700 p-2 w-14">الشهر</th>
                  <th className="border-b border-slate-700 p-2 w-36">الأسابيع</th>
                  <th className="border-b border-slate-700 p-2 w-16">الحصص</th>
                  <th className="border-b border-slate-700 p-2">نوع الحصة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map(r => {
                  if (r.kind === 'fullBreak') {
                    return (
                      <tr key={r.key} className={ROW_STYLES.holiday}>
                        <td colSpan={5} className="border border-slate-300 p-1.5 font-bold">
                          <div className="flex items-center justify-center gap-3">
                            <span>{r.label}</span>
                            <span className="font-semibold text-rose-700 text-[10px] md:text-xs" dir="ltr">{r.dates}</span>
                            <Badge type="holiday" />
                          </div>
                        </td>
                      </tr>
                    )
                  }

                  const type: RowType = r.kind === 'break' ? 'holiday' : rowTypeOf(r.label)

                  return (
                    <tr key={r.key} className={`${ROW_STYLES[type]} transition-colors hover:bg-slate-100/50`}>
                      {r.maidanSpan > 0 && (
                        <td
                          rowSpan={r.maidanSpan}
                          className="border border-slate-300 font-extrabold bg-slate-100 text-slate-800 align-middle [writing-mode:vertical-rl] p-2 text-xs tracking-wider border-l-2 border-l-slate-400"
                        >
                          {r.maidanName}
                        </td>
                      )}
                      {r.monthSpan > 0 && (
                        <td
                          rowSpan={r.monthSpan}
                          className="border border-slate-200 p-1.5 font-bold text-slate-700 bg-slate-50 align-middle"
                        >
                          {r.monthName}
                        </td>
                      )}

                      {r.kind === 'break' ? (
                        <td colSpan={3} className="border border-slate-200 p-1.5 font-bold">
                          <div className="flex items-center justify-center gap-3">
                            <span>{r.label}</span>
                            <span className="font-semibold text-rose-700 text-[10px] md:text-xs" dir="ltr">{r.dates}</span>
                            <Badge type="holiday" />
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="border border-slate-200 p-1.5 font-semibold text-slate-600 text-[10px] md:text-xs" dir="ltr">
                            {r.dates}
                          </td>
                          <td className="border border-slate-200 p-1.5 font-black text-blue-950">
                            <span dir="ltr">{r.nums}</span>
                          </td>
                          <td className="border border-slate-200 p-1.5 text-right px-2">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                className="outline-none focus:bg-yellow-50 rounded px-0.5"
                              >
                                {r.label}
                              </span>
                              <Badge type={type} />
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Signatures */}
          <div className="mt-8 font-bold flex justify-between text-xs text-slate-800 px-8 print:my-6">
            <div className="flex flex-col items-center gap-6">
              <span>الأستاذ(ة):</span>
              <span className="text-slate-400 font-normal text-[10px]">التوقيع والختم</span>
            </div>
            <div className="flex flex-col items-center gap-6">
              <span>السيد المدير:</span>
              <span className="text-slate-400 font-normal text-[10px]">التوقيع والختم</span>
            </div>
            <div className="flex flex-col items-center gap-6">
              <span>المفتش(ة):</span>
              <span className="text-slate-400 font-normal text-[10px]">التوقيع والختم</span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    body *:not(#print-tawzi-primaire):not(#print-tawzi-primaire *):not(:has(#print-tawzi-primaire)) {
                        visibility: hidden !important;
                        height: 0 !important;
                        min-height: 0 !important;
                        max-height: 0 !important;
                        overflow: hidden !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                    }
                    #print-tawzi-primaire, #print-tawzi-primaire * {
                        visibility: visible !important;
                    }
                    #print-tawzi-primaire {
                        position: static !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 auto !important;
                        padding: 6mm 8mm !important;
                        box-shadow: none !important;
                    }
                    #print-tawzi-primaire td {
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                        line-height: 1.2 !important;
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
'use client';

import React, { useMemo, useState } from 'react';
import { useTeacher } from "@/hooks/useTeacher";
import { planOfYearConfig } from '@/src/config/highPlan';

const AVAILABLE_LEVELS = [
    { id: 's1', name: 'السنة الأولى ثانوي' },
    { id: 's2', name: 'السنة الثانية ثانوي' },
    { id: 's3', name: 'السنة الثالثة ثانوي' },
];

const SPORT_NAMES: Record<string, string> = {
    sprint: 'الجري السريع',
    basketball: 'كرة السلة',
    longJump: 'القفز الطويل',
    volleyball: 'كرة الطائرة',
    throw: 'دفع الجلة',
    handball: 'كرة اليد',
};

type RowType = 'regular' | 'diagnostic' | 'holiday' | 'exam' | 'summative' | 'merged' | 'competition';

interface ScheduleRow {
    domain: string;
    month: string;
    dates: string;
    unit: string;
    individualGoal: string;
    teamGoal: string;
    type: RowType;
}

type DomainKey = 'd1' | 'd2' | 'd3';
type SportPair = { individual: string; team: string };

const ROW_STYLES: Record<RowType, string> = {
    diagnostic: 'bg-amber-50/70 text-amber-900 border-amber-200',
    holiday: 'bg-rose-50/70 text-rose-900 border-rose-200 font-medium',
    exam: 'bg-indigo-50/70 text-indigo-900 border-indigo-200 font-medium',
    summative: 'bg-emerald-50/70 text-emerald-900 border-emerald-200 font-medium',
    merged: 'bg-sky-50/70 text-sky-900 border-sky-200',
    competition: 'bg-purple-50/70 text-purple-900 border-purple-200',
    regular: 'bg-white text-slate-800 border-slate-200',
};

const TYPE_BADGES: Record<RowType, { label: string; style: string }> = {
    diagnostic: { label: 'تشخيصي', style: 'bg-amber-100 text-amber-800 border-amber-300' },
    holiday: { label: 'عطلة', style: 'bg-rose-100 text-rose-800 border-rose-300' },
    exam: { label: 'اختبارات', style: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    summative: { label: 'تحصيلي', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    merged: { label: 'دمج', style: 'bg-sky-100 text-sky-800 border-sky-300' },
    competition: { label: 'تنافسي', style: 'bg-purple-100 text-purple-800 border-purple-300' },
    regular: { label: 'عادي', style: 'bg-slate-100 text-slate-700 border-slate-300' },
};

// Official 2026/2027 Algerian PE annual schedule — starting 21 September 2026
const ANNUAL_SCHEDULE: ScheduleRow[] = [
    // --- المجال التعلمي الأول ---
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '21/09/2026 - 27/09/2026', unit: '', individualGoal: 'تنظيم واتصال', teamGoal: 'تنظيم واتصال', type: 'diagnostic' },
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '27/09/2026 - 01/10/2026', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '04/10/2026 - 08/10/2026', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '11/10/2026 - 15/10/2026', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '18/10/2026 - 22/10/2026', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '25/10/2026 - 29/10/2026', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '02/11/2026 - 05/11/2026', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '08/11/2026', unit: '05-06', individualGoal: 'دمج الحصة التعلمية 06 و 05', teamGoal: 'دمج الحصة التعلمية 06 و 05', type: 'merged' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '09/11/2026 - 12/11/2026', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '09/11/2026 - 13/11/2026', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },

    // --- المجال التعلمي الثاني ---
    { domain: 'المجال التعلمي الثاني', month: 'نوفمبر', dates: '23/11/2026 - 27/11/2026', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '30/11/2026 - 04/12/2026', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '07/12/2026 - 11/12/2026', unit: '', individualGoal: 'اختبارات الفصل الأول', teamGoal: 'اختبارات الفصل الأول', type: 'exam' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '14/12/2026 - 18/12/2026', unit: '', individualGoal: 'أنشطة تنافسية', teamGoal: 'أنشطة تنافسية', type: 'competition' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '19/12/2026 - 03/01/2027', unit: '', individualGoal: 'عطلة الشتاء', teamGoal: 'عطلة الشتاء', type: 'holiday' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '04/01/2027 - 08/01/2027', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '11/01/2027 - 15/01/2027', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '18/01/2027 - 22/01/2027', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '25/01/2027 - 29/01/2027', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'فيفري', dates: '01/02/2027 - 05/02/2027', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'فيفري', dates: '08/02/2027 - 12/02/2027', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },

    // --- المجال التعلمي الثالث ---
    { domain: 'المجال التعلمي الثالث', month: 'فيفري', dates: '15/02/2027 - 19/02/2027', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الثالث', month: 'فيفري', dates: '22/02/2027 - 26/02/2027', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '01/03/2027 - 05/03/2027', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '08/03/2027 - 12/03/2027', unit: '', individualGoal: 'اختبارات الفصل الثاني', teamGoal: 'اختبارات الفصل الثاني', type: 'exam' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '15/03/2027 - 19/03/2027', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '20/03/2027 - 04/04/2027', unit: '', individualGoal: 'عطلة الربيع', teamGoal: 'عطلة الربيع', type: 'holiday' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '05/04/2027 - 09/04/2027', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '12/04/2027 - 16/04/2027', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '19/04/2027 - 23/04/2027', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'ماي', dates: '26/04/2027 - 30/04/2027', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },
    { domain: 'المجال التعلمي الثالث', month: 'ماي', dates: '02/05/2027 - 08/05/2027', unit: '', individualGoal: 'أنشطة تنافسية', teamGoal: 'أنشطة تنافسية', type: 'competition' },
];

function useDomainSports() {
    const [domainSports, setDomainSports] = useState<Record<DomainKey, SportPair>>({
        d1: { individual: 'sprint', team: 'basketball' },
        d2: { individual: 'throw', team: 'handball' },
        d3: { individual: 'longJump', team: 'volleyball' },
    });

    const setDomain = (key: DomainKey, sports: SportPair) => {
        setDomainSports(prev => ({ ...prev, [key]: sports }));
    };

    return { domainSports, setDomain };
}

function useGroupedSchedule() {
    return useMemo(() => {
        const domains = [
            { id: 'd1', title: 'المجال التعلمي الأول' },
            { id: 'd2', title: 'المجال التعلمي الثاني' },
            { id: 'd3', title: 'المجال التعلمي الثالث' },
        ] as const;

        return domains.map(d => ({
            key: d.id as DomainKey,
            domain: d.title,
            rows: ANNUAL_SCHEDULE.filter(r => r.domain === d.title),
        }));
    }, []);
}

export default function AnnualDistribution() {
    const { teacher } = useTeacher();
    const { domainSports, setDomain } = useDomainSports();
    const groupedSchedule = useGroupedSchedule();

    const [selectedLevel, setSelectedLevel] = useState('s1');
    const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('d1');

    const data = planOfYearConfig[selectedLevel];

    const filteredSchedule = useMemo(() => {
        if (selectedDomainFilter === 'all') {
            return groupedSchedule;
        }
        return groupedSchedule.filter(g => g.key === selectedDomainFilter);
    }, [groupedSchedule, selectedDomainFilter]);

    return (
        <div className="min-h-screen  p-3 md:p-8 text-right font-sans" dir="rtl">
            {/* Top Control Bar */}
            <div className="w-full md:max-w-[210mm] mx-auto mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 print:hidden backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Level Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">المستوى</label>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                        >
                            {AVAILABLE_LEVELS.map((l) => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Domain Filter Select */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">عرض المجال</label>
                        <select
                            value={selectedDomainFilter}
                            onChange={(e) => setSelectedDomainFilter(e.target.value)}
                            className="px-3 py-1.5 border rounded-lg bg-blue-50 text-xs font-bold text-blue-900 border-blue-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                        >
                            <option value="d1">المجال التعلمي الأول</option>
                            <option value="d2">المجال التعلمي الثاني</option>
                            <option value="d3">المجال التعلمي الثالث</option>
                            <option value="all">كل المجالات</option>
                        </select>
                    </div>
                </div>

                {/* Print Button */}
                <button
                    onClick={() => window.print()}
                    className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    طباعة التوزيع (A4)
                </button>
            </div>

            {/* Printable Document Sheet */}
            <div
                id="print-annual-distribution"
                className="w-full md:w-[210mm] mx-auto bg-white border border-slate-200/90 shadow-xl  p-6 print:shadow-none print:border-none print:p-0"
            >
                {/* Header Information Box */}
                <div className="border border-slate-300 rounded-xl mb-4 overflow-hidden bg-slate-50/50">
                    <div className="bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 text-white text-center py-2.5 font-black text-lg tracking-wide shadow-inner">
                        المخطط السنوي
                    </div>

                    <div className="grid grid-cols-2 p-3 text-xs border-b border-slate-200 font-medium text-slate-700 gap-y-1.5">
                        <div>المؤسسة: <span className="font-bold text-slate-900">{teacher?.school || ''}</span></div>
                        <div className="text-left">السنة الدراسية: <span className="font-bold text-slate-900">2026/2027</span></div>
                        <div>الأستاذ: <span className="font-bold text-slate-900">{teacher?.name || ''}</span></div>
                        <div className="text-left">المستوى: <span className="font-bold text-slate-900">{AVAILABLE_LEVELS.find((l) => l.id === selectedLevel)?.name}</span></div>
                    </div>

                    <div className="bg-blue-50/60 p-2.5 text-center text-xs font-bold text-blue-950 flex items-center justify-center gap-1.5">
                        <span className="text-blue-700">الكفاءة الختامية:</span>
                        <span className="font-semibold text-slate-800">{data.kafaaKhitamiya}</span>
                    </div>
                </div>

                {/* Main Schedule Table */}
                <div className="border border-slate-300  overflow-hidden print:rounded-none">
                    <table className="w-full border-collapse text-[11px] text-center">
                        <thead>
                            <tr className="bg-slate-800 text-slate-100 font-bold">
                                <th className="border-b border-slate-700 p-2 w-12">المجال</th>
                                <th className="border-b border-slate-700 p-2 w-14">الشهر</th>
                                <th className="border-b border-slate-700 p-2 w-28">الأسابيع</th>
                                <th className="border-b border-slate-700 p-2 w-12">الوحدة</th>
                                <th className="border-b border-slate-700 p-2 w-28">النشاط الفردي</th>
                                <th className="border-b border-slate-700 p-2">الأهداف</th>
                                <th className="border-b border-slate-700 p-2 w-28">النشاط الجماعي</th>
                                <th className="border-b border-slate-700 p-2">الأهداف</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredSchedule.map((group) => (
                                <DomainSection
                                    key={group.key}
                                    domainTitle={group.domain}
                                    rows={group.rows}
                                    sports={domainSports[group.key]}
                                    onSportsChange={(s) => setDomain(group.key, s)}
                                />
                            ))}
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

            {/* Global Print Styles */}
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
                    body *:not(#print-annual-distribution):not(#print-annual-distribution *):not(:has(#print-annual-distribution)) {
                        visibility: hidden !important;
                        height: 0 !important;
                        min-height: 0 !important;
                        max-height: 0 !important;
                        overflow: hidden !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                    }
                    #print-annual-distribution, #print-annual-distribution * {
                        visibility: visible !important;
                    }
                    #print-annual-distribution {
                        position: static !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    tr {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}

function DomainSection({
    domainTitle,
    rows,
    sports,
    onSportsChange,
}: {
    domainTitle: string;
    rows: ScheduleRow[];
    sports: SportPair;
    onSportsChange: (s: SportPair) => void;
}) {
    return (
        <>
            {rows.map((row, idx) => (
                <tr key={idx} className={`${ROW_STYLES[row.type]} transition-colors hover:bg-slate-100/50`}>
                    {idx === 0 && (
                        <td
                            rowSpan={rows.length}
                            className="border border-slate-300 font-extrabold bg-slate-100 text-slate-800 align-middle [writing-mode:vertical-rl] rotate-180 p-2 text-xs tracking-wider border-l-2 border-l-slate-400"
                        >
                            {domainTitle}
                        </td>
                    )}

                    <td className="border border-slate-200 p-1.5 font-bold text-slate-700">{row.month}</td>
                    <td className="border border-slate-200 p-1.5 font-semibold text-slate-600 dir-ltr text-[10px] md:text-xs">{row.dates}</td>
                    <td className="border border-slate-200 p-1.5 font-black text-blue-950">{row.unit}</td>

                    {idx === 0 && (
                        <td
                            rowSpan={rows.length}
                            className="border border-slate-300 font-bold bg-amber-50/80 text-amber-950 align-middle [writing-mode:vertical-rl] rotate-180 p-2"
                        >
                            <div className="print:hidden">
                                <select
                                    value={sports.individual}
                                    onChange={(e) => onSportsChange({ ...sports, individual: e.target.value })}
                                    className="bg-amber-100/80 hover:bg-amber-100 font-black text-xs text-amber-900 border border-amber-300/80 rounded-md px-1.5 py-1 outline-none cursor-pointer transition"
                                >
                                    {Object.entries(SPORT_NAMES).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <span className="hidden print:inline font-extrabold">{SPORT_NAMES[sports.individual]}</span>
                        </td>
                    )}

                    <td className="border border-slate-200 p-1.5 text-right px-2">
                        <div className="flex items-center justify-between gap-1">
                            <span>{row.individualGoal}</span>
                            {row.type !== 'regular' && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border print:hidden font-bold ${TYPE_BADGES[row.type].style}`}>
                                    {TYPE_BADGES[row.type].label}
                                </span>
                            )}
                        </div>
                    </td>

                    {idx === 0 && (
                        <td
                            rowSpan={rows.length}
                            className="border border-slate-300 font-bold bg-blue-50/80 text-blue-950 align-middle [writing-mode:vertical-rl] rotate-180 p-2"
                        >
                            <div className="print:hidden">
                                <select
                                    value={sports.team}
                                    onChange={(e) => onSportsChange({ ...sports, team: e.target.value })}
                                    className="bg-blue-100/80 hover:bg-blue-100 font-black text-xs text-blue-900 border border-blue-300/80 rounded-md px-1.5 py-1 outline-none cursor-pointer transition"
                                >
                                    {Object.entries(SPORT_NAMES).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <span className="hidden print:inline font-extrabold">{SPORT_NAMES[sports.team]}</span>
                        </td>
                    )}

                    <td className="border border-slate-200 p-1.5 text-right px-2">
                        <div className="flex items-center justify-between gap-1">
                            <span>{row.teamGoal}</span>
                            {row.type !== 'regular' && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border print:hidden font-bold ${TYPE_BADGES[row.type].style}`}>
                                    {TYPE_BADGES[row.type].label}
                                </span>
                            )}
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}
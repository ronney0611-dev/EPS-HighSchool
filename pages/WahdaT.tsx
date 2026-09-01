'use client'

import { planOfYearConfig } from '@/src/config/highPlan';
import React, { useState, useEffect, useMemo } from 'react'
import { useClasses } from '@/hooks/useClasses'
import { useWahda } from '@/hooks/useWahda'
import type { ISession } from '@/app/models/WahdaDoc'
import { ToastContainer, toast } from 'react-toastify'
import level1Curriculum from '@/src/config/level1Curriculum.json'
import level2Curriculum from '@/src/config/level2Curriculum.json'
import level3Curriculum from '@/src/config/level3Curriculum.json'
import { useTeacher } from '@/hooks/useTeacher'

const SPORTS = [
    { key: 'sprint', name: 'سباق السرعة' },
    { key: 'long_jump', name: 'الوثب الطويل' },
    { key: 'shot_put', name: 'دفع الجلة' },
    { key: 'basketball', name: 'كرة السلة' },
    { key: 'handball', name: 'كرة اليد' },
    { key: 'volleyball', name: 'كرة الطائرة' }
]

const LEVELS = [
    { key: '1', name: 'أولى ثانوي' },
    { key: '2', name: 'ثانية ثانوي' },
    { key: '3', name: 'ثالثة ثانوي' }
];

const LEVEL_TO_CONFIG_KEY: Record<'1' | '2' | '3', 's1' | 's2' | 's3'> = {
    '1': 's1', '2': 's2', '3': 's3',
};

const FARDI_SPORTS = ['sprint', 'long_jump', 'shot_put'];
const getSportType = (sportKey: string): 'fardi' | 'groupe' =>
    FARDI_SPORTS.includes(sportKey) ? 'fardi' : 'groupe';

const getLevelKeyFromClass = (
    className: string | number | undefined,
    fallbackLevel?: string | number
): '1' | '2' | '3' => {
    const source = className ?? fallbackLevel;
    if (source === undefined || source === null) return '1';

    const str = String(source).trim();
    if (str.startsWith('1')) return '1';
    if (str.startsWith('2')) return '2';
    if (str.startsWith('3')) return '3';

    const normalized = str.toLowerCase();
    if (normalized.includes('أولى') || normalized.includes('اولى') || normalized.includes('niveau 1') || normalized.includes('s1')) return '1';
    if (normalized.includes('ثانية') || normalized.includes('niveau 2') || normalized.includes('s2')) return '2';
    if (normalized.includes('ثالثة') || normalized.includes('niveau 3') || normalized.includes('s3')) return '3';

    return '1';
};

export default function WahdaGeneratorPage() {
    const { classes } = useClasses();
    const { wahda, error, fetchWahda, saveWahda, setWahda } = useWahda();
    const { teacher } = useTeacher();
    const [level, setLevel] = useState<'1' | '2' | '3'>('1');
    const [sport, setSport] = useState<string>('sprint');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [trimester, setTrimester] = useState<'1' | '2' | '3'>('1');
    const [kaidiIndex, setKaidiIndex] = useState<0 | 1 | 2>(0);

    useEffect(() => {
        if (level && sport && trimester) {
            fetchWahda(level, sport, trimester)
        }
    }, [level, sport, trimester, fetchWahda]);

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            type CurriculumFile = {
                [level: string]: {
                    sports: {
                        [sport: string]: {
                            indicators: {
                                id: number;
                                text: string;
                                goals: string[];
                            }[]
                        }
                    }
                }
            }

            let rootDoc: CurriculumFile;
            if (level === '1') rootDoc = level1Curriculum;
            else if (level === '2') rootDoc = level2Curriculum;
            else rootDoc = level3Curriculum;

            const currentLevelConfig = rootDoc[level] || rootDoc["1"];
            const sportConfig = currentLevelConfig?.sports?.[sport];

            if (!sportConfig || !Array.isArray(sportConfig.indicators)) {
                throw new Error(`لم يتم العثور على مؤشرات للنشاط ${sport} في ملف المستندات الخاص بالمستوى ${level}`);
            }

            const indicatorAveragesMap = new Map<number, { sum: number; count: number }>();

            const levelClasses = Array.isArray(classes)
                ? classes.filter(c => c.level === 'lycee' && getLevelKeyFromClass(c.name) === level)
                : []

            if (levelClasses.length > 0) {
                const fetchedDataArray = await Promise.all(
                    levelClasses.map(async (c) => {
                        try {
                            const res = await fetch(`/api/tachkhisi/${c._id}?sportKey=${sport}&sportType=${getSportType(sport)}`)
                            if (!res.ok) return null
                            return await res.json()
                        } catch { return null }
                    })
                )
                fetchedDataArray.forEach((data) => {
                    if (data && Array.isArray(data.selectedIndicatorIds) && Array.isArray(data.mochirAverages)) {
                        data.selectedIndicatorIds.forEach((id: number, index: number) => {
                            const avgObj = data.mochirAverages[index]
                            const percentage = avgObj ? (avgObj.t1 || 0) * 100 : 0
                            const current = indicatorAveragesMap.get(id) || { sum: 0, count: 0 }
                            indicatorAveragesMap.set(id, { sum: current.sum + percentage, count: current.count + 1 })
                        })
                    }
                })
            }

            const sportIndicators = sportConfig.indicators.filter(ind => indicatorAveragesMap.has(ind.id));

            if (sportIndicators.length === 0) {
                throw new Error(`يرجى القيام بالتقويم التشخيصي الخاص بالمستوى ${level} أولاً`);
            }

            type IndicatorPlan = {
                indicator: typeof sportIndicators[number];
                percentage: number;
                sessions: number; // 0.5 = reminder
            }

            const plans: IndicatorPlan[] = sportIndicators.map((indicator) => {
                const stats = indicatorAveragesMap.get(indicator.id)
                const finalPercentage = stats && stats.count > 0 ? (stats.sum / stats.count) : 35

                let neededSessions = 2
                if (finalPercentage >= 76) neededSessions = 0.5
                else if (finalPercentage >= 51) neededSessions = 1
                else if (finalPercentage >= 26) neededSessions = 2
                else neededSessions = 3

                return { indicator, percentage: finalPercentage, sessions: neededSessions }
            })

            const TARGET = 6
            let total = plans.reduce((sum, p) => sum + (p.sessions === 0.5 ? 1 : p.sessions), 0)

            if (total > TARGET) {
                const highToLow = [...plans]
                    .map((p, i) => ({ ...p, index: i }))
                    .filter(p => p.sessions > 1)
                    .sort((a, b) => b.percentage - a.percentage)

                for (const p of highToLow) {
                    if (total <= TARGET) break
                    if (plans[p.index].sessions >= 3) {
                        plans[p.index].sessions = 2
                        total--
                    }
                }
                for (const p of highToLow) {
                    if (total <= TARGET) break
                    if (plans[p.index].sessions >= 2) {
                        plans[p.index].sessions = 1
                        total--
                    }
                }
            }

            if (total > TARGET) {
                const lowToHigh = [...plans]
                    .map((p, i) => ({ ...p, index: i }))
                    .filter(p => p.sessions >= 3)
                    .sort((a, b) => a.percentage - b.percentage)

                for (const p of lowToHigh) {
                    if (total <= TARGET) break
                    plans[p.index].sessions = 2
                    total--
                }
            }

            const sessionsAccumulator: ISession[] = []
            let sessionCounter = 1

            for (const plan of plans) {
                if (plan.sessions === 0.5) {
                    sessionsAccumulator.push({
                        sessionNumber: sessionCounter++,
                        indicatorId: plan.indicator.id,
                        indicatorText: plan.indicator.text,
                        goal: `تذكير وتقويم: ${plan.indicator.text}`,
                        specialGoal: plan.indicator.text.replace('أن يكون التلميذ قادرا على ', ''),
                        isReminder: true
                    })
                } else {
                    for (let step = 0; step < plan.sessions; step++) {
                        const goals = plan.indicator.goals
                        const goalText = goals[step] || goals[goals.length - 1] || plan.indicator.text
                        sessionsAccumulator.push({
                            sessionNumber: sessionCounter++,
                            indicatorId: plan.indicator.id,
                            indicatorText: plan.indicator.text,
                            goal: goalText,
                            specialGoal: goalText.replace('أن يكون التلميذ قادرا على ', ''),
                            isReminder: false
                        })
                    }
                }
            }
            setWahda({
                level,
                sport,
                trimester,
                sessions: sessionsAccumulator
            })
            setIsGenerating(false)

        } catch (err: unknown) {
            toast(err instanceof Error ? err.message : "حدث خطأ أثناء معالجة البيانات", { type: "error" })
            setIsGenerating(false)
        }
    }

    const handleCellChange = (index: number, field: keyof ISession, value: string) => {
        if (!wahda) return
        const updatedSessions = [...wahda.sessions]
        updatedSessions[index] = { ...updatedSessions[index], [field]: value }
        setWahda({ ...wahda, sessions: updatedSessions })
    }

    const handleSave = async () => {
        if (!wahda) return
        const success = await saveWahda(level, {
            sport: wahda.sport,
            trimester: wahda.trimester,
            sessions: wahda.sessions
        })
        if (success) {
            toast("تم حفظ الوحدة التعلمية بنجاح !", { type: "success" });
        }
    }

    const kaidi = useMemo(() => {
        const configKey = LEVEL_TO_CONFIG_KEY[level];
        return planOfYearConfig[configKey]?.kafaatQaaidiya[kaidiIndex];
    }, [level, kaidiIndex]);

    const [prevKaidi, setPrevKaidi] = useState(kaidi);
    const [ahdafIndex, setAhdafIndex] = useState<0 | 1>(0);

    if (kaidi !== prevKaidi) {
        setPrevKaidi(kaidi);
        setAhdafIndex(0);
    }

    const ahdafText = kaidi?.ahdafTaalamuiya[ahdafIndex] || '';

    return (
        <div dir="rtl" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-right font-sans bg-black min-h-screen">

            {/* Control Panel */}
            <div className="print:hidden bg-white shadow-lg shadow-gray-100 rounded-3xl p-6 sm:p-8 border border-gray-100 space-y-6 transition-all">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <span className="bg-blue-50 text-blue-600 p-2 rounded-xl text-xl">🛠️</span>
                        مولد الوحدة التعلمية 
                    </h1>
                    <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">وحدات تعلمية</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">المستوى الدراسي</label>
                        <select
                            className="w-full border border-gray-200 p-3.5 rounded-2xl bg-gray-50/50 text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                            value={level}
                            onChange={(e) => setLevel(e.target.value as '1' | '2' | '3')}
                        >
                            {LEVELS.map(l => <option key={l.key} value={l.key}>{l.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">النشاط الرياضي</label>
                        <select
                            className="w-full border border-gray-200 p-3.5 rounded-2xl bg-gray-50/50 text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                            value={sport}
                            onChange={(e) => setSport(e.target.value)}
                        >
                            {SPORTS.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">الكفاءة القاعدية</label>
                        <select
                            className="w-full border border-gray-200 p-3.5 rounded-2xl bg-gray-50/50 text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                            value={kaidiIndex}
                            onChange={(e) => setKaidiIndex(Number(e.target.value) as 0 | 1 | 2)}
                        >
                            <option value={0}>الكفاءة القاعدية الأولى</option>
                            <option value={1}>الكفاءة القاعدية الثانية</option>
                            <option value={2}>الكفاءة القاعدية الثالثة</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        {isGenerating ? "⏳ جاري التوليد..." : "🔄 توليد جدول جديد"}
                    </button>

                    {wahda && wahda.sessions && wahda.sessions.length > 0 && (
                        <>
                            <button
                                onClick={handleSave}
                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-7 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                            >
                                💾 حفظ في قاعدة البيانات
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold px-7 py-3 rounded-2xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                            >
                                🖨️ طباعة 
                            </button>
                        </>
                    )}
                </div>
                <ToastContainer position="bottom-left" />
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-semibold shadow-sm">{error}</div>}

            {/* Document Render Sheet Matrix Table */}
            {wahda && wahda.sessions && wahda.sessions.length > 0 ? (
                <div id="wahdat" className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200/80 print:shadow-none print:border-none print:p-0 transition-all">

                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 pb-6 text-sm font-bold text-gray-800 border-b-2 border-gray-100  items-center">
                        <div className="space-y-1 flex flex-col items-start">
                            <p className="text-gray-600">المؤسسة: <span className="text-gray-900">{teacher?.school}</span></p>
                            <p className="text-gray-600">الأستاذ: <span className="text-gray-900">{teacher?.name}</span></p>
                        </div>
                        <div className="text-center">
                            <h2 className="bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 text-white text-center rounded-xl p-2.5 font-black text-lg tracking-wide shadow-inner">
                                الوحدة التعلمية: {SPORTS.find(s => s.key === wahda.sport)?.name}
                            </h2>
                        </div>
                        <div className="flex flex-col  items-start space-y-1">
                            <p className="text-gray-600">السنة الدراسية: <span className="text-gray-900">2026/2027</span></p>
                            <p className="text-gray-600">المستوى: <span className="text-gray-900">{LEVELS.find(l => l.key === wahda.level)?.name}</span></p>
                        </div>
                    </div>

                    <div className='text-black mb-6 space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 print:bg-transparent print:p-0 print:border-none'>
                        <div className='flex items-center w-full gap-2'>
                            <h1 className='text-lg font-bold whitespace-nowrap shrink-0 text-gray-800'>الكفاءة القاعدية:</h1>
                            <div className="flex-1 min-w-0 w-full text-gray-900 font-bold text-base p-2">
                                {kaidi?.title}
                            </div>
                        </div>
                        <div className='flex items-center w-full gap-2 '>
                            <h1 className='text-lg font-bold whitespace-nowrap shrink-0 text-gray-800'>الهدف التعلمي:</h1>
                            <select
                                value={ahdafIndex}
                                onChange={(e) => setAhdafIndex(Number(e.target.value) as 0 | 1)}
                                className="print:hidden flex-1 min-w-0 w-full bg-white border border-gray-200 rounded-xl outline-none p-2 text-blue-700 font-bold text-base focus:ring-2 focus:ring-rose-400 transition"
                            >
                                {kaidi?.ahdafTaalamuiya.map((h, i) => (
                                    <option key={i} value={i}>{h}</option>
                                ))}
                            </select>
                            <div className="hidden print:block flex-1 min-w-0 w-full text-rose-600 font-bold text-base p-2">
                                {ahdafText}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-black">
                        <table className="w-full border-collapse border-black text-center text-sm">
                            <thead>
                                <tr className="bg-blue-100 font-black text-gray-900 border-b-2 border-black">
                                    <th className="border border-black p-3 w-[12%]">التاريخ</th>
                                    <th className="border border-black p-3 w-[15%]">طبيعة الحصة</th>
                                    <th className="border border-black p-3 w-[25%]">المعايير (المؤشر)</th>
                                    <th className="border border-black p-3 w-[24%]">الأهداف الخاصة</th>
                                    <th className="border border-black p-3 w-[24%]">هدف النشاط</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                                <tr className="border border-black">
                                    <td className="border border-black p-2.5 text-gray-400 font-mono text-xs"> --/--/----</td>
                                    <td
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                level: level,
                                                session: "منافسة اولية",
                                                sport: sport,
                                                trimester: trimester,
                                                indicatorId: "0",
                                                indicatorText: "إجراء معاينة أولية للمكتسبات",
                                                goal: "تقويم تشخيصي",
                                            });
                                            window.open(`/FicheTech?${params}`, "_blank");
                                        }}
                                        className="border border-black p-2.5 font-bold text-rose-600 bg-rose-50/50 hover:bg-rose-100/50 transition cursor-pointer">
                                        منافسة اولية
                                    </td>
                                    <td className="border border-black text-gray-800 p-2.5 font-medium">إجراء معاينة أولية للمكتسبات</td>
                                    <td className="border border-black p-2.5 text-gray-800 font-medium">تقويم تشخيصي</td>
                                    <td className="border border-black p-2.5 text-gray-800 font-medium">إجراء منافسة مصغرة وتسجيل النتائج</td>
                                </tr>
                                {wahda.sessions.map((session, index) => (
                                    <tr key={index} className="border border-black hover:bg-gray-50/80 transition-colors">
                                        <td className="border border-black p-2 text-gray-400 font-mono text-xs"> --/--/----</td>
                                        <td onClick={() => {
                                            const params = new URLSearchParams({
                                                level: level,
                                                session: String(session.sessionNumber),
                                                sport: sport,
                                                trimester: trimester,
                                                indicatorId: String(session.indicatorId),
                                                indicatorText: session.indicatorText,
                                                goal: session.goal,
                                            });
                                            window.open(`/FicheTech?${params}`, "_blank");
                                        }} className="border border-black p-2.5 font-bold text-blue-700 bg-blue-50/40 hover:bg-blue-100/40 transition cursor-pointer">
                                            {session.isReminder ? "حصة تذكيرية" : `تعليمية ${String(session.sessionNumber).padStart(2, '0')}`}
                                        </td>
                                        <td className="border-t-white">
                                            <textarea
                                                value={session.indicatorText}
                                                onChange={(e) => handleCellChange(index, 'indicatorText', e.target.value)}
                                                className="w-full bg-transparent resize-none border-none text-gray-800 p-1 text-center text-xs font-medium focus:ring-1 focus:ring-blue-300 rounded"
                                                rows={2}
                                            />
                                        </td>
                                        <td className="border border-black p-1">
                                            <textarea
                                                value={session.specialGoal ?? ''}
                                                onChange={(e) => handleCellChange(index, 'specialGoal', e.target.value)}
                                                className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-700 font-medium focus:ring-1 focus:ring-blue-300 rounded"
                                                rows={2}
                                            />
                                        </td>
                                        <td className="border border-black p-1">
                                            <textarea
                                                value={session.goal}
                                                onChange={(e) => handleCellChange(index, 'goal', e.target.value)}
                                                className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-900 font-medium focus:ring-1 focus:ring-blue-300 rounded"
                                                rows={2}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border border-black">
                                    <td className="border border-black p-2.5 text-gray-400 font-mono text-xs"> --/--/----</td>
                                    <td
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                level: level,
                                                session: "منافسة نهائية",
                                                sport: sport,
                                                trimester: trimester,
                                                indicatorId: "0",
                                                indicatorText: "قياس مدى تحقق الأهداف البيداغوجية والمؤشرات",
                                                goal: "تقويم تحصيلي",
                                            });
                                            window.open(`/FicheTech?${params}`, "_blank");
                                        }}
                                        className="border border-black p-2.5 font-bold text-rose-600 bg-rose-50/50 hover:bg-rose-100/50 transition cursor-pointer">
                                        منافسة نهائية
                                    </td>
                                    <td className="border border-black p-2.5 text-gray-800 font-medium">قياس مدى تحقق الأهداف البيداغوجية والمؤشرات</td>
                                    <td className="border border-black p-2.5 text-gray-800 font-medium">تقويم تحصيلي</td>
                                    <td className="border border-black p-2.5 text-gray-800 font-medium">إجراء منافسة نهائية تطبيقية وتحصيل العلامات</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='text-black'>
                        <h1 className='text-lg font-bold my-6 text-gray-800'>نتائج التقويم التحصيلي:</h1>
                    </div>
                    <div className="my-6 font-bold flex justify-between text-gray-700 mt-12 mx-10 text-center">
                        <div className="border-t border-gray-300 pt-2 w-32">الاستاذ</div>
                        <div className="border-t border-gray-300 pt-2 w-32">المدير</div>
                        <div className="border-t border-gray-300 pt-2 w-32">المفتش(ة)</div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-16 border-2 border-dashed border-gray-200 rounded-3xl bg-white shadow-sm text-gray-500 font-medium space-y-3">
                    <div className="text-4xl">📊</div>
                    <p className="text-base text-gray-600 font-semibold">لا يوجد وثيقة منشأة حالياً لهذا الاختيار</p>
                    <p className="text-xs text-gray-400">اضغط على توليد (جدول جديد) للاعتماد على نتائج التشخيص.</p>
                </div>
            )
            }
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 2mm;
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

                    body *:not(#wahdat):not(#wahdat *) {
                        visibility: hidden !important;
                    }

                    #wahdat, #wahdat * {
                        visibility: visible !important;
                    }

                    #wahdat {
                        position: static !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 2mm !important;
                        box-shadow: none !important;
                        font-size: 13px !important;
                    }

                    #wahdat h2 {
                        font-size: 18px !important;
                        padding: 6px 20px !important;
                    }

                    #wahdat .grid {
                        margin-bottom: 10px !important;
                        padding-bottom: 8px !important;
                    }

                    #wahdat .grid p {
                        margin: 0 !important;
                        line-height: 1.2 !important;
                    }

                    #wahdat .space-y-2 > div {
                        margin: 0 !important;
                    }

                    #wahdat .space-y-2 {
                        margin-bottom: 8px !important;
                    }

                    #wahdat h1.text-xl {
                        font-size: 14px !important;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px !important;
                    }

                    thead {
                        display: table-header-group;
                    }

                    th, td {
                        padding: 4px 6px !important;
                        line-height: 1.2 !important;
                    }

                    tr {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    textarea {
                        border: none !important;
                        outline: none !important;
                        resize: none !important;
                        font-size: 12px !important;
                        line-height: 1.2 !important;
                        padding: 2px !important;
                        min-height: unset !important;
                    }

                    #wahdat > div:last-child h1 {
                        font-size: 14px !important;
                        margin-top: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
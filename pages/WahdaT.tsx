'use client'

import React, { useState, useEffect } from 'react'
import { useClasses } from '@/hooks/useClasses'
import { useWahda } from '@/hooks/useWahda'
import type { ISession } from '@/app/models/WahdaDoc'
import { ToastContainer, toast } from 'react-toastify'

// Static JSON imports matching your file structure
import level1Curriculum from '@/src/config/level1Curriculum.json'
import level2Curriculum from '@/src/config/level2Curriculum.json'
import level3Curriculum from '@/src/config/level3Curriculum.json'
import { useTeacher } from '@/hooks/useTeacher'

const SPORTS = [
    { key: 'sprint', name: 'سباق السرعة ' },
    { key: 'long_jump', name: 'الوثب الطويل ' },
    { key: 'shot_put', name: 'دفع الجلة ' },
    { key: 'basketball', name: 'كرة السلة ' },
    { key: 'handball', name: 'كرة اليد ' },
    { key: 'volleyball', name: 'كرة الطائرة ' }
]

const LEVELS = [
    { key: '1', name: 'أولى ثانوي' },
    { key: '2', name: 'ثانية ثانوي' },
    { key: '3', name: 'ثالثة ثانوي' }
]

export default function WahdaGeneratorPage() {
    const { classes } = useClasses();
    const { wahda, error, fetchWahda, saveWahda, setWahda } = useWahda();
    const { teacher } = useTeacher();

    const [level, setLevel] = useState<'1' | '2' | '3'>('1');
    const [sport, setSport] = useState<string>('sprint');
    const [trimester, setTrimester] = useState<'1' | '2' | '3'>('1');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

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
            const sportIndicators = sportConfig?.indicators;

            if (!sportIndicators || !Array.isArray(sportIndicators)) {
                throw new Error(`لم يتم العثور على مؤشرات للنشاط ${sport} في ملف المستندات الخاص بالمستوى ${level}`);
            }

            const indicatorAveragesMap = new Map<number, { sum: number; count: number }>();

            const levelClasses = Array.isArray(classes) ? classes.filter(c => String(c.level) === level) : []

            if (levelClasses.length > 0) {
                const fetchedDataArray = await Promise.all(
                    levelClasses.map(async (c) => {
                        try {
                            const res = await fetch(`/api/tachkhisi/${c._id}?sportKey=${sport}`)
                            if (!res.ok) return null
                            return await res.json()
                        } catch { return null }
                    })
                )
                fetchedDataArray.forEach((data) => {
                    if (data && Array.isArray(data.selectedIndicatorIds) && Array.isArray(data.mochirAverages)) {
                        data.selectedIndicatorIds.forEach((id: number, index: number) => {
                            const avgObj = data.mochirAverages[index]
                            const percentage = avgObj ? (avgObj.t1 || 0) : 0
                            const current = indicatorAveragesMap.get(id) || { sum: 0, count: 0 }
                            indicatorAveragesMap.set(id, { sum: current.sum + percentage, count: current.count + 1 })
                        })
                    }
                })
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
            alert(err instanceof Error ? err.message : "حدث خطأ أثناء معالجة البيانات")
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

    return (
        <div dir="rtl" className="p-6 max-w-7xl mx-auto space-y-6 text-right">

            {/* Control Panel */}
            <div className="print:hidden bg-white shadow-md rounded-2xl p-6 border border-gray-100 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800 border-b pb-2">🛠️ مولد الوحدة التعلمية (ثانوي)</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-600">المستوى الدراسي</label>
                        <select
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={level}
                            onChange={(e) => setLevel(e.target.value as '1' | '2' | '3')}
                        >
                            {LEVELS.map(l => <option key={l.key} value={l.key}>{l.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-600">النشاط الرياضي</label>
                        <select
                            className="w-full border p-2 rounded-xl bg-gray-50 text-gray-700"
                            value={sport}
                            onChange={(e) => setSport(e.target.value)}
                        >
                            {SPORTS.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
                    >
                        {isGenerating ? "⏳ جاري التوليد..." : "🔄 توليد جدول جديد"}
                    </button>

                    {wahda && wahda.sessions && wahda.sessions.length > 0 && (
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
                            <ToastContainer />
                        </>
                    )}
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">{error}</div>}

            {/* Document Render Sheet Matrix Table */}
            {wahda && wahda.sessions && wahda.sessions.length > 0 ? (
                <div id="a4-card" className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">

                    <div className="grid grid-cols-3 text-sm font-bold text-gray-800 mb-6 border-b pb-4">
                        <div >
                            <p>المؤسسة: {teacher?.school}</p>
                            <p>الأستاذ: {teacher?.name}</p>
                        </div>
                        <div className="text-center my-6">
                            <h2 className="text-2xl font-extrabold border-2 border-black inline-block px-8 py-2 rounded-xl bg-gray-50">
                                الوحدة التعلمية: {SPORTS.find(s => s.key === wahda.sport)?.name}
                            </h2>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p>السنة الدراسية: 2026/2027</p>
                            <p>المستوى: {LEVELS.find(l => l.key === wahda.level)?.name}</p>
                        </div>
                    </div>



                    <table className="w-full border-collapse border-2 border-black text-center text-sm">
                        <thead>
                            <tr className="bg-gray-100 font-bold text-gray-900">
                                <th className="border border-black p-2 w-[12%]">التاريخ</th>
                                <th className="border border-black p-2 w-[15%]">طبيعة الحصة</th>
                                <th className="border border-black p-2 w-[25%]">المعايير (المؤشر)</th>
                                <th className="border border-black p-2 w-[24%]">الأهداف الرئيسية</th>
                                <th className="border border-black p-2 w-[24%]">الأهداف الإجرائية الرئيسية</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border border-black">
                                <td className="border border-black p-2 text-gray-400 font-mono text-xs">من: --/--/----</td>
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
                                    className="border border-black p-2 font-bold text-red-600 bg-red-50/30 cursor-pointer">
                                    منافسة اولية
                                </td>
                                <td className="border border-black text-gray-800 p-2">إجراء معاينة أولية للمكتسبات</td>
                                <td className="border border-black p-2 text-gray-800">تقويم تشخيصي</td>
                                <td className="border border-black p-2 text-gray-800">إجراء منافسة مصغرة وتسجيل النتائج</td>
                            </tr>

                            {wahda.sessions.map((session, index) => (
                                <tr key={index} className="border border-black hover:bg-gray-50/50">
                                    <td className="border border-black p-2 text-gray-400 font-mono text-xs">من: --/--/----</td>
                                    <td onClick={() => {
                                        const params = new URLSearchParams({
                                            level: level,              // was: classLevel
                                            session: String(session.sessionNumber),
                                            sport: sport,              // was: sportKey
                                            trimester: trimester,
                                            indicatorId: String(session.indicatorId),
                                            indicatorText: session.indicatorText,
                                            goal: session.goal,
                                        });
                                        window.open(`/FicheTech?${params}`, "_blank");
                                    }} className="border border-black p-2 font-bold text-blue-700 bg-blue-50/20 cursor-pointer">
                                        {session.isReminder ? "حصة تذكيرية" : `تعليمية ${String(session.sessionNumber).padStart(2, '0')}`}
                                    </td>
                                    <td className=" border border-black p-1">
                                        <textarea
                                            value={session.indicatorText}
                                            onChange={(e) => handleCellChange(index, 'indicatorText', e.target.value)}
                                            className="w-full bg-transparent resize-none border-none text-gray-800 p-1 text-center text-xs"
                                            rows={2}
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            value={session.goal.replace('أن يكون التلميذ قادرا على ', '')}
                                            onChange={(e) => handleCellChange(index, 'goal', e.target.value)}
                                            className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-700"
                                            rows={2}
                                        />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea
                                            value={session.goal}
                                            onChange={(e) => handleCellChange(index, 'goal', e.target.value)}
                                            className="w-full bg-transparent resize-none border-none p-1 text-center text-xs text-gray-900"
                                            rows={2}
                                        />
                                    </td>
                                </tr>
                            ))}

                            <tr className="border border-black">
                                <td className="border border-black p-2 text-gray-400 font-mono text-xs">من: --/--/----</td>
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
                                    className="border border-black p-2 font-bold text-green-700 bg-green-50/30 cursor-pointer">
                                    منافسة نهائية

                                </td>
                                <td className="border border-black p-2 text-gray-800">قياس مدى تحقق الأهداف البيداغوجية والمؤشرات</td>
                                <td className="border border-black p-2 text-gray-800">تقويم تحصيلي</td>
                                <td className="border border-black p-2 text-gray-800">إجراء منافسة نهائية تطبيقية وتحصيل العلامات</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-12 border-2 border-dashed rounded-2xl bg-gray-50 text-gray-500 font-medium">
                    📊 لا يوجد وثيقة منشأة حالياً لهذا الاختيار، اضغط على توليد جدول جديد للاعتماد على نتائج التشخيص.
                </div>
            )}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
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
                        box-shadow: none !important;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tr {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    textarea {
                        border: none !important;
                        outline: none !important;
                        resize: none !important;
                    }
                }
            `}</style>
        </div>

    );
}
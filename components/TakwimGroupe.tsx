'use client'

import { useClasses } from "@/hooks/useClasses";
import { useTachkhisi } from "@/hooks/useTachkhisi";
import { useTeacher } from "@/hooks/useTeacher";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify'

import level1Data from "@/src/config/level1Curriculum.json";
import level2Data from "@/src/config/level2Curriculum.json";
import level3Data from "@/src/config/level3Curriculum.json";

interface Indicator {
    id: number;
    text: string;
    goal_base: string;
}

interface SportConfig {
    activity: string;
    kafaa_kaadia: string;
    indicators: Indicator[];
}

interface LevelCurriculum {
    kafaa_khatamia: string;
    sports: {
        [key: string]: SportConfig | undefined;
    };
}

const curriculumRegistry: Record<string, LevelCurriculum | undefined> = {
    "1": (level1Data["1"] || level1Data) as unknown as LevelCurriculum,
    "2": (level2Data["2"] || level2Data) as unknown as LevelCurriculum,
    "3": (level3Data["3"] || level3Data) as unknown as LevelCurriculum
};

const TakwimGroupe = () => {
    const { classes, studentsByClass, fetchStudents } = useClasses();
    const { teacher } = useTeacher();
    const { fetchTachkhisi, saveTachkhisi } = useTachkhisi();

    const [classSelect, setClassSelect] = useState<string>('');
    const [students, setStudents] = useState<{
        name: string;
        result: { t1: number; t2: number };
        score: { t1: number; t2: number }[];
        levelT1: string;
        levelT2: string;
    }[]>([]);
    const [sportSelect, setSportSelect] = useState<string>('basketball');
    const [mochirCount, setMochirCount] = useState<number>(4); // العدد الذي يختاره الأستاذ

    const selectedClassData = classes.find(c => c.name === classSelect);

    const getLevelKey = (): string => {
        if (!selectedClassData?.level) return '1';
        const levelStr = String(selectedClassData.level);
        if (levelStr.includes("1") || levelStr.includes("أولى") || levelStr.includes("الاولى")) return "1";
        if (levelStr.includes("2") || levelStr.includes("ثانية") || levelStr.includes("الثانية")) return "2";
        if (levelStr.includes("3") || levelStr.includes("ثالثة") || levelStr.includes("الثالثة")) return "3";
        const match = levelStr.match(/[1-3]/);
        return match ? match[0] : '1';
    };

    const dynamicLevelKey = getLevelKey();
    const activeLevelConfig = curriculumRegistry[dynamicLevelKey];
    const activeSportConfig = activeLevelConfig?.sports?.[sportSelect];
    const [selectedIndicatorIds, setSelectedIndicatorIds] = useState<number[]>([0, 1, 2, 3]);

    useEffect(() => {
        if (!classSelect) return;
        const found = classes.find(c => c.name === classSelect);
        if (!found) return;
        const hookStudents = studentsByClass[found._id] || [];
        if (hookStudents.length === 0) return;
        setTimeout(() => {
            setStudents(hookStudents.map(s => ({
                name: s.name,
                score: Array.from({ length: mochirCount }, () => ({ t1: 0, t2: 0 })),
                result: { t1: 0, t2: 0 },
                levelT1: '',
                levelT2: '',
            })));
        }, 0);
    }, [classSelect, mochirCount, studentsByClass[selectedClassData?._id ?? '']?.length]);

    const handleClassSelect = (className: string) => {
        setClassSelect(className);
        const found = classes.find(c => c.name === className);
        if (found) {
            fetchStudents(found._id);
            fetchTachkhisi(found._id, sportSelect, 'groupe');
        }
    };

    const updateLevel = (studentIndex: number, attempt: 'levelT1' | 'levelT2', value: string) => {
        setStudents(prev => prev.map((s, i) =>
            i === studentIndex ? { ...s, [attempt]: value } : s
        ));
    };

    const updateScore = (studentIndex: number, scoreIndex: number, attempt: 't1' | 't2', value: number) => {
        setStudents(prev => {
            const copy = [...prev];
            const updatedScore = [...copy[studentIndex].score];
            updatedScore[scoreIndex] = { ...updatedScore[scoreIndex], [attempt]: value };
            copy[studentIndex] = { ...copy[studentIndex], score: updatedScore };
            return copy;
        });
    };

    const totalT1PerMochir = Array.from({ length: mochirCount }, (_, i) => {
        const total = students.reduce((acc, s) => acc + (s.score[i]?.t1 ?? 0), 0);
        return students.length === 0 ? 0 : total / students.length;
    });

    const totalT2PerMochir = Array.from({ length: mochirCount }, (_, i) => {
        const total = students.reduce((acc, s) => acc + (s.score[i]?.t2 ?? 0), 0);
        return students.length === 0 ? 0 : total / students.length;
    });

    const handleIndicatorChange = (indexToUpdate: number, newId: number) => {
        setSelectedIndicatorIds(prev => {
            const copy = [...prev];
            copy[indexToUpdate] = newId;
            return copy;
        });
    };

    useEffect(() => {
        if (activeSportConfig?.indicators) {
            const availableIds = activeSportConfig.indicators.map(i => i.id);
            setTimeout(() => {
                setSelectedIndicatorIds(availableIds.slice(0, mochirCount));
            }, 0);
        }
    }, [sportSelect, mochirCount, activeSportConfig]);

    return (
        <div dir="rtl" className='m-2 md:m-4 flex flex-col items-center bg-white text-black font-sans'>

            {/* Professional Control Panel */}
            <div className="print:hidden flex flex-col gap-4 border border-gray-300 rounded-xl p-4 w-full mb-6 bg-gray-50">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className='flex gap-2 items-center'>
                        <label className='font-bold text-sm text-gray-700'>النشاط الرياضي:</label>
                        <select
                            className='border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none'
                            value={sportSelect}
                            onChange={e => {
                                setSportSelect(e.target.value);
                                const found = classes.find(c => c.name === classSelect);
                                if (found) fetchTachkhisi(found._id, e.target.value, 'groupe');
                            }}>
                            <optgroup label="الألعاب الفردية">
                                <option value="basketball">كرة السلة </option>
                                <option value="volleyball">كرة الطائرة </option>
                                <option value="handball">كرة اليد </option>
                            </optgroup>
                        </select>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <label className='font-bold text-sm text-gray-700'>عددالمؤشرات:</label>
                        <select
                            className='border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none'
                            value={mochirCount}
                            onChange={e => setMochirCount(Number(e.target.value))}>
                            <option value={1}>مؤشر واحد </option>
                            <option value={2}>مؤشرين </option>
                            <option value={3}>3 مؤشرات</option>
                            <option value={4}>4 مؤشرات </option>
                        </select>
                    </div>

                    <div className='flex gap-2 items-center'>
                        <label className='font-bold text-sm text-gray-700'>القسم:</label>
                        <select
                            className='border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none'
                            value={classSelect}
                            onChange={e => {
                                handleClassSelect(e.target.value);
                                const found = classes.find(c => c.name === e.target.value);
                                if (found) fetchTachkhisi(found._id, sportSelect, 'groupe');
                            }}>
                            <option value="">— اختر القسم —</option>
                            {classes.map((c, i) => (
                                <option key={i} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {activeSportConfig && (
                    <div className="border-t border-gray-200 pt-3">
                        <span className="block text-xs font-bold text-gray-600 mb-2">تخصيص وتحديد المؤشرات للجدول:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {Array.from({ length: mochirCount }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-1 bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                                    <label className="text-xs font-bold text-blue-900">المؤشر {i + 1}:</label>
                                    <select
                                        className="w-full text-xs bg-gray-50 border border-gray-300 rounded p-1"
                                        value={selectedIndicatorIds[i] ?? i}
                                        onChange={e => handleIndicatorChange(i, Number(e.target.value))}>
                                        {activeSportConfig.indicators.map((ind) => (
                                            <option key={ind.id} value={ind.id}>
                                                {ind.text}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Printable A4 Card Template */}
            <div id="a4-card" className='w-full bg-white text-black p-2 md:p-6 border border-black rounded-sm shadow-md print:border-none print:shadow-none'>

                {/* Header Information Sheet Block */}
                <div dir="rtl" className="text-black text-center bg-white w-full">
                    <div className="flex justify-center items-center border border-black py-2 bg-blue-100 print:bg-blue-100">
                        <h1 className="text-base md:text-xl font-black text-center w-full px-2">
                            بطاقة التقويم التشخيصي للأنشطة الجماعية: <span className="text-blue-800 ">{activeSportConfig?.activity || '—'}</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-50 border-x border-b border-black">
                        <div className="border-r border-black py-1.5 px-2 text-sm text-right"> الأستاذ: {teacher.name || '—'}</div>
                        <div className="border-r border-black py-1.5 px-2 text-sm text-right"> المؤسسة: {teacher.school || '—'}</div>
                        <div className="border-r border-black py-1.5 px-2 text-sm text-right"> المستوى: {selectedClassData?.level || '—'}</div>
                        <div className="py-1.5 px-2 text-sm text-right"> القسم: {classSelect || '—'}</div>
                    </div>

                    <div className="border-x border-b border-black bg-white text-right">
                        <div className="border-b border-black py-2 px-3 text-sm flex gap-2">
                            <span className="font-black text-blue-900 whitespace-nowrap">الكفاءة الختامية:</span>
                            <span>{activeLevelConfig?.kafaa_khatamia || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Structured Scoring Table Grid */}
                <div className="overflow-x-auto mt-4">
                    <table className="w-full border-collapse border border-black text-center text-[11px]">
                        <thead className="bg-blue-50 font-bold">
                            <tr className="border-b border-black">
                                <th className="border-l border-black p-1 w-6" rowSpan={2}>#</th>
                                <th className="border-l border-black p-1 min-w-36.25" rowSpan={2}>الاسم واللقب</th>
                                {Array.from({ length: mochirCount }).map((_, i) => (
                                    <th className="border-l border-black p-1" key={i} colSpan={2}>
                                        <div className="font-bold text-blue-900">المعيار {i + 1}</div>
                                    </th>
                                ))}
                                <th className="border-l border-black p-1 bg-emerald-50" colSpan={3}>نسبة التحكم %</th>
                                <th className="p-1 bg-purple-50" colSpan={2}>المستوى النوعي</th>
                            </tr>
                            <tr className="border-b border-black bg-gray-100 font-semibold text-[10px]">
                                {Array.from({ length: mochirCount }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <td className="border-l border-black p-0.5">ت1</td>
                                        <td className="border-l border-black p-0.5">ت2</td>
                                    </React.Fragment>
                                ))}
                                <td className="border-l border-black p-0.5">ت1%</td>
                                <td className="border-l border-black p-0.5">ت2%</td>
                                <td className="border-l border-black p-0.5 font-bold">الفارق</td>
                                <td className="border-l border-black p-0.5">ت1</td>
                                <td className="p-0.5">ت2</td>
                            </tr>
                        </thead>

                        <tbody>
                            {students.map((student, studentIndex) => {
                                const percentaget1 = (student.score.reduce((a, b) => a + b.t1, 0) / mochirCount) * 100;
                                const percentaget2 = (student.score.reduce((a, b) => a + b.t2, 0) / mochirCount) * 100;
                                const t2_t1 = percentaget2 - percentaget1;

                                return (
                                    <tr className="border-b border-black hover:bg-gray-50" key={studentIndex}>
                                        <td className="border-l border-black p-1 bg-gray-100 font-bold">{studentIndex + 1}</td>
                                        <td className="border-l border-black p-1 text-right font-medium px-2 whitespace-nowrap">{student.name}</td>

                                        {/* Dynamic Indicator Dropdowns */}
                                        {Array.from({ length: mochirCount }).map((_, scoreIndex) => {
                                            const sc = student.score[scoreIndex] || { t1: 0, t2: 0 };
                                            return (
                                                <React.Fragment key={scoreIndex}>
                                                    <td className="border-l border-black p-0">
                                                        <select value={sc.t1} className="w-full text-center bg-transparent border-none outline-none font-bold text-red-600 cursor-pointer"
                                                            onChange={e => updateScore(studentIndex, scoreIndex, 't1', Number(e.target.value))}>
                                                            <option value="0">0</option>
                                                            <option value="1">1</option>
                                                        </select>
                                                    </td>
                                                    <td className="border-l border-black p-0">
                                                        <select value={sc.t2} className="w-full text-center bg-transparent border-none outline-none font-bold text-green-700 cursor-pointer"
                                                            onChange={e => updateScore(studentIndex, scoreIndex, 't2', Number(e.target.value))}>
                                                            <option value="0">0</option>
                                                            <option value="1">1</option>
                                                        </select>
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}

                                        {/* Performance Computations */}
                                        <td className="border-l border-black p-1 font-mono">{percentaget1.toFixed(1)}%</td>
                                        <td className="border-l border-black p-1 font-mono">{percentaget2.toFixed(1)}%</td>
                                        <td className={`border-l border-black p-1 font-mono font-bold ${t2_t1 >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                            {t2_t1 >= 0 ? `+${t2_t1.toFixed(1)}%` : `${t2_t1.toFixed(1)}%`}
                                        </td>

                                        {/* Qualitative Letter Scales */}
                                        <td className="border-l border-black p-0">
                                            <select value={student.levelT1} onChange={e => updateLevel(studentIndex, 'levelT1', e.target.value)} className="w-full font-bold text-center bg-transparent border-none outline-none cursor-pointer">
                                                <option value="">—</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                            </select>
                                        </td>
                                        <td className="p-0">
                                            <select value={student.levelT2} onChange={e => updateLevel(studentIndex, 'levelT2', e.target.value)} className="w-full font-bold text-center bg-transparent border-none outline-none cursor-pointer">
                                                <option value="">—</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Collective Group Summary Averages row */}
                            <tr className="border-b border-black bg-blue-50 font-bold">
                                <td className="border-l border-black p-1"></td>
                                <td className="border-l border-black p-1 text-right text-blue-900 px-2">النتيجة الجماعية الفوجية</td>
                                {totalT1PerMochir.map((value, i) => (
                                    <React.Fragment key={i}>
                                        <td className="border-l border-black p-1 font-mono text-red-700">{value.toFixed(2)}</td>
                                        <td className="border-l border-black p-1 font-mono text-green-800">{totalT2PerMochir[i].toFixed(2)}</td>
                                    </React.Fragment>
                                ))}
                                {Array(5).fill(0).map((_, i) => <td key={i} className="border-l border-black p-1 bg-gray-50"></td>)}
                            </tr>

                            {/* Collective Group Success Percentage row */}
                            <tr className="bg-blue-100 font-black">
                                <td className="border-l border-black p-1"></td>
                                <td className="border-l border-black p-1 text-right text-blue-950 px-2">نسبة نجاح الفوج %</td>
                                {totalT1PerMochir.map((value, i) => (
                                    <React.Fragment key={i}>
                                        <td className="border-l border-black p-1 font-mono text-red-700">{(value * 100).toFixed(1)}%</td>
                                        <td className="border-l border-black p-1 font-mono text-green-800">{(totalT2PerMochir[i] * 100).toFixed(1)}%</td>
                                    </React.Fragment>
                                ))}
                                {Array(5).fill(0).map((_, i) => <td key={i} className="border-l border-black p-1 bg-gray-100"></td>)}
                            </tr>
                        </tbody>
                    </table>
                    {activeSportConfig && (
                        <div className="flex flex-col mt-4 gap-2 border border-gray-200 p-3">
                            {Array.from({ length: mochirCount }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <h1 className="text-xs font-bold text-blue-900">المؤشر:</h1>
                                    <p>
                                        {activeSportConfig.indicators.find(ind => ind.id === selectedIndicatorIds[i])?.text || '—'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="md:margin-right-auto flex gap-2 w-full md:w-auto my-6 print:hidden">
                <button onClick={() => window.print()} className='bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm w-full md:w-auto shadow-sm'>
                    طباعة 🖨️
                </button>
                <button
                    onClick={() => {
                        const found = classes.find(c => c.name === classSelect);
                        if (!found) return;
                        saveTachkhisi(
                            found._id,
                            sportSelect,
                            'groupe',
                            mochirCount,
                            selectedIndicatorIds,
                            students.map(s => ({
                                name: s.name,
                                score: s.score,
                                result: s.result,
                                percentaget1: (s.score.reduce((a, b) => a + b.t1, 0) / mochirCount) * 100,
                                percentaget2: (s.score.reduce((a, b) => a + b.t2, 0) / mochirCount) * 100,
                                tatawaor: s.result.t2 - s.result.t1,
                                levelT1: s.levelT1,
                                levelT2: s.levelT2,
                            })),
                            totalT2PerMochir.map((t2, i) => ({
                                t1: totalT1PerMochir[i],
                                t2: t2,
                            }))
                        );
                        toast("تم حفظ المعلومات بنجاح !", { type: "success" });
                    }}
                    className='bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm w-full md:w-auto shadow-sm'>
                    حفظ ✅
                </button>
                <ToastContainer />
            </div>
        </div>
    );
};

export default TakwimGroupe;
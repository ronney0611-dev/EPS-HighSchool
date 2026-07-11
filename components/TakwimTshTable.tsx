'use client'

import { useClasses } from "@/hooks/useClasses";
import { useTeacher } from "@/hooks/useTeacher";
import React, { useState, useEffect, useMemo } from "react";

import level1Data from "@/src/config/level1Curriculum.json";
import level2Data from "@/src/config/level2Curriculum.json";
import level3Data from "@/src/config/level3Curriculum.json";
import { useTachkhisi } from "@/hooks/useTachkhisi";
import { ToastContainer, toast } from 'react-toastify'

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

const LEVEL_LABELS: Record<number, string> = {
    1: 'أولى ثانوي',
    2: 'ثانية ثانوي',
    3: 'ثالثة ثانوي',
};

const getLevelLabel = (className: string | undefined): string => {
    const grade = getLevelKeyFromClass(className);
    return LEVEL_LABELS[Number(grade)] ?? '—';
};

type RawCurriculumFile = { [key: string]: LevelCurriculum };

const curriculumRegistry: Record<string, LevelCurriculum | undefined> = {
    "1": (level1Data as unknown as RawCurriculumFile)["1"] || (level1Data as unknown as LevelCurriculum),
    "2": (level2Data as unknown as RawCurriculumFile)["2"] || (level2Data as unknown as LevelCurriculum),
    "3": (level3Data as unknown as RawCurriculumFile)["3"] || (level3Data as unknown as LevelCurriculum),
};

const getLevelKeyFromClass = (className: string | number | undefined, fallbackLevel?: string | number): '1' | '2' | '3' => {
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

const getDefaultIndicatorIds = (levelKey: string, sportKey: string, count: number) => {
    const sportCfg = curriculumRegistry[levelKey]?.sports?.[sportKey];
    const availableIds = sportCfg?.indicators.map(ind => ind.id) ?? [];
    return availableIds.slice(0, Math.min(count, availableIds.length));
};

interface StudentState {
    name: string;
    result: { t1: number; t2: number };
    score: { t1: number; t2: number }[];
}

const TakwimTshTable = () => {
    const { classes, fetchStudents, studentsByClass } = useClasses();
    const { teacher } = useTeacher();
    const { fetchTachkhisi, saveTachkhisi, setTachkhisi } = useTachkhisi();

    const [sportSelect, setSportSelect] = useState<string>('sprint');
    const [classSelect, setClassSelect] = useState<string>('');

    const [mochirCount, setMochirCount] = useState<number>(4);
    const [selectedIndicatorIds, setSelectedIndicatorIds] = useState<number[]>([0, 1, 2, 3]); // المعايير المختارة

    const [students, setStudents] = useState<StudentState[]>([]);

    const selectedClassData = classes.find(c => c.name === classSelect);

    const dynamicLevelKey = useMemo(
        () => getLevelKeyFromClass(selectedClassData?.name, selectedClassData?.level),
        [selectedClassData?.name, selectedClassData?.level]
    );

    const activeLevelConfig = curriculumRegistry[dynamicLevelKey];
    const activeSportConfig = activeLevelConfig?.sports?.[sportSelect];

    const handleIndicatorChange = (indexToUpdate: number, newId: number) => {
        setSelectedIndicatorIds(prev => {
            const copy = [...prev];
            copy[indexToUpdate] = newId;
            return copy;
        });
    };

    const [studentsSourceKey, setStudentsSourceKey] = useState<string>('');

    const foundForStudents = classSelect ? classes.find(c => c.name === classSelect) : undefined;
    const hookStudentsForKey = foundForStudents ? (studentsByClass[foundForStudents._id] || []) : [];
    const currentStudentsKey = classSelect ? `${classSelect}::${mochirCount}::${hookStudentsForKey.length}` : '';

    if (currentStudentsKey !== studentsSourceKey) {
        setStudentsSourceKey(currentStudentsKey);
        setStudents(hookStudentsForKey.map(s => ({
            name: s.name,
            score: Array.from({ length: mochirCount }, () => ({ t1: 0, t2: 0 })),
            result: { t1: 0, t2: 0 }
        })));
    }

    {/*useEffect(() => {
        const availableIds = getDefaultIndicatorIds(dynamicLevelKey, sportSelect, mochirCount);

        if (availableIds.length === 0) {
            setSelectedIndicatorIds([]);
            return;
        }

        setSelectedIndicatorIds(prev => {
            const filtered = prev.filter(id => availableIds.includes(id));
            if (filtered.length > 0) {
                return filtered.slice(0, availableIds.length);
            }
            return availableIds;
        });
    }, [dynamicLevelKey, sportSelect, mochirCount]);*/}

    const indicatorsKey = `${dynamicLevelKey}::${sportSelect}::${mochirCount}`;
    const [lastIndicatorsKey, setLastIndicatorsKey] = useState('');

    if (indicatorsKey !== lastIndicatorsKey) {
        setLastIndicatorsKey(indicatorsKey);

        const availableIds = getDefaultIndicatorIds(dynamicLevelKey, sportSelect, mochirCount);

        if (availableIds.length === 0) {
            setSelectedIndicatorIds([]);
        } else {
            setSelectedIndicatorIds(prev => {
                const filtered = prev.filter(id => availableIds.includes(id));
                return filtered.length > 0 ? filtered.slice(0, availableIds.length) : availableIds;
            });
        }
    }

    {/* useEffect(() => {
        if (students.length > 0 && students[0].score.length !== mochirCount) {
            setStudents(prev => prev.map(s => ({
                ...s,
                score: Array.from({ length: mochirCount }, (_, idx) => s.score[idx] || { t1: 0, t2: 0 })
            })));
        }
    }, [mochirCount, students]); */}
    if (students.length > 0 && students[0].score.length !== mochirCount) {
        setStudents(prev => prev.map(s => ({
            ...s,
            score: Array.from({ length: mochirCount }, (_, idx) => s.score[idx] || { t1: 0, t2: 0 })
        })));
    }

    const hydrateFromData = (data: NonNullable<Awaited<ReturnType<typeof fetchTachkhisi>>>, levelKey: string) => {
        const availableIds = getDefaultIndicatorIds(levelKey, sportSelect, data.mochirCount ?? mochirCount);
        const validIds = (data.selectedIndicatorIds || []).filter((id: number) => availableIds.includes(id));
        const nextIds = validIds.length > 0 ? validIds.slice(0, availableIds.length) : availableIds;

        setMochirCount(Math.min(data.mochirCount ?? mochirCount, availableIds.length || 4));
        setSelectedIndicatorIds(nextIds);
        setStudents(data.students.map((s: { name: string; score: { t1: number; t2: number }[]; result?: { t1: number; t2: number } }) => ({
            name: s.name,
            score: s.score,
            result: s.result || { t1: 0, t2: 0 },
        })));
    };

    const handleClassSelect = async (className: string) => {
        const found = classes.find(c => c.name === className);
        if (!found) return;

        setClassSelect(className);
        setTachkhisi(null);
        fetchStudents(found._id);
        const data = await fetchTachkhisi(found._id, sportSelect, 'fardi');
        if (data && data.students && data.students.length > 0) {
            hydrateFromData(data, getLevelKeyFromClass(found.name, found.level));
        } else {
            const newLevelKey = getLevelKeyFromClass(found.name, found.level);
            const availableIds = getDefaultIndicatorIds(newLevelKey, sportSelect, 4);
            const defaultCount = Math.min(4, availableIds.length);
            setMochirCount(defaultCount);
            setSelectedIndicatorIds(availableIds.slice(0, defaultCount));
        }
    };

    const handleSportSelect = async (newSport: string) => {
        setSportSelect(newSport);
        setTachkhisi(null);
        const found = classes.find(c => c.name === classSelect);
        if (found) {
            const data = await fetchTachkhisi(found._id, newSport, 'fardi');
            if (data && data.students && data.students.length > 0) {
                hydrateFromData(data, getLevelKeyFromClass(found.name, found.level));
            } else {
                const newLevelKey = getLevelKeyFromClass(found.name, found.level);
                const availableIds = getDefaultIndicatorIds(newLevelKey, newSport, 4);
                const defaultCount = Math.min(4, availableIds.length);
                setMochirCount(defaultCount);
                setSelectedIndicatorIds(availableIds.slice(0, defaultCount));

                const rosterStudents = studentsByClass[found._id] || [];
                setStudents(rosterStudents.map(s => ({
                    name: s.name,
                    score: Array.from({ length: defaultCount }, () => ({ t1: 0, t2: 0 })),
                    result: { t1: 0, t2: 0 }
                })));
            }
        }
    };

    const updateResult = (studentIndex: number, attempt: 't1' | 't2', value: number) => {
        setStudents(prev => prev.map((s, i) =>
            i === studentIndex ? { ...s, result: { ...s.result, [attempt]: value } } : s
        ));
    }

    const updateScore = (studentIndex: number, scoreIndex: number, attempt: 't1' | 't2', value: number) => {
        setStudents(prev => {
            const copy = [...prev];
            const updatedScore = [...copy[studentIndex].score];
            updatedScore[scoreIndex] = { ...updatedScore[scoreIndex], [attempt]: value };
            copy[studentIndex] = { ...copy[studentIndex], score: updatedScore };
            return copy;
        });
    }

    const totalT1PerMochir = Array.from({ length: mochirCount }, (_, i) => {
        const total = students.reduce((acc, s) => acc + (s.score[i]?.t1 ?? 0), 0);
        return students.length === 0 ? 0 : total / students.length;
    });

    const totalT2PerMochir = Array.from({ length: mochirCount }, (_, i) => {
        const total = students.reduce((acc, s) => acc + (s.score[i]?.t2 ?? 0), 0);
        return students.length === 0 ? 0 : total / students.length;
    });

    return (
        <div dir="rtl" className='m-2 md:m-4 flex flex-col items-center bg-white text-black font-sans'>

            <div className="print:hidden flex flex-col gap-4 border border-gray-300 rounded-xl p-4 w-full mb-6 bg-gray-50">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className='flex gap-2 items-center'>
                        <label className='font-bold text-sm text-gray-700'>النشاط الرياضي:</label>
                        <select
                            className='border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none'
                            value={sportSelect}
                            onChange={e => handleSportSelect(e.target.value)}>
                            <optgroup label="الألعاب الفردية">
                                <option value="sprint">سباق السرعة </option>
                                <option value="long_jump">الوثب الطويل </option>
                                <option value="shot_put">رمي الجلة </option>
                            </optgroup>
                        </select>
                    </div>

                    <div className='flex gap-2 items-center'>
                        <label className='font-bold text-sm text-gray-700'>القسم:</label>
                        <select
                            className='border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none'
                            value={classSelect}
                            onChange={e => handleClassSelect(e.target.value)}>
                            <option value="">— اختر القسم —</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
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
                            <option value={4}>4 مؤشرات كاملة</option>
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

            <div id="a4-card" className='w-full bg-white text-black p-2 md:p-6 border border-black rounded-sm shadow-md print:border-none print:shadow-none'>
                <div dir="rtl" className="text-black text-center bg-white w-full">
                    <div className="flex justify-center items-center border border-black py-2 bg-blue-100 print:bg-blue-100">
                        <h1 className="text-base md:text-xl font-black text-center w-full px-2">
                            بطاقة التقويم التشخيصي للأنشطة الفردية: <span className="text-blue-800 ">{activeSportConfig?.activity || '—'}</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-50 border-x border-b border-black">
                        <div className="border-r border-black py-1.5 px-2 text-sm text-right"> الأستاذ: {teacher.name || '—'}</div>
                        <div className="border-r border-black py-1.5 px-2 text-sm text-right"> المؤسسة: {teacher.school || '—'}</div>
                        <div className="border-r border-black py-1.5 px-2 text-sm text-right"> المستوى: {getLevelLabel(selectedClassData?.name) || '—'}</div>
                        <div className="py-1.5 px-2 text-sm text-right"> القسم: {classSelect || '—'}</div>
                    </div>

                    <div className="border-x border-b border-black bg-white text-right">
                        <div className="border-b border-black py-2 px-3 text-sm flex gap-2">
                            <span className="font-black text-blue-900 whitespace-nowrap">الكفاءة الختامية:</span>
                            <span>{activeLevelConfig?.kafaa_khatamia || '—'}</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full border-collapse border border-black text-center text-[11px]">
                        <thead className="bg-blue-50 font-bold">
                            <tr className="border-b border-black">
                                <th className="border-l border-black p-1 w-6" rowSpan={2}>#</th>
                                <th className="border-l border-black p-1 min-w-35" rowSpan={2}>الاسم واللقب</th>
                                {Array.from({ length: mochirCount }).map((_, i) => {
                                    return (
                                        <th className="border-l border-black p-1" key={i} colSpan={2}>
                                            <div className="font-bold text-blue-900">المعيار {i + 1}</div>
                                        </th>
                                    );
                                })}
                                <th className="border-l border-black p-1 bg-emerald-50" colSpan={3}>نسبة التحكم %</th>
                                <th className="p-1 bg-purple-50" colSpan={3}>النتيجة الرقمية</th>
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
                                <td className="border-l border-black p-0.5">ت2</td>
                                <td className="p-0.5">التطور</td>
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
                                        <td className="border-l border-black text-black p-1 text-right text-xs font-medium px-2 whitespace-nowrap">{student.name}</td>
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
                                        <td className="border-l border-black p-1 font-mono">{percentaget1.toFixed(1)}%</td>
                                        <td className="border-l border-black p-1 font-mono">{percentaget2.toFixed(1)}%</td>
                                        <td className={`border-l border-black p-1 font-mono font-bold ${t2_t1 >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                            {t2_t1 >= 0 ? `+${t2_t1.toFixed(1)}%` : `${t2_t1.toFixed(1)}%`}
                                        </td>
                                        <td className="border-l border-black p-0">
                                            <input type="number" value={student.result.t1} className="w-11 text-center bg-transparent border-none outline-none font-mono"
                                                onChange={e => updateResult(studentIndex, 't1', Number(e.target.value))} />
                                        </td>
                                        <td className="border-l border-black p-0">
                                            <input type="number" value={student.result.t2} className="w-11 text-center bg-transparent border-none outline-none font-mono"
                                                onChange={e => updateResult(studentIndex, 't2', Number(e.target.value))} />
                                        </td>
                                        <td className="p-1 font-mono font-bold">
                                            {(student.result.t2 - student.result.t1).toFixed(1)}
                                        </td>
                                    </tr>
                                )
                            })}

                            <tr className="border-b border-black bg-blue-50 font-bold">
                                <td className="border-l border-black p-1"></td>
                                <td className="border-l border-black p-1 text-right text-blue-900 px-2">النتيجة الجماعية الفوجية</td>
                                {totalT1PerMochir.map((value, i) => (
                                    <React.Fragment key={i}>
                                        <td className="border-l border-black p-1 font-mono text-red-700">{value.toFixed(2)}</td>
                                        <td className="border-l border-black p-1 font-mono text-green-800">{totalT2PerMochir[i].toFixed(2)}</td>
                                    </React.Fragment>
                                ))}
                                {Array(6).fill(0).map((_, i) => <td key={i} className="border-l border-black p-1 bg-gray-50"></td>)}
                            </tr>

                            <tr className="bg-blue-100 font-black">
                                <td className="border-l border-black p-1"></td>
                                <td className="border-l border-black p-1 text-right text-blue-950 px-2">نسبة نجاح الفوج %</td>
                                {totalT1PerMochir.map((value, i) => (
                                    <React.Fragment key={i}>
                                        <td className="border-l border-black p-1 font-mono text-red-700">{(value * 100).toFixed(1)}%</td>
                                        <td className="border-l border-black p-1 font-mono text-green-800">{(totalT2PerMochir[i] * 100).toFixed(1)}%</td>
                                    </React.Fragment>
                                ))}
                                {Array(6).fill(0).map((_, i) => <td key={i} className="border-l border-black p-1 bg-gray-100"></td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
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
                            'fardi',
                            mochirCount,
                            selectedIndicatorIds,
                            students.map(s => ({
                                name: s.name,
                                score: s.score,
                                result: s.result,
                                percentaget1: (s.score.reduce((a, b) => a + b.t1, 0) / mochirCount) * 100,
                                percentaget2: (s.score.reduce((a, b) => a + b.t2, 0) / mochirCount) * 100,
                                tatawaor: s.result.t2 - s.result.t1,
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
                        border: none !important;
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

                    select, input {
                        -webkit-appearance: none;
                        appearance: none;
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    )
}

export default TakwimTshTable;
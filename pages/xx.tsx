'use client'
import { useClasses } from "@/hooks/useClasses"
import { useGroupe } from "@/hooks/useGroupe";
import React, { useState } from "react"
import { Activity, Gender, getScore } from "@/src/config/barem2"

const TaqwimTakwini = () => {
    const { classes, studentsByClass, fetchStudents } = useClasses();
    const [classSelect, setClassSelect] = useState('');
    const { groupe, fetchGroupes } = useGroupe();
    const [activity, setActivity] = useState<Activity>('sprint');

    // performances[`${studentId}-${sessionIndex}`] = raw performance string
    const [performances, setPerformances] = useState<Record<string, string>>({});
    // groupLevels[groupIndex] = 'A' | 'B' | 'C' | 'D' | 'E'
    const [groupLevels, setGroupLevels] = useState<Record<number, string>>({});
    // groupNotes[groupIndex] = adjusted score within range
    const [groupNotes, setGroupNotes] = useState<Record<number, number>>({});

    const selectedClassData = classes.find(c => c.name === classSelect);
    const isThirdYear = selectedClassData?.name.startsWith('3') ?? false;
    const classStudents = selectedClassData ? (studentsByClass[selectedClassData._id] || []) : [];
    const groupLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    const getStudentGroupIndex = (studentId: string): number => {
        if (!groupe || groupe.length === 0) return -1;
        return groupe.findIndex(g =>
            g.students.some(s => s.id === studentId || s._id?.toString() === studentId)
        );
    };

    const levelToNote = (level: string) => {
        switch (level) {
            case 'A': return { default: 19, min: 18, max: 20 };
            case 'B': return { default: 16, min: 15, max: 17 };
            case 'C': return { default: 12, min: 11, max: 14 };
            case 'D': return { default: 9, min: 7, max: 10 };
            case 'E': return { default: 4, min: 3, max: 6 };
            default: return null;
        }
    };

    const calcScore = (studentId: string, gender: Gender, perf: string): number => {
        const val = parseFloat(perf);
        if (isNaN(val) || val <= 0) return 0;
        return getScore(activity, gender, val, isThirdYear);
    };

    const getBestFardi = (studentId: string, gender: Gender): number => {
        const scores = Array.from({ length: 6 }, (_, j) => {
            const perf = performances[`${studentId}-${j}`] ?? '';
            return calcScore(studentId, gender, perf);
        });
        return Math.max(...scores, 0);
    };

    const getJamaiNote = (groupIndex: number): number => {
        if (groupIndex === -1) return 0;
        if (groupNotes[groupIndex] !== undefined) return groupNotes[groupIndex];
        const level = groupLevels[groupIndex];
        return levelToNote(level)?.default ?? 0;
    };

    const cell = 'border border-black px-1 py-[2px]';
    const inputCls = 'w-full border-none outline-none text-center bg-transparent text-xs';
    const selectCls = 'w-full border-none outline-none text-center bg-transparent text-xs appearance-none';

    return (
        <div dir="rtl" className='m-2 md:m-4 flex flex-col items-center'>

            {/* controls */}
            <div className="print:hidden flex flex-col md:flex-row flex-wrap gap-3 items-center border rounded-xl p-4 w-full mb-6">
                <div className='flex gap-2 items-center'>
                    <label className='font-semibold text-sm'>اختر القسم</label>
                    <select
                        className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
                        onChange={e => {
                            setClassSelect(e.target.value);
                            setPerformances({});
                            setGroupLevels({});
                            setGroupNotes({});
                            const found = classes.find(c => c.name === e.target.value);
                            if (found) {
                                fetchStudents(found._id);
                                fetchGroupes(found._id);
                            }
                        }}>
                        <option value="">— اختر —</option>
                        {classes.map((c, i) => (
                            <option key={i} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className='flex gap-2 items-center'>
                    <label className='font-semibold text-sm'>النشاط</label>
                    <select
                        className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
                        value={activity}
                        onChange={e => {
                            setActivity(e.target.value as Activity);
                            setPerformances({});
                        }}>
                        <option value="sprint">عدو 60م</option>
                        <option value="longjump">الوثب الطويل</option>
                        <option value="throw">رمي الجلة</option>
                    </select>
                </div>
                <button
                    onClick={() => window.print()}
                    className='bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold text-sm w-full md:w-auto'>
                    طباعة 🖨️
                </button>
            </div>

            {/* group level controls — one per group */}
            {groupe.length > 0 && (
                <div className="print:hidden flex flex-wrap gap-4 items-center border rounded-xl p-4 w-full mb-6">
                    <span className="font-semibold text-sm">مستوى الأفواج (النشاط الجماعي):</span>
                    {groupe.map((_, gi) => {
                        const level = groupLevels[gi] ?? '';
                        const range = levelToNote(level);
                        return (
                            <div key={gi} className="flex gap-2 items-center">
                                <span className="text-sm">فوج {groupLabels[gi]}:</span>
                                <select
                                    className='border border-gray-300 rounded px-2 py-1 bg-white text-black text-sm'
                                    value={level}
                                    onChange={e => {
                                        const newLevel = e.target.value;
                                        setGroupLevels(prev => ({ ...prev, [gi]: newLevel }));
                                        const r = levelToNote(newLevel);
                                        if (r) setGroupNotes(prev => ({ ...prev, [gi]: r.default }));
                                        else setGroupNotes(prev => { const n = { ...prev }; delete n[gi]; return n; });
                                    }}>
                                    <option value="">—</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                </select>
                                {range && (
                                    <select
                                        className='border border-gray-300 rounded px-2 py-1 bg-white text-black text-sm'
                                        value={groupNotes[gi] ?? range.default}
                                        onChange={e => setGroupNotes(prev => ({ ...prev, [gi]: Number(e.target.value) }))}>
                                        {Array.from({ length: range.max - range.min + 1 }, (_, k) => range.min + k).map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* A4 document */}
            <div id="a4-card" className='w-full bg-white text-black p-2 md:p-6'>
                <div className="overflow-x-auto mt-1">
                    <table className="w-full border-collapse text-center text-xs">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200" colSpan={12}>التقويم التكويني للنشاط الفردي</th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200" colSpan={2}>النشاط الجماعي</th>
                                <th></th>
                            </tr>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                {['1', '2', '3', '4', '5', '6'].map((n, i) => (
                                    <th colSpan={2} className="border border-black bg-blue-200 print:bg-blue-200" key={i}>ح{n}</th>
                                ))}
                                <th className="border border-black bg-blue-200 print:bg-blue-200">أحسن علامة</th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200">المستوى</th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200">العلامة</th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200">العلامة النهائية</th>
                            </tr>
                            <tr className="border border-black bg-amber-100 print:bg-amber-100">
                                <th className="border border-black">رقم</th>
                                <th className="border border-black">أسماء التلاميذ</th>
                                <th className="border border-black">الفوج</th>
                                {Array(6).fill(0).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th className="border border-black w-10">الأداء</th>
                                        <th className="border border-black w-10">النتيجة</th>
                                    </React.Fragment>
                                ))}
                                <th className="border border-black w-10">20/20</th>
                                <th className="border border-black w-10">A-E</th>
                                <th className="border border-black w-10">20/20</th>
                                <th className="border border-black w-10">20/20</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classStudents.map((s, i) => {
                                const gender: Gender = s.gender === 'male' ? 'male' : 'female';
                                const groupIndex = getStudentGroupIndex(s._id);
                                const groupLabel = groupIndex !== -1 ? groupLabels[groupIndex] : '—';
                                const bestFardi = getBestFardi(s._id, gender);
                                const jamaiNote = getJamaiNote(groupIndex);
                                const jamaiLevel = groupIndex !== -1 ? (groupLevels[groupIndex] ?? '—') : '—';
                                const final = bestFardi > 0 || jamaiNote > 0
                                    ? (bestFardi + jamaiNote) / 2
                                    : 0;

                                return (
                                    <tr key={s._id}>
                                        <td className={`${cell} bg-blue-200 print:bg-blue-200`}>{i + 1}</td>
                                        <td className={`${cell} bg-amber-100 print:bg-amber-100 whitespace-nowrap px-1 text-right`}>{s.name}</td>
                                        <td className={cell}>{groupLabel}</td>
                                        {Array.from({ length: 6 }).map((_, j) => {
                                            const key = `${s._id}-${j}`;
                                            const perf = performances[key] ?? '';
                                            const score = calcScore(s._id, gender, perf);
                                            return (
                                                <React.Fragment key={j}>
                                                    <td className={cell}>
                                                        <input
                                                            type="text"
                                                            value={perf}
                                                            onChange={e => setPerformances(prev => ({ ...prev, [key]: e.target.value }))}
                                                            className={inputCls}
                                                        />
                                                    </td>
                                                    <td className={cell}>
                                                        {score > 0 ? score.toFixed(2) : ''}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                        <td className={`${cell} font-semibold text-blue-700`}>
                                            {bestFardi > 0 ? bestFardi.toFixed(2) : ''}
                                        </td>
                                        <td className={cell}>{jamaiLevel}</td>
                                        <td className={cell}>{jamaiNote > 0 ? jamaiNote : '—'}</td>
                                        <td className={`${cell} font-semibold text-red-600`}>
                                            {final > 0 ? final.toFixed(2) : ''}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TaqwimTakwini
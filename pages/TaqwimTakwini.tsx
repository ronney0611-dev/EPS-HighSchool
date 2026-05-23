'use client'
import { useClasses } from "@/hooks/useClasses"
import { useGroupe } from "@/hooks/useGroupe";
import React, { useState } from "react"
import { Gender, getScore } from "@/src/config/barem2"
import { useTakwini } from "@/hooks/useTakwini";

const TaqwimTakwini = () => {
    const { classes, studentsByClass, fetchStudents } = useClasses();
    const [classSelect, setClassSelect] = useState('');
    const { groupe, fetchGroupes } = useGroupe();
    const { saveTakwini, fetchTakwini, performances, setPerformances,
        groupLevels, setGroupLevels,
        groupNotes, setGroupNotes, } = useTakwini();
    const [activity, setActivity] = useState<'sprint' | 'longjump' | 'throw'>('sprint');

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

    const classId = selectedClassData?._id ?? '';
    const studentIds = classStudents.map(s => s._id);
    const genders = Object.fromEntries(classStudents.map(s => [s._id, s.gender as Gender]));

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
        let best = 0;
        for (let gi = 0; gi < 6; gi++) {
            const key = `${groupIndex}-${gi}`;
            if (groupNotes[key] !== undefined && groupNotes[key] > best) {
                best = groupNotes[key];
            }
        }
        return best;
    };

    const cell = 'border border-black px-1 py-[2px]';
    const inputCls = 'w-full border-none outline-none text-center bg-transparent text-xs';
    const select = 'w-full border-none outline-none text-center bg-transparent text-xs appearance-none font-semibold text-blue-700';

    return (
        <div dir="rtl" className='m-2 md:m-4 flex flex-col items-center'>

            {/* Controls */}
            <div className="print:hidden flex flex-col md:flex-row flex-wrap gap-3 items-center border rounded-xl p-4 w-full mb-6">
                <div className='flex gap-2 items-center'>
                    <label className='font-semibold text-sm'>اختر القسم</label>
                    <select
                        className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
                        value={classSelect}
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
                            const newActivity = e.target.value as 'sprint' | 'longjump' | 'throw';
                            setActivity(newActivity);
                            if (classSelect) fetchTakwini(selectedClassData?._id ?? '', newActivity);
                        }}>
                        <option value="sprint">عدو 60م</option>
                        <option value="longjump">الوثب الطويل</option>
                        <option value="throw">رمي الجلة</option>
                    </select>
                </div>
            </div>

            {/* Document Grid */}
            <div id="a4-card" className='w-full bg-white text-black p-2 md:p-6'>
                <div className="overflow-x-auto mt-1">
                    <table className="w-full border-collapse text-center text-xs">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200" colSpan={14}>التقويم التكويني للنشاط الفردي</th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200" colSpan={7}>التقويم التكويني للنشاط الجماعي</th>
                                <th></th>
                            </tr>
                            <tr>
                                <th></th>
                                <th></th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200">الفوج</th>
                                {['1', '2', '3', '4', '5', '6'].map((n, i) => (
                                    <th colSpan={2} className="border border-black bg-blue-200 print:bg-blue-200" key={i}>ح{n}</th>
                                ))}
                                <th className="border border-black bg-blue-200 print:bg-blue-200">علامة النشاط الفردي</th>
                                <th colSpan={6} className="border border-black bg-blue-200 print:bg-blue-200 p-1 text-xs">
                                    A / B / C / D / E
                                </th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200">علامة النشاط الجماعي</th>
                                <th className="border border-black bg-blue-200 print:bg-blue-200">العلامة</th>
                            </tr>
                            <tr className="border border-black bg-amber-100 print:bg-amber-100">
                                <th className="border border-black">رقم</th>
                                <th className="border border-black">أسماء التلاميذ</th>
                                <th className="border border-black"></th>
                                {Array(6).fill(0).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th className="border border-black w-10">الأداء</th>
                                        <th className="border border-black w-10">النتيجة</th>
                                    </React.Fragment>
                                ))}
                                <th className="border border-black w-10">20/20</th>
                                {Array(6).fill(0).map((_, i) => (
                                    <th key={i} className="border border-black w-10">ح{i + 1}</th>
                                ))}
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
                                const isMalade = s.status === 'malade';

                                // Find the latest assigned group level to offer fine-tuning drop-downs
                                let currentGroupLevel = '';
                                let latestGroupSessionKey = '';
                                let bestNote = 0;
                                if (groupIndex !== -1) {
                                    for (let gi = 0; gi < 6; gi++) {
                                        const key = `${groupIndex}-${gi}`;
                                        if (groupLevels[key] && groupNotes[key] !== undefined && groupNotes[key] >= bestNote) {
                                            bestNote = groupNotes[key];
                                            currentGroupLevel = groupLevels[key];
                                            latestGroupSessionKey = key;
                                        }
                                    }
                                }
                                const noteRange = levelToNote(currentGroupLevel);

                                const final = bestFardi > 0 || jamaiNote > 0
                                    ? (bestFardi + jamaiNote) / 2
                                    : 0;

                                return (
                                    <tr key={s._id}>
                                        <td className='border bg-blue-200 print:bg-blue-200 border-black'>{i + 1}</td>
                                        <td className='border bg-amber-100 print:bg-amber-100 border-black whitespace-nowrap px-1 text-right'>
                                            {s.name}
                                        </td>
                                        {isMalade ? (
                                            <>
                                                {Array.from({ length: 22 }).map((_, k) => (
                                                    <td key={k} className={`${cell} text-red-500 `}>اعفاء</td>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                <td className='border border-black font-semibold'>{groupLabel}</td>

                                                {/* INDIVIDUAL PERFORMANCE SESSIONS INPUTS */}
                                                {Array.from({ length: 6 }).map((_, gi) => {
                                                    const perfKey = `${s._id}-${gi}`;
                                                    const rawPerf = performances[perfKey] ?? '';
                                                    const currentScore = calcScore(s._id, gender, rawPerf);

                                                    return (
                                                        <React.Fragment key={gi}>
                                                            <td className='border border-black p-0'>
                                                                <input
                                                                    type="text"
                                                                    className={inputCls}
                                                                    value={rawPerf}
                                                                    onChange={e => {
                                                                        const val = e.target.value;
                                                                        setPerformances(prev => ({ ...prev, [perfKey]: val }));
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className='border border-black text-gray-600 font-medium bg-gray-50/50'>
                                                                {currentScore > 0 ? currentScore : ''}
                                                            </td>
                                                        </React.Fragment>
                                                    );
                                                })}

                                                {/* BEST PERFORMANCE SUMMARY COLUMN */}
                                                <td className={`${cell} font-semibold text-blue-700 bg-blue-50/30`}>
                                                    {bestFardi > 0 ? bestFardi.toFixed(2) : ''}
                                                </td>

                                                {/* SHARED GROUP ACTIONS LOOP FOR ALL 6 COHORTS */}
                                                {Array.from({ length: 6 }).map((_, gi) => {
                                                    const groupSessionKey = groupIndex !== -1
                                                        ? `${groupIndex}-${gi}`
                                                        : `nogroup-${s._id}-${gi}`;

                                                    const sessionLevel = groupLevels[groupSessionKey] ?? '';

                                                    return (
                                                        <td key={gi} className='border border-black p-0'>
                                                            <select
                                                                className="w-full text-center outline-none appearance-none bg-transparent text-xs p-1"
                                                                value={sessionLevel}
                                                                onChange={e => {
                                                                    const newLevel = e.target.value;

                                                                    setGroupLevels(prev => ({
                                                                        ...prev,
                                                                        [groupSessionKey]: newLevel
                                                                    }));

                                                                    const r = levelToNote(newLevel);
                                                                    if (r) {
                                                                        setGroupNotes(prev => ({
                                                                            ...prev,
                                                                            [groupSessionKey]: r.default
                                                                        }));
                                                                    } else {
                                                                        setGroupNotes(prev => {
                                                                            const n = { ...prev };
                                                                            delete n[groupSessionKey];
                                                                            return n;
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">-</option>
                                                                <option value="A">A</option>
                                                                <option value="B">B</option>
                                                                <option value="C">C</option>
                                                                <option value="D">D</option>
                                                                <option value="E">E</option>
                                                            </select>
                                                        </td>
                                                    );
                                                })}

                                                {/* INDIVIDUALIZED GROUP GRADE WITH FINE TUNING PICKER */}
                                                <td className='border border-black p-0 bg-blue-50/30 font-medium min-w-10'>
                                                    {jamaiNote > 0 && noteRange ? (
                                                        <select
                                                            value={groupNotes[latestGroupSessionKey] ?? noteRange.default}
                                                            className={select}
                                                            onChange={e => {
                                                                const customVal = Number(e.target.value);
                                                                setGroupNotes(prev => ({
                                                                    ...prev,
                                                                    [latestGroupSessionKey]: customVal
                                                                }));
                                                            }}>
                                                            {Array.from(
                                                                { length: noteRange.max - noteRange.min + 1 },
                                                                (_, j) => noteRange.min + j
                                                            ).map(n => (
                                                                <option key={n} value={n}>{n}</option>
                                                            ))}
                                                        </select>
                                                    ) : jamaiNote > 0 ? jamaiNote : '—'}
                                                </td>

                                                {/* FINAL OVERALL TOTAL SCORE */}
                                                <td className='border border-black font-bold bg-amber-50/50 text-emerald-700 text-sm'>
                                                    {final > 0 ? final.toFixed(2) : ''}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
            <div className="my-6 flex gap-4" >
                <button
                    onClick={() => saveTakwini(classId, activity, studentIds, genders, isThirdYear)}
                    className='bg-green-600 text-white px-6 py-2 rounded-xl font-semibold text-sm w-full md:w-auto cursor-pointer'>
                    حفظ
                </button>
                <button
                    onClick={() => window.print()}
                    className='bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold text-sm w-full md:w-auto cursor-pointer'>
                    طباعة 🖨️
                </button>
            </div>
        </div >
    )
}

export default TaqwimTakwini;
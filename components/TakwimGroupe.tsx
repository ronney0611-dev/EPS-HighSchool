'use client'

import { useClasses } from "@/hooks/useClasses";
import { saveGroupeData } from "@/hooks/useTachkhisi";
import { useTeacher } from "@/hooks/useTeacher";
import React, { useEffect, useState } from "react"

const TakwimGroupe = () => {
    const { classes, studentsByClass, fetchStudents } = useClasses();
    const { teacher } = useTeacher();
    const [mochir, setMochir] = useState(4);
    const [students, setStudents] = useState<{ name: string, result: { t1: number, t2: number }, score: { t1: number, t2: number }[], levelT2: string }[]>([]);
    const [classSelect, setClassSelect] = useState('');
    const selectedClassData = classes.find(c => c.name === classSelect);

    useEffect(() => {
        if (!classSelect) return;
        const found = classes.find(c => c.name === classSelect);
        if (!found) return;
        const students = studentsByClass[found._id] || [];
        setTimeout(() => {
            setStudents(students.map(s => ({
                name: s.name,
                score: Array.from({ length: mochir }, () => ({ t1: 0, t2: 0 })),
                result: { t1: 0, t2: 0 },
                levelT2: '',
            })));
        }, 0);
    }, [studentsByClass, classSelect]);



    const handleClassSelect = (className: string) => {
        setClassSelect(className);
        const found = classes.find(c => c.name === className);
        if (found) fetchStudents(found._id);
    }

    const updateLevelT2 = (studentIndex: number, value: string) => {
        const updated = students.map((s, i) =>
            i === studentIndex ? { ...s, levelT2: value } : s
        );
        setStudents(updated);
    };

    const updateScore = (studentIndex: number, scoreIndex: number, attempt: string, value: number) => {
        const newStudents = [...students];
        const newStudentScore = [...newStudents[studentIndex].score];
        newStudentScore[scoreIndex] = { ...newStudentScore[scoreIndex], [attempt]: value }
        newStudents[studentIndex] = { ...newStudents[studentIndex], score: newStudentScore }
        setStudents(newStudents);
    }

    const totalT1PerMochir = Array.from({ length: mochir }, (_, i) => {
        const total = students.reduce((acc, s) => acc + (s.score[i]?.t1 ?? 0), 0);
        return students.length === 0 ? 0 : total / students.length;
    });

    const totalT2PerMochir = Array.from({ length: mochir }, (_, i) => {
        const total = students.reduce((acc, s) => acc + (s.score[i]?.t2 ?? 0), 0);
        return students.length === 0 ? 0 : total / students.length;
    });

    return (
        <div dir="rtl" className='m-2 md:m-4 flex flex-col items-center bg-white text-black'>

            {/* controls */}
            <div className="print:hidden flex flex-col md:flex-row flex-wrap gap-3 items-center border rounded-xl p-4 w-full mb-6">
                <div className="flex gap-2 items-center">
                    <p className="text-sm font-semibold">عدد المؤشرات</p>
                    <select
                        disabled={students.length > 0}
                        className="border rounded px-2 py-1 bg-white text-black text-sm"
                        onChange={e => setMochir(Number(e.target.value))}>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <div className='flex gap-2 items-center'>
                    <label className='font-semibold text-sm'>اختر القسم</label>
                    <select
                        className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
                        onChange={e => handleClassSelect(e.target.value)}>
                        <option value="">— اختر —</option>
                        {classes.map((c, i) => (
                            <option key={i} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => window.print()}
                    className='bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold text-sm w-full md:w-auto'>
                    طباعة 🖨️
                </button>
                <button
                    onClick={() => saveGroupeData(
                        classSelect,
                        students.map(s => ({ name: s.name, levelT2: s.levelT2 }))
                    )}
                    className='bg-green-600 text-white px-6 py-2 rounded-xl font-semibold text-sm w-full md:w-auto'>
                    حفظ ✅
                </button>
            </div>

            {/* A4 document */}
            <div id="a4-card" className='w-full bg-white text-black p-2 md:p-6'>

                {/* header */}
                <div dir="rtl" className="text-black text-center bg-white w-full">

                    {/* title */}
                    <div className="flex justify-center items-center border border-black py-1 bg-blue-200 print:bg-blue-200 overflow-hidden">
                        <h1 className="text-sm md:text-xl font-bold text-center w-full px-2 flex flex-wrap justify-center gap-1">
                            <span>بطاقة التقويم التشخيصي نشاط جماعي :</span>
                            <input
                                className="text-center px-1 border-none text-black bg-transparent min-w-0 flex-1"
                                type="text"
                                placeholder="النشاط" />
                        </h1>
                    </div>

                    {/* info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-blue-200 print:bg-blue-200 print:grid-cols-4">
                        <div className="border border-black py-1 px-2 text-sm">
                            المؤسسة : <span className="font-medium">{teacher.school || '—'}</span>
                        </div>
                        <div className="border border-black py-1 px-2 text-sm">
                            المستوى : <span className="font-medium">{selectedClassData?.level || '—'}</span>
                        </div>
                        <div className="border border-black py-1 px-2 text-sm">
                            الأستاذ : <span className="font-medium">{teacher.name || '—'}</span>
                        </div>
                        <div className="border border-black py-1 px-2 text-sm">
                            القسم : <span className="font-medium">{classSelect || '—'}</span>
                        </div>
                    </div>

                    {/* goals */}
                    <div className="border border-black bg-blue-200 print:bg-blue-200">
                        <div className="border-b border-black py-1 px-2 flex flex-wrap gap-1 items-center text-sm">
                            <span className="whitespace-nowrap">الكفاءة القاعدية :</span>
                            <input className="border-r border-black pr-2 flex-1 min-w-0 bg-transparent" type="text" placeholder="الكفاءة القاعدية" />
                        </div>
                        <div className="py-1 px-2 flex flex-wrap gap-1 items-center text-sm">
                            <span className="whitespace-nowrap">الهدف التعلمي :</span>
                            <input className="border-r border-black pr-2 flex-1 min-w-0 bg-transparent" type="text" placeholder="الهدف التعلمي" />
                        </div>
                    </div>
                </div>

                {/* main table */}
                <div className="overflow-x-auto mt-1">
                    <table className="w-full border-collapse border border-black text-center text-xs">
                        <thead className="border border-black bg-blue-200 print:bg-blue-200">
                            <tr className="border border-black">
                                <th className="border border-black">#</th>
                                <th className="border border-black">الاسم واللقب</th>
                                {Array(mochir).fill(0).map((_, i) => (
                                    <th className="border border-black" key={i} colSpan={2}>مؤشر {i + 1}</th>
                                ))}
                                <th className="border border-black" colSpan={3}>النسبة المئوية</th>
                                <th className="border border-black" colSpan={2}>المستوى </th>
                            </tr>
                            <tr className="border border-black bg-amber-100 print:bg-amber-100">
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                {Array(mochir).fill(0).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <td className="border border-black">ت1</td>
                                        <td className="border border-black">ت2</td>
                                    </React.Fragment>
                                ))}
                                <td className="border border-black">ت1%</td>
                                <td className="border border-black">ت2%</td>
                                <td className="border border-black">ت2-ت1%</td>
                                <td className="border border-black">ت1</td>
                                <td className="border border-black">ت2</td>

                            </tr>
                        </thead>
                        <tbody className="border border-black">
                            {students.map((student, studentIndex) => {
                                const percentaget1 = (student.score.reduce((a, b) => a + b.t1, 0) / mochir) * 100
                                const percentaget2 = (student.score.reduce((a, b) => a + b.t2, 0) / mochir) * 100
                                const t2_t1 = percentaget2 - percentaget1;
                                return (
                                    <tr className="border border-black" key={studentIndex}>
                                        <td className="border border-black bg-amber-100 print:bg-amber-100">{studentIndex + 1}</td>
                                        <td className="border border-black bg-blue-100 print:bg-blue-100 text-right px-1 whitespace-nowrap">{student.name}</td>
                                        {student.score.map((sc, scoreIndex) => (
                                            <React.Fragment key={scoreIndex}>
                                                <td className="border border-black">
                                                    <select className="border-none outline-none appearance-none bg-transparent w-8 text-center"
                                                        onChange={e => updateScore(studentIndex, scoreIndex, 't1', Number(e.target.value))}>
                                                        <option value="0">0</option>
                                                        <option value="1">1</option>
                                                    </select>
                                                </td>
                                                <td className="border border-black">
                                                    <select className="border-none outline-none appearance-none bg-transparent w-8 text-center"
                                                        onChange={e => updateScore(studentIndex, scoreIndex, 't2', Number(e.target.value))}>
                                                        <option value="0">0</option>
                                                        <option value="1">1</option>
                                                    </select>
                                                </td>
                                            </React.Fragment>
                                        ))}
                                        <td className="border border-black">{percentaget1.toFixed(1)}</td>
                                        <td className="border border-black">{percentaget2.toFixed(1)}</td>
                                        <td className="border border-black">{t2_t1.toFixed(1)}</td>
                                        <td className="border border-black">
                                            <select className="border-none outline-none appearance-none bg-transparent w-8 text-center">
                                                <option value="">—</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                            </select>
                                        </td>
                                        <td className="border border-black">
                                            <select onChange={e => updateLevelT2(studentIndex, e.target.value)} className="border-none outline-none appearance-none bg-transparent w-8 text-center">
                                                <option value="">—</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                            </select>
                                        </td>

                                    </tr>
                                )
                            })}

                            <tr className="border border-black">
                                <td className="border border-black bg-amber-100 print:bg-amber-100"></td>
                                <td className="border border-black bg-blue-200 print:bg-blue-200 font-semibold">النتيجة الجماعية</td>
                                {totalT1PerMochir.map((value, i) => (
                                    <React.Fragment key={i}>
                                        <td className="border border-black">{value.toFixed(2)}</td>
                                        <td className="border border-black">{totalT2PerMochir[i].toFixed(2)}</td>
                                    </React.Fragment>
                                ))}
                                {Array(5).fill(0).map((_, i) => <td key={i} className="border border-black"></td>)}
                            </tr>

                            <tr className="border border-black">
                                <td className="border border-black bg-amber-100 print:bg-amber-100"></td>
                                <td className="border border-black bg-blue-200 print:bg-blue-200 font-semibold">النسبة %</td>
                                {totalT1PerMochir.map((value, i) => (
                                    <React.Fragment key={i}>
                                        <td className="border border-black">{(value * 100).toFixed(1)}%</td>
                                        <td className="border border-black">{(totalT2PerMochir[i] * 100).toFixed(1)}%</td>
                                    </React.Fragment>
                                ))}
                                {Array(5).fill(0).map((_, i) => <td key={i} className="border border-black"></td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TakwimGroupe
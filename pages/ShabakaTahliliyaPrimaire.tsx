'use client'

import React, { useState } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useTeacher } from "@/hooks/useTeacher";
import { useShabaka } from "@/hooks/useShabaka";
import { ToastContainer, toast } from 'react-toastify';
import { primaireMokhatatatConfig, MokhatarData } from "@/src/config/primairDoc";

const LEVEL_KEYS = [
    { key: 's1', label: 'السنة الأولى ابتدائي' },
    { key: 's2', label: 'السنة الثانية ابتدائي' },
    { key: 's3', label: 'السنة الثالثة ابتدائي' },
    { key: 's4', label: 'السنة الرابعة ابتدائي' },
    { key: 's5', label: 'السنة الخامسة ابتدائي' },
];

// أ = تملك أقصى (3/3)، ب = تملك مقبول (3/2)، ج = تملك جزئي (3/1)، د = تملك محدود (3/0)
const LETTER_MAP: Record<number, { letter: string; color: string }> = {
    3: { letter: 'أ', color: 'bg-green-200 text-green-900' },
    2: { letter: 'ب', color: 'bg-blue-200 text-blue-900' },
    1: { letter: 'ج', color: 'bg-yellow-200 text-yellow-900' },
    0: { letter: 'د', color: 'bg-red-200 text-red-900' },
};

interface StudentRow {
    studentId: string;
    name: string;
    checks: boolean[][]; // [maiyarIndex][mouachirIndex]
}

type Mode = 'tashkhisi' | 'tahsili';

const scoreOf = (student: StudentRow, maiyarIndex: number) =>
    student.checks[maiyarIndex]?.filter(Boolean).length ?? 0;

// متوسط نقاط القسم لمعيار معين، مقرب لأقرب مستوى في المفتاح (0-3)
const classAverageScore = (students: StudentRow[], maiyarIndex: number) => {
    if (students.length === 0) return 0;
    const total = students.reduce((acc, s) => acc + scoreOf(s, maiyarIndex), 0);
    return Math.round(total / students.length);
};

const ShabakaTahliliyaPrimaire = () => {
    const { classes, fetchStudents, studentsByClass } = useClasses();
    const { teacher } = useTeacher();
    const { fetchShabaka, saveShabaka, setShabaka } = useShabaka();

    const [levelKey, setLevelKey] = useState<string>('s1');
    const [maidanIndex, setMaidanIndex] = useState<number>(0);
    const [classSelect, setClassSelect] = useState<string>('');
    const [mode, setMode] = useState<Mode>('tashkhisi');

    const [students, setStudents] = useState<StudentRow[]>([]);
    const [tashkhisiSnapshot, setTashkhisiSnapshot] = useState<StudentRow[] | null>(null);

    const [studentsSourceKey, setStudentsSourceKey] = useState<string>('');
    const [loadedFromSave, setLoadedFromSave] = useState(false);

    const currentLevelData: MokhatarData | undefined = primaireMokhatatatConfig[levelKey];
    const currentMaidan = currentLevelData?.maidans[maidanIndex];
    const mayayirList = currentMaidan?.mayayir || [];

    const foundClass = classSelect ? classes.find(c => c.name === classSelect) : undefined;
    const hookStudents = foundClass ? (studentsByClass[foundClass._id] || []) : [];
    const currentStudentsKey = classSelect ? `${classSelect}::${levelKey}::${maidanIndex}::${mode}::${hookStudents.length}` : '';

    // مزامنة قائمة التلاميذ عند تغيير القسم/الميدان/الوضع، دون محو بيانات محفوظة تم تحميلها
    if (currentStudentsKey !== studentsSourceKey && !loadedFromSave) {
        setStudentsSourceKey(currentStudentsKey);
        setStudents(hookStudents.map(s => ({
            studentId: s._id,
            name: s.name,
            checks: mayayirList.map(m => m.mouachirat.map(() => false)),
        })));
    }

    const resetSelectionState = () => {
        setShabaka(null);
        setTashkhisiSnapshot(null);
        setLoadedFromSave(false);
    };

    const handleLevelChange = (newLevel: string) => {
        setLevelKey(newLevel);
        setMaidanIndex(0);
        resetSelectionState();
        if (classSelect) {
            loadShabakaFor(classSelect, mode, newLevel, 0);
        }
    };

    const handleMaidanChange = (index: number) => {
        setMaidanIndex(index);
        resetSelectionState();
        if (classSelect) {
            loadShabakaFor(classSelect, mode, levelKey, index);
        }
    };

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        setLoadedFromSave(false);
        // نعيد التحميل عند تبديل الوضع إن كان القسم محددا مسبقا
        if (classSelect) {
            loadShabakaFor(classSelect, newMode, levelKey, maidanIndex);
        }
    };

    const loadShabakaFor = async (className: string, targetMode: Mode, level: string, maidanIdx: number) => {
        const found = classes.find(c => c.name === className);
        if (!found) return;

        const data = await fetchShabaka(found._id, level, maidanIdx);

        if (data?.tashkhisi?.students?.length) {
            setTashkhisiSnapshot(data.tashkhisi.students);
        } else {
            setTashkhisiSnapshot(null);
        }

        const targetData = targetMode === 'tashkhisi' ? data?.tashkhisi : data?.tahsili;
        if (targetData?.students?.length) {
            setStudents(targetData.students);
            setLoadedFromSave(true);
        } else {
            setLoadedFromSave(false);
        }
    };
    const handleClassSelect = async (className: string) => {
        setClassSelect(className);
        resetSelectionState();

        const found = classes.find(c => c.name === className);
        if (!found) return;
        fetchStudents(found._id);

        await loadShabakaFor(className, mode, levelKey, maidanIndex);
    };

    const toggleCheck = (studentIndex: number, maiyarIndex: number, mouachirIndex: number) => {
        setStudents(prev => {
            const copy = [...prev];
            const student = { ...copy[studentIndex] };
            const checks = student.checks.map(row => [...row]);
            checks[maiyarIndex][mouachirIndex] = !checks[maiyarIndex][mouachirIndex];
            student.checks = checks;
            copy[studentIndex] = student;
            return copy;
        });
    };

    const handleSave = async () => {
        const found = classes.find(c => c.name === classSelect);
        if (!found) return;
        const result = await saveShabaka(found._id, levelKey, maidanIndex, mode, students);
        if (result) {
            toast(mode === 'tashkhisi' ? "تم حفظ التقويم التشخيصي بنجاح !" : "تم حفظ التقويم التحصيلي بنجاح !", { type: "success" });
            if (mode === 'tashkhisi') {
                setTashkhisiSnapshot(students);
            }
        } else {
            toast("حدث خطأ أثناء الحفظ !", { type: "error" });
        }
    };

    // مقارنة التطور: لكل معيار، تشخيصي مقابل تحصيلي (فقط في وضع التحصيلي وعند وجود الاثنين)
    const showTatawor = mode === 'tahsili' && tashkhisiSnapshot !== null;
    const tataworPerMaiyar = mayayirList.map((_, i) => {
        const tashkhisiScore = classAverageScore(tashkhisiSnapshot || [], i);
        const tahsiliScore = classAverageScore(students, i);
        return {
            tashkhisi: LETTER_MAP[tashkhisiScore] ?? LETTER_MAP[0],
            tahsili: LETTER_MAP[tahsiliScore] ?? LETTER_MAP[0],
            diff: tahsiliScore - tashkhisiScore,
        };
    });

    return (
        <div dir="rtl" className='m-2 md:m-4 flex flex-col items-center bg-white text-black font-sans'>

            {/* أدوات التحكم */}
            <div className="print:hidden flex flex-col gap-4 border border-gray-300 rounded-xl p-4 w-full mb-6 bg-gray-50">
                <div className="flex flex-wrap gap-4 items-center">

                    <div className='flex gap-2 items-center'>
                        <label className='font-bold text-sm text-gray-700'>نوع التقويم:</label>
                        <div className="flex rounded-lg overflow-hidden border border-gray-300">
                            <button
                                onClick={() => handleModeChange('tashkhisi')}
                                className={`px-3 py-1.5 text-sm font-bold ${mode === 'tashkhisi' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                                تشخيصي
                            </button>
                            <button
                                onClick={() => handleModeChange('tahsili')}
                                className={`px-3 py-1.5 text-sm font-bold ${mode === 'tahsili' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}>
                                تحصيلي
                            </button>
                        </div>
                    </div>

                    <div className='flex gap-2 items-center'>
                        <label className='font-bold text-sm text-gray-700'>المستوى الدراسي:</label>
                        <select
                            className='border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none'
                            value={levelKey}
                            onChange={e => handleLevelChange(e.target.value)}>
                            {LEVEL_KEYS.map(lvl => (
                                <option key={lvl.key} value={lvl.key}>{lvl.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className='flex gap-2 items-center'>
                        <label className='font-bold text-sm text-gray-700'>الميدان:</label>
                        <select
                            className='border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none'
                            value={maidanIndex}
                            onChange={e => handleMaidanChange(Number(e.target.value))}>
                            {currentLevelData?.maidans.map((m, idx) => (
                                <option key={idx} value={idx}>{m.name}</option>
                            ))}
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
                </div>

                {mode === 'tahsili' && tashkhisiSnapshot === null && classSelect && (
                    <div className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2">
                        تنبيه: لا يوجد تقويم تشخيصي محفوظ لهذا القسم/الميدان بعد. يمكنك تعبئة التحصيلي، لكن جدول التطور لن يظهر بدون بيانات التشخيصي.
                    </div>
                )}
            </div>

            {/* بطاقة الشبكة للطباعة A4 landscape */}
            <div id="a4-shabaka-primaire" className='w-full bg-white text-black p-2 md:p-6 border border-black rounded-sm shadow-md print:border-none print:shadow-none'>

                <div className="text-center bg-white w-full">
                    <div className="grid grid-cols-2 text-xs md:text-sm border border-black">
                        <div className="border-l border-black py-1 px-2 text-right">المؤسسة: {teacher.school || '—'}</div>
                        <div className="py-1 px-2 text-right">الأستاذ: {teacher.name || '—'}</div>
                    </div>
                    <div className={`flex justify-center items-center border-x border-b border-black py-2 ${mode === 'tashkhisi' ? 'bg-yellow-200' : 'bg-green-200'}`}>
                        <h1 className="text-sm md:text-lg font-black text-center w-full px-2">
                            الشبكة التحليلية للتقويم {mode === 'tashkhisi' ? 'التشخيصي' : 'التحصيلي'} للكفاءة الختامية لميدان {currentMaidan?.name || '—'}
                        </h1>
                    </div>
                    <div className="grid grid-cols-2 text-xs md:text-sm border-x border-b border-black">
                        <div className="border-l border-black py-1 px-2 text-right">المستوى: {LEVEL_KEYS.find(l => l.key === levelKey)?.label || '—'}</div>
                        <div className="py-1 px-2 text-right">السنة الدراسية: 2026/2025</div>
                    </div>
                </div>

                <div className="overflow-x-auto mt-2">
                    <table className="w-full border-collapse border border-black text-center text-[10px]">
                        <thead>
                            <tr className="bg-blue-100 font-bold">
                                <th className="border border-black p-1 w-8" rowSpan={3}>رقم</th>
                                <th className="border border-black p-1 min-w-32" rowSpan={3}>الاسم واللقب</th>
                                {mayayirList.map((m, i) => (
                                    <th key={i} className="border border-black p-1" colSpan={m.mouachirat.length}>
                                        {m.title}
                                    </th>
                                ))}
                                <th className="border border-black p-1 bg-purple-100" colSpan={mayayirList.length}>نتيجة تحقيق المعايير</th>
                            </tr>
                            <tr className="bg-blue-50">
                                {mayayirList.map((m, i) => (
                                    m.mouachirat.map((mo, j) => (
                                        <th key={`${i}-${j}`} className="border border-black p-1 font-normal text-[9px] max-w-16">
                                            {mo}
                                        </th>
                                    ))
                                ))}
                                {mayayirList.map((_, i) => (
                                    <th key={i} className="border border-black p-1 bg-purple-50">معيار {String(i + 1).padStart(2, '0')}</th>
                                ))}
                            </tr>
                            <tr className="bg-gray-100">
                                {mayayirList.map((m, i) => (
                                    m.mouachirat.map((_, j) => (
                                        <React.Fragment key={`${i}-${j}`}>
                                            <td className="border border-black p-0.5 text-[9px]">0/1</td>
                                        </React.Fragment>
                                    ))
                                ))}
                                {mayayirList.map((_, i) => <td key={i} className="border border-black p-0.5 bg-purple-50"></td>)}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, studentIndex) => (
                                <tr key={student.studentId} className="border-b border-black hover:bg-gray-50">
                                    <td className="border border-black p-1 bg-gray-50 font-bold">{String(studentIndex + 1).padStart(2, '0')}</td>
                                    <td className="border border-black p-1 text-right px-2 whitespace-nowrap font-medium">{student.name}</td>
                                    {mayayirList.map((m, maiyarIndex) => (
                                        m.mouachirat.map((_, mouachirIndex) => (
                                            <td key={`${maiyarIndex}-${mouachirIndex}`} className="border border-black p-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={student.checks[maiyarIndex]?.[mouachirIndex] || false}
                                                    onChange={() => toggleCheck(studentIndex, maiyarIndex, mouachirIndex)}
                                                    className="w-3.5 h-3.5 cursor-pointer"
                                                />
                                            </td>
                                        ))
                                    ))}
                                    {mayayirList.map((_, maiyarIndex) => {
                                        const score = scoreOf(student, maiyarIndex);
                                        const { letter, color } = LETTER_MAP[score] ?? LETTER_MAP[0];
                                        return (
                                            <td key={maiyarIndex} className={`border border-black p-1 font-bold ${color}`}>
                                                {letter}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* المفتاح */}
                <div className="flex flex-wrap gap-4 justify-center mt-3 text-xs font-bold border border-black p-2 bg-gray-50">
                    <span>المفتاح:</span>
                    <span className="text-green-800">أ = تملك أقصى (3/3)</span>
                    <span className="text-blue-800">ب = تملك مقبول (3/2)</span>
                    <span className="text-yellow-800">ج = تملك جزئي (3/1)</span>
                    <span className="text-red-800">د = تملك محدود (3/0)</span>
                </div>

                {/* جدول التطور: تشخيصي مقابل تحصيلي، لكل معيار */}
                {showTatawor && (
                    <div className="mt-4 border border-black">
                        <div className="bg-purple-100 text-center font-black py-1 border-b border-black">جدول التطور — مقارنة التشخيصي بالتحصيلي</div>
                        <table className="w-full border-collapse text-center text-xs">
                            <thead>
                                <tr className="bg-gray-100 font-bold">
                                    <th className="border border-black p-1">المعيار</th>
                                    {mayayirList.map((_, i) => (
                                        <th key={i} className="border border-black p-1">معيار {String(i + 1).padStart(2, '0')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-1 text-right px-2 font-bold bg-yellow-50">التقويم التشخيصي</td>
                                    {tataworPerMaiyar.map((t, i) => (
                                        <td key={i} className={`border border-black p-1 font-bold ${t.tashkhisi.color}`}>{t.tashkhisi.letter}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="border border-black p-1 text-right px-2 font-bold bg-green-50">التقويم التحصيلي</td>
                                    {tataworPerMaiyar.map((t, i) => (
                                        <td key={i} className={`border border-black p-1 font-bold ${t.tahsili.color}`}>{t.tahsili.letter}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="border border-black p-1 text-right px-2 font-bold bg-purple-50">التطور الحاصل</td>
                                    {tataworPerMaiyar.map((t, i) => (
                                        <td key={i} className={`border border-black p-1 font-bold ${t.diff > 0 ? 'text-green-700' : t.diff < 0 ? 'text-red-700' : 'text-gray-600'}`}>
                                            {t.diff > 0 ? `+${t.diff}` : t.diff}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* الأزرار */}
            <div className="flex gap-2 w-full md:w-auto my-6 print:hidden">
                <button onClick={() => {
                    document.body.setAttribute('data-print-target', 'a4-shabaka-primaire');
                    window.print();
                }} className='bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm w-full md:w-auto shadow-sm hover:bg-blue-700 transition-colors'>
                    طباعة 🖨️
                </button>
                <button
                    onClick={handleSave}
                    className='bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm w-full md:w-auto shadow-sm hover:bg-green-700 transition-colors'>
                    حفظ ✅
                </button>
                <ToastContainer />
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 4mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    #a4-shabaka-primaire {
                        display: none;
                    }
                    body[data-print-target="a4-shabaka-primaire"] #a4-shabaka-primaire {
                        display: block !important;
                        width: 100% !important;
                        font-size: 8px !important;
                    }
                    table { font-size: 8px !important; }
                    th, td { padding: 1px 2px !important; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
};

export default ShabakaTahliliyaPrimaire;
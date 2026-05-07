'use client'

import { useClasses } from '@/hooks/useClasses';
import { useState } from 'react'
import { loadTashkhisi, loadGroupeData } from '@/hooks/useTachkhisi';
import { Gender, getScore, getTawaorScore } from '@/src/config/barem';

const TakwinTahsili = () => {
    const { classes } = useClasses();
    const [classSlecet, setClassSelect] = useState('');
    const [tashkhisiData, setTashkhisiData] = useState<{ name: string; percentaget2: number; resultT2: number; tatawaor: number }[]>([]);
    const [groupeData, setGroupeData] = useState<{ name: string; levelT2: string }[]>([]);
    const [studentNotes, setStudentNotes] = useState<{ first: number; second: number; groupeNote: number }[]>([]);
    const [activity, setActivity] = useState<'sprint' | 'longjump' | 'throw'>('sprint');

    const selectedClassData = classes.find(c => c.name === classSlecet);

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

    const handleClassSelect = (className: string) => {
        setClassSelect(className);
        const saved = loadTashkhisi(className);
        if (saved) setTashkhisiData(saved.students);
        else setTashkhisiData([]);
        const groupe = loadGroupeData(className);
        if (groupe) setGroupeData(groupe.students);
        else setGroupeData([]);
        const found = classes.find(c => c.name === className);
        if (found) {
            setStudentNotes(found.students.map((_, idx) => {
                const level = groupe?.students[idx]?.levelT2 ?? '';
                const range = levelToNote(level);
                return { first: 0, second: 0, groupeNote: range?.default ?? 0 };
            }));
        }
    };

    const updateNote = (index: number, field: 'first' | 'second' | 'groupeNote', value: number) => {
        setStudentNotes(prev => prev.map((n, i) => i === index ? { ...n, [field]: value } : n));
    };

    const cell = 'border border-black px-1 py-[2px]';
    const input = 'w-full border-none outline-none text-center bg-transparent text-xs';
    const select = 'w-full border-none outline-none text-center bg-transparent text-xs appearance-none';

    const isThirdYear = selectedClassData?.level === 'ثالثة ثانوي';

    return (
        <div dir="rtl" className="mx-4 mt-20">
            {/* controls */}
            <div className="print:hidden flex flex-col md:flex-row flex-wrap gap-3 items-center border rounded-xl p-4 w-full mb-6">
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
                <div className='flex gap-2 items-center'>
                    <label className='font-semibold text-sm'>النشاط</label>
                    <select
                        className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
                        onChange={e => setActivity(e.target.value as 'sprint' | 'longjump' | 'throw')}>
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

            {/* the form */}
            <main id="a4-card" dir="rtl" className='w-full bg-white text-black p-2 md:p-6 overflow-x-auto'>
                <table className="w-full border-collapse border border-black text-center text-xs">
                    <thead className='border border-black'>
                        <tr>
                            <th colSpan={2}></th>
                            <th className="border border-black bg-blue-200 print:bg-blue-200" colSpan={10}>نقطة الاختبار</th>
                            <th className="border border-black bg-blue-200 print:bg-blue-200">معدل المادة</th>
                        </tr>
                        <tr>
                            <th colSpan={2}></th>
                            <th className='border border-black' colSpan={7}>النشـــاط الفــردي</th>
                            <th className='border border-black' colSpan={2}>النشاط الجماعي</th>
                            <th className='border border-black'>النقطة</th>
                            <th>(مس+فر+اخ*2)</th>
                        </tr>
                        <tr>
                            <th colSpan={2}></th>
                            <th className='border border-black' colSpan={2}>التقويم التصرفي</th>
                            <th className='border border-black' colSpan={5}>التقويم التحصيلي</th>
                            <th className='border border-black'>المستوى</th>
                            <th className='border border-black'>نقطة</th>
                            <th className='border border-black'>النهائية</th>
                            <th>/</th>
                        </tr>
                        <tr>
                            <th className={cell}>الرقم</th>
                            <th className={`${cell} min-w-30`}>الاسم و اللقب</th>
                            <th className={`${cell} min-w-12.5`}>نتيجة%</th>
                            <th className={`${cell} min-w-12.5`}>النقطة/20</th>
                            <th className={`${cell} min-w-12.5`}>نتيجة</th>
                            <th className={`${cell} min-w-15`}>
                                {isThirdYear ? 'النقطة 16' : 'النقطة 14'}
                            </th>
                            <th className={`${cell} min-w-15`}>تطور الحاصل</th>
                            <th className={`${cell} min-w-15`}>
                                {isThirdYear ? 'نتيجة التطور 4' : 'نتيجة التطور 6'}
                            </th>
                            <th className={`${cell} min-w-15`}>ت تصر+ ت تحصي/2</th>
                            <th className={`${cell} min-w-15`}>A/B/C/D/E</th>
                            <th className={`${cell} min-w-15`}>20</th>
                            <th className={`${cell} min-w-15`}>20</th>
                            <th className={`${cell} min-w-15`}>20</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedClassData?.students.map((s, i) => {
                            const saved = tashkhisiData[i];
                            const t2Percent = saved?.percentaget2 ?? 0;
                            const note = (t2Percent / 100) * 20;
                            const resultT2 = saved?.resultT2 ?? 0;
                            const tatawaor = saved?.tatawaor ?? 0;

                            const savedGroupe = groupeData[i];
                            const level = savedGroupe?.levelT2 ?? '';
                            const noteRange = levelToNote(level);

                            const sNote = studentNotes[i] ?? { first: 0, second: 0, groupeNote: noteRange?.default ?? 0 };


                            const gender: Gender = s.gender === 'male' ? 'male' : 'female';
                            const baremeScore = resultT2 > 0 ? getScore(activity, gender, resultT2, isThirdYear) : 0;
                            const tawaorScore = tatawaor > 0 ? getTawaorScore(activity, tatawaor, isThirdYear) : 0;

                            const firstResult = (note + baremeScore + tawaorScore) / 2;
                            const finalResult = (firstResult + sNote.groupeNote) / 2;
                            const isMalade = s.status === 'malade'

                            return (
                                <tr key={i} className="h-6">
                                    <td className={`${cell} bg-blue-200 print:bg-blue-200`}>{i + 1}</td>
                                    <td className={`${cell} bg-amber-100 print:bg-amber-100 text-right whitespace-nowrap px-2`}>{s.name}</td>
                                    {isMalade ? (
                                        <>
                                            {Array.from({ length: 10 }).map((_, k) => (
                                                <td key={k} className={`${cell} text-red-500 `}>اعفاء</td>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            <td className={cell}>{t2Percent.toFixed(1)}</td>
                                            <td className={cell}>{note.toFixed(2)}</td>
                                            <td className={cell}>{resultT2.toFixed(2)}</td>
                                            <td className={cell}>{baremeScore.toFixed(2)}</td>
                                            <td className={cell}>{tatawaor.toFixed(2)}</td>
                                            <td className={cell}>{tawaorScore.toFixed(1)}</td>
                                            <td className={cell}>{firstResult.toFixed(2)}</td>
                                            <td className={cell}>{level || '—'}</td>
                                            <td className={cell}>
                                                {noteRange ? (
                                                    <select
                                                        defaultValue={noteRange.default}
                                                        className={select}
                                                        onChange={e => updateNote(i, 'groupeNote', Number(e.target.value))}>
                                                        {Array.from({ length: noteRange.max - noteRange.min + 1 }, (_, j) => noteRange.min + j).map(n => (
                                                            <option key={n} value={n}>{n}</option>
                                                        ))}
                                                    </select>
                                                ) : '—'}
                                            </td>
                                            <td className={`${cell} text-red-500 font-semibold`}>{finalResult.toFixed(2)}</td>
                                            <td className={cell}>
                                                <input type="text" className={input} />
                                            </td>
                                        </>
                                    )}

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </main>
        </div>
    )
}

export default TakwinTahsili
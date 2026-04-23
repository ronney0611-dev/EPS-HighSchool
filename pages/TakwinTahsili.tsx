'use client'
import { useClasses } from '@/hooks/useClasses';
import { useState } from 'react'
import { loadTashkhisi, loadGroupeData } from '@/hooks/useTachkhisi';

const TakwinTahsili = () => {
    const { classes } = useClasses();
    const [classSlecet, setClassSelect] = useState('');
    const [tashkhisiData, setTashkhisiData] = useState<{ name: string; percentaget2: number; resultT2: number; tatawaor: number }[]>([]);
    const [groupeData, setGroupeData] = useState<{ name: string; levelT2: string }[]>([]);

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
    };

    const isSecondary = ['أولى ثانوي', 'ثانية ثانوي'].includes(selectedClassData?.level || '');

    const cell = 'border border-black px-1 py-[2px]';
    const input = 'w-full border-none outline-none text-center bg-transparent text-xs';

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
                            <th className={`${cell} min-w-15`}>{isSecondary ? 'النقطة 14' : 'النقطة 16'}</th>
                            <th className={`${cell} min-w-15`}>تطور الحاصل</th>
                            <th className={`${cell} min-w-15`}>{isSecondary ? 'نتيجة التطور 6' : 'نتيجة التطور 4'}</th>
                            <th className={`${cell} min-w-15`}>ت تصر+ ت تحصي/2</th>
                            <th className={`${cell} min-w-15`}>A/B/C/D/E</th>
                            <th className={`${cell} min-w-15`}>20</th>
                            <th className={`${cell} min-w-15`}>20</th>
                            <th className={`${cell} min-w-7.5`}>4</th>
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

                            return (
                                <tr key={i} className="h-6">
                                    <td className={`${cell} bg-blue-200 print:bg-blue-200`}>{i + 1}</td>
                                    <td className={`${cell} bg-amber-100 print:bg-amber-100 text-right whitespace-nowrap px-2`}>{s.name}</td>
                                    <td className={cell}>{t2Percent.toFixed(1)}</td>
                                    <td className={cell}>{note.toFixed(2)}</td>
                                    <td className={cell}>{resultT2.toFixed(2)}</td>
                                    <td className={cell}>
                                        <input type="text" className={input} />
                                    </td>
                                    <td className={cell}>{tatawaor.toFixed(2)}</td>
                                    <td className={cell}>
                                        <input type="text" className={input} />
                                    </td>
                                    <td className={cell}>
                                        <input type="text" className={input} />
                                    </td>
                                    <td className={cell}>{level || '—'}</td>
                                    <td className={cell}>
                                        {noteRange ? (
                                            <input
                                                type="number"
                                                defaultValue={noteRange.default}
                                                min={noteRange.min}
                                                max={noteRange.max}
                                                className="w-10 border-none outline-none text-center bg-transparent appearance-none"
                                            />
                                        ) : '—'}
                                    </td>
                                    <td className={cell}>
                                        <input type="text" className={input} />
                                    </td>
                                    <td className={cell}>
                                        <input type="text" className={input} />
                                    </td>
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
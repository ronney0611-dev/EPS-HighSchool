'use client'

import { useState } from "react"
import { useClasses } from "@/hooks/useClasses"
import { useTeacher } from "@/hooks/useTeacher"
import { loadTashkhisi } from "@/hooks/useTachkhisi"
import { saveGroups } from "@/hooks/useGroups"

const ClassPlan = () => {
    const { classes } = useClasses()
    const { teacher } = useTeacher()

    const [selectedClass, setSelectedClass] = useState('')
    const [numberOfGroups, setNumberOfGroups] = useState(2)
    const [mode, setMode] = useState<'random' | 'gender' | 'level'>('random')
    const [genderMix, setGenderMix] = useState<'mixed' | 'separated'>('mixed')
    const [groups, setGroups] = useState<{ leader: string, students: { name: string, gender: string, level?: string }[] }[]>([])

    const selectedClassData = classes.find(c => c.name === selectedClass)
    const students = selectedClassData?.students.filter(s => s.status === 'active') ?? [];
    const maladeStudents = selectedClassData?.students.filter(s => s.status === 'malade') ?? [];

    const groupLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const distribute = () => {
        const tashkhisi = loadTashkhisi(selectedClass);

        const boys = students.filter(s => s.gender === 'male')
        const girls = students.filter(s => s.gender === 'female')

        // attach level from تشخيصي
        const withLevel = (list: typeof students) => list.map(s => {
            const found = tashkhisi?.students.find(t => t.name === s.name)
            return {id: s.id, name: s.name, gender: s.gender, level: found?.resultT2 ? String(found.resultT2) : 'غير محدد' }
        })

        if (mode === 'level') {
            const ranked = withLevel(students).sort((a, b) => (a.level ?? '').localeCompare(b.level ?? ''))
            const newGroups = Array.from({ length: numberOfGroups }, () => ({ leader: '', students: [] as { name: string, gender: string, level?: string }[] }))
            ranked.forEach((s, i) => newGroups[i % numberOfGroups].students.push(s))
            setGroups(newGroups)
        } else if (mode === 'gender' && genderMix === 'separated') {
            const allGroups = []
            const boyGroups = Math.ceil(numberOfGroups / 2)
            const girlGroups = numberOfGroups - boyGroups
            const bList = withLevel(boys)
            const gList = withLevel(girls)
            for (let i = 0; i < boyGroups; i++) allGroups.push({ leader: '', students: bList.filter((_, j) => j % boyGroups === i) })
            for (let i = 0; i < girlGroups; i++) allGroups.push({ leader: '', students: gList.filter((_, j) => j % girlGroups === i) })
            setGroups(allGroups)
        } else {
            // random or mixed gender
            const shuffled = withLevel([...students]).sort(() => Math.random() - 0.5)
            const newGroups = Array.from({ length: numberOfGroups }, () => ({ leader: '', students: [] as { name: string, gender: string, level?: string }[] }))
            shuffled.forEach((s, i) => newGroups[i % numberOfGroups].students.push(s))
            setGroups(newGroups)
        }
    }
    const handlePrint = () => {
        const win = window.open('', '_blank')
        if (!win) return

        const groupsHTML = groups.map((group, i) => `
        <div style="margin-bottom: 20px; border: 1px solid #2563eb; border-radius: 10px; padding: 12px; position: relative;">
            <div style="position: absolute; top: -12px; right: 10px; background: #1e40af; color: white; padding: 2px 10px; border-radius: 8px; font-size: 11px;">
                الفوج ${groupLabels[i]} / القائد: ${group.leader || '—'}
            </div>
            <ul style="margin-top: 16px; padding: 0; list-style: none;">
                ${group.students.map((s, j) => `
                    <li style="color: ${s.gender === 'male' ? '#1d4ed8' : '#db2777'}; font-size: 12px; padding: 2px 0;">
                        ${j + 1}. ${s.name} ${group.leader === s.name ? '⭐' : ''}
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('')

        win.document.write(`
        <html>
        <head>
            <style>
                * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { margin: 0; padding: 8mm; font-family: sans-serif; direction: rtl; background: white; color: black; }
                @page { size: A4 portrait; margin: 8mm; }
            </style>
        </head>
        <body>
            <div style="margin-bottom: 20px; text-align: center; border-bottom: 2px solid #9ca3af; padding-bottom: 10px; margin-bottom: 12px;">
                <h1 style="font-size: 18px; font-weight: bold; margin: 0;">بطاقة تفويج القسم</h1>
            </div>

            <table style="margin-bottom: 20px; width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px;">
                <tr>
                    <td style="border: 1px solid #9ca3af; padding: 6px;">المؤسسة : ${teacher.school || '—'}</td>
                    <td style="border: 1px solid #9ca3af; padding: 6px;">المستوى : ${selectedClassData?.level || '—'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #9ca3af; padding: 6px;">الأستاذ : ${teacher.name || '—'}</td>
                    <td style="border: 1px solid #9ca3af; padding: 6px;">القسم : ${selectedClass || '—'}</td>
                </tr>
            </table>

            <div style=" margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                ${groupsHTML}
            </div>

            <div style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="border: 1px solid #fbbf24; border-radius: 10px; padding: 10px;">
                    <strong>قائمة المعفيين :</strong>
                    <ul>
                           ${maladeStudents.map((s, index) => `<li> ${s.name}</li>`).join('')}
                    </ul>
                </div>
                <div style="border: 1px solid #d97706; border-radius: 10px; padding: 10px; font-size: 12px;">
                    <strong>أسس تقسيم الأفواج :</strong><br/>
                    زمن الحصة والنشاط<br/>
                    العمر الزمني<br/>
                    العمر التشريحي<br/>
                    الجنس<br/>
                    الإمكانيات والاستعدادات البدنية والفنية
                </div>
            </div>
        </body>
        </html>
    `)
        win.document.close()
        win.focus()
        win.print()
        win.close()
    }
    return (
        <div dir="rtl" className="mx-4  lg:mx-20 my-10 flex flex-col gap-6">

            {/* Controls */}
            <div className="flex flex-col bg-white text-black gap-4 border border-gray-300 p-4">

                {/* Class select */}
                <div className="flex gap-4 items-center">
                    <label>القسم :</label>
                    <select className="bg-white border px-2 py-1" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                        <option value="">-- اختر القسم --</option>
                        {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                {/* Number of groups */}
                <div className="flex gap-4 items-center">
                    <label>عدد الأفواج :</label>
                    <select className="bg-white border px-2 py-1" value={numberOfGroups} onChange={e => setNumberOfGroups(Number(e.target.value))}>
                        {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                {/* Mode */}
                <div className="flex gap-4 items-center">
                    <label>طريقة التوزيع :</label>
                    <select className="bg-white border px-2 py-1" value={mode} onChange={e => setMode(e.target.value as 'random' | 'gender' | 'level')}>
                        <option value="random">عشوائي</option>
                        <option value="gender">حسب الجنس</option>
                        <option value="level">حسب المستوى</option>
                    </select>
                </div>

                {/* Gender mix — only show if mode is gender */}
                {mode === 'gender' && (
                    <div className="flex gap-4 items-center">
                        <label>التوزيع :</label>
                        <select className="bg-white border px-2 py-1" value={genderMix} onChange={e => setGenderMix(e.target.value as 'mixed' | 'separated')}>
                            <option value="mixed">مختلط</option>
                            <option value="separated">منفصل</option>
                        </select>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                    <button onClick={distribute} className="bg-blue-800 text-white px-4 py-1 rounded-xl cursor-pointer">توزيع</button>
                    <button onClick={distribute} className="bg-gray-500 text-white px-4 py-1 rounded-xl cursor-pointer">🔀 خلط</button>
                </div>
            </div>

            {/* Groups display */}
            {/* A4 Document */}
            <div id="a4-card" className="bg-white text-black p-6 flex flex-col gap-4 border border-gray-300 shadow-md w-full">
                {/* Header */}
                <div className="text-center border-b-2 border-gray-400 pb-4">
                    <h1 className="text-xl font-bold">بطاقة تفويج القسم</h1>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 border my-4 border-gray-400 text-sm">
                    <div className="border-l border-gray-400 p-2">المؤسسة : {teacher.school || '—'}</div>
                    <div className="p-2">المستوى : {selectedClassData?.level || '—'}</div>
                    <div className="border-t border-l border-gray-400 p-2">الأستاذ : {teacher.name || '—'}</div>
                    <div className="border-t border-gray-400 p-2">القسم : {selectedClass || '—'}</div>
                </div>

                {/* Groups grid */}
                {groups.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-4">
                        {groups.map((group, i) => (
                            <div key={i} className="border border-blue-600 rounded-xl p-3 relative">
                                <div className="absolute -top-3.25 right-3 bg-blue-800 text-white px-3 py-0.5 rounded-lg text-xs">
                                    الفوج {groupLabels[i]} / القائد: {group.leader || '—'}
                                </div>
                                <ul className="mt-4 flex flex-col gap-1">
                                    {group.students.map((s, j) => (
                                        <li key={j} className="flex justify-between items-center text-sm">
                                            <span className={s.gender === 'male' ? 'text-blue-700' : 'text-pink-600'}>
                                                {j + 1}. {s.name} {group.leader === s.name ? '⭐' : ''}
                                            </span>
                                            <div className="flex gap-2 print:hidden">
                                                <button onClick={() => {
                                                    const updated = [...groups]
                                                    updated[i].leader = s.name
                                                    setGroups(updated)
                                                }} className="text-xs bg-yellow-400 px-2 rounded cursor-pointer">قائد</button>
                                                <select className="text-xs border bg-white" onChange={e => {
                                                    const target = Number(e.target.value)
                                                    if (target === i) return
                                                    const updated = [...groups]
                                                    updated[i].students = updated[i].students.filter(st => st.name !== s.name)
                                                    updated[target].students.push(s)
                                                    setGroups([...updated])
                                                }} defaultValue={i}>
                                                    {groups.map((_, idx) => <option key={idx} value={idx}>فوج {idx + 1}</option>)}
                                                </select>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 my-10">اختر القسم وانقر على توزيع</div>
                )}

                {/* Footer sections */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-amber-400 rounded-xl p-4">
                        <h2 className="font-bold mb-2">قائمة المعفيين :</h2>
                        <ul>
                            {
                                maladeStudents.map((s, index) => {
                                    return (
                                        <li key={index} > {index + 1}. {s.name} </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div className="border border-amber-600 rounded-xl p-4 text-sm">
                        <h2 className="font-bold mb-2">أسس تقسيم الأفواج :</h2>
                        <p>زمن الحصة والنشاط</p>
                        <p>العمر الزمني</p>
                        <p>العمر التشريحي</p>
                        <p>الجنس</p>
                        <p>الإمكانيات والاستعدادات البدنية والفنية</p>
                    </div>
                </div>


            </div>

            {/* Print button */}
            <div className="flex justify-center gap-4">
                <button onClick={() => {
                    saveGroups(selectedClass, groups);
                }} className="print:hidden bg-green-700 text-white px-6 py-2 rounded-xl self-center cursor-pointer">
                    حفظ
                </button>
                <button onClick={handlePrint} className="print:hidden bg-green-700 text-white px-6 py-2 rounded-xl self-center cursor-pointer">
                    🖨️ طباعة
                </button>
            </div>
        </div>
    )
}

export default ClassPlan

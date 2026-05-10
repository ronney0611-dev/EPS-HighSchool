'use client'
import { useClasses, Class } from '@/hooks/useClasses'
import { useState } from 'react'
import * as XLSX from 'xlsx'

type Props = {
    classes?: Class[]
    setClasses?: (classes: Class[]) => void
}

const ManageClasses = ({ classes: classesProp, setClasses: setClassesProp }: Props) => {
    const { classes: classesHook, setClasses: setClassesHook } = useClasses();
    const [classInput, setClassInput] = useState('');
    const classes = classesProp ?? classesHook
    const setClasses = setClassesProp ?? setClassesHook
    const [expandedClass, setExpandedClass] = useState<number | null>(null);
    const [studentInput, setStudentInput] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male')
    const [status, setStatus] = useState<'active' | 'malade' | 'special'>('active');

    const getLevel = (name: string) => {
        if (name.startsWith('1')) return 'أولى ثانوي'
        if (name.startsWith('2')) return 'ثانية ثانوي'
        if (name.startsWith('3')) return 'ثالثة ثانوي'
        return ''
    }

    const addClass = () => {
        if (!classInput.trim()) return
        setClasses([...classes, { name: classInput, level: getLevel(classInput), students: [] }])
        setClassInput("")
    }

    const addStudent = () => {
        if (expandedClass === null || !studentInput.trim()) return
        const updated = classes.map((c, i) =>
            i === expandedClass
                ? { ...c, students: [...c.students, { name: studentInput.trim(), gender, status, id: crypto.randomUUID() }] }
                : c
        )
        setClasses(updated)
        setStudentInput('')
    }

    const updateStudent = (classIndex: number, studentIndex: number, field: 'gender' | 'status', value: string) => {
        const updated = classes.map((c, i) =>
            i === classIndex
                ? { ...c, students: c.students.map((s, j) => j === studentIndex ? { ...s, [field]: value } : s) }
                : c
        )
        setClasses(updated)
    }

    const deleteClass = (classIndex: number) => {
        setClasses(classes.filter((_, i) => i !== classIndex))
        if (expandedClass === classIndex) setExpandedClass(null)
    }

    const deleteStudent = (classIndex: number, studentIndex: number) => {
        const updated = classes.map((c, i) =>
            i === classIndex
                ? { ...c, students: c.students.filter((_, j) => j !== studentIndex) }
                : c
        )
        setClasses(updated)
    }

    return (
        <div dir="rtl" className='px-4 my-8 w-full flex flex-col'>
            {/* Add Class */}
            <div className='flex text-white flex-wrap justify-center items-center gap-2 mb-6'>
                <input
                    type="text"
                    value={classInput}
                    onChange={(e) => setClassInput(e.target.value)}
                    placeholder="اسم القسم"
                    className='border p-2 rounded text-white'
                />
                <button onClick={addClass} className='bg-blue-500 text-white px-4 py-2 rounded'>إضافة قسم</button>
            </div>

            {/* Classes list */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 '>
                {classes.map((c, i) => (
                    <div key={i} className='bg-white text-black border border-gray-400 '>

                        {/* header */}
                        <div
                            onClick={() => setExpandedClass(expandedClass === i ? null : i)}
                            className='flex justify-between items-center p-2 cursor-pointer'>
                            <h2 className='font-bold text-lg bg-blue-500 text-white rounded py-1 flex-1 text-center'>{c.name}</h2>
                            <button
                                onClick={e => { e.stopPropagation(); deleteClass(i) }}
                                className='text-red-600 font-bold px-2 text-xl'>✕</button>
                        </div>

                        {/* expanded content */}
                        {expandedClass === i && (
                            <div className='p-2'>
                                <ul className='flex flex-col gap-1'>
                                    {c.students.map((s, j) => (
                                        <li key={j}
                                            className={`flex flex-wrap items-center gap-1 px-1 py-1 rounded text-xs
                                                ${s.status === 'malade' ? 'bg-red-300' :
                                                    s.status === 'special' ? 'bg-yellow-300' :
                                                        s.gender === 'female' ? 'bg-pink-200' : 'bg-blue-200'}`}>
                                            <span className='border border-black rounded px-1 font-bold min-w-6 text-center'>{j + 1}</span>
                                            <span className='flex-1'>{s.name}</span>
                                            <select
                                                className='border border-gray-400 rounded text-xs px-1 py-0.5 bg-white'
                                                value={s.gender}
                                                onChange={e => { e.stopPropagation(); updateStudent(i, j, 'gender', e.target.value) }}>
                                                <option value="male">ذكر</option>
                                                <option value="female">أنثى</option>
                                            </select>
                                            <select
                                                className='border border-gray-400 rounded text-xs px-1 py-0.5 bg-white'
                                                value={s.status}
                                                onChange={e => { e.stopPropagation(); updateStudent(i, j, 'status', e.target.value) }}>
                                                <option value="active">عادي</option>
                                                <option value="malade">اعفاء</option>
                                                <option value="special">حالة شاذة</option>
                                            </select>
                                            <button
                                                onClick={e => { e.stopPropagation(); deleteStudent(i, j) }}
                                                className='text-red-600 font-bold px-1'>✕</button>
                                        </li>
                                    ))}
                                </ul>

                                {/* Add Student */}
                                <div className='flex flex-col gap-2 mt-4'>
                                    <input
                                        type="text"
                                        value={studentInput}
                                        onChange={(e) => setStudentInput(e.target.value)}
                                        placeholder="اسم التلميذ"
                                        className='border border-gray-400 w-full p-2 rounded text-black'
                                    />
                                    <div className='flex gap-2'>
                                        <select
                                            className='border border-gray-400 rounded px-2 py-1 bg-white text-black flex-1'
                                            value={gender}
                                            onChange={e => setGender(e.target.value as 'male' | 'female')}>
                                            <option value="male">ذكر</option>
                                            <option value="female">أنثى</option>
                                        </select>
                                        <select
                                            className='border border-gray-400 rounded px-2 py-1 bg-white text-black flex-1'
                                            value={status}
                                            onChange={e => setStatus(e.target.value as 'active' | 'malade' | 'special')}>
                                            <option value="active">عادي</option>
                                            <option value="malade">اعفاء</option>
                                            <option value="special">حالة شاذة</option>
                                        </select>
                                    </div>
                                    <button onClick={addStudent} className='bg-green-500 text-white px-4 py-2 rounded'>إضافة تلميذ</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ManageClasses
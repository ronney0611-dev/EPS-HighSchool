'use client'
import { useClasses } from '@/hooks/useClasses'
import { useState } from 'react'

const ManageClasses = () => {
    const { classes, setClasses } = useClasses();
    const [classInput, setClassInput] = useState('');
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [studentInput, setStudentInput] = useState('');

    const addClass = () => {
        if (!classInput.trim()) return
        setClasses([...classes, { name: classInput, students: [] }]) // add new class
        setClassInput("") // clear input
    }
    const addStudent = () => {
        if (selectedClass === null || !studentInput.trim()) return
        const updated = classes.map((c, i) =>
            i === selectedClass
                ? { ...c, students: [...c.students, studentInput.trim()] }
                : c
        )
        setClasses(updated)
        setStudentInput('')
    }
    return (
        <div dir="rtl" className='p-8 w-full flex flex-col'>
            {/* Add Class */}
            <div className='flex flex-wrap justify-center items-center gap-2 mb-6'>
                <input
                    type="text"
                    value={classInput}
                    onChange={(e) => setClassInput(e.target.value)}
                    placeholder="اسم القسم"
                    className='border p-2 rounded'
                />
                <button onClick={addClass} className='bg-blue-500 text-white px-4 py-2 rounded'>إضافة قسم</button>
            </div>

            {/* Classes list */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {classes.map((c, i) => (
                    <div key={i}
                        onClick={() => setSelectedClass(i)}
                        className={` bg-gray-200 text-black border p-4 rounded cursor-pointer ${selectedClass === i ? 'border-blue-500' : 'border-gray-400'}`}>
                        <h2 className='font-bold text-2xl text-center bg-gray-500 text-white rounded-2xl py-2 mb-2'>{c.name}</h2>
                        <ul className='text-black text-sm grid gap-0.5 grid-cols-2'>
                            {c.students.map((s, j) => (
                                <li key={j} className='flex border border-black'>
                                    <span className='border-l border-black p-2 font-semibold w-8 text-center'>{j + 1}</span>
                                    <span className='p-2'>{s}</span>
                                </li>
                            ))}
                        </ul>
                        {/* Add Student */}
                        {selectedClass === i && (
                            <div className='flex flex-col gap-2 mt-6'>
                                <input
                                    type="text"
                                    value={studentInput}
                                    onChange={(e) => setStudentInput(e.target.value)}
                                    placeholder="اسم التلميذ"
                                    className='border border-gray-400 w-40 lg:w-full p-2 rounded text-black'
                                />
                                <button onClick={addStudent} className='bg-green-500 text-white px-4 py-2 rounded'>إضافة تلميذ</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>


        </div>
    )
}

export default ManageClasses

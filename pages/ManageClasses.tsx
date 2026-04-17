'use client'
import { useClasses } from '@/hooks/useClasses'
import { useState } from 'react'

const ManageClasses = () => {
    const { classes, setClasses } = useClasses();
    const [classInput, setClassInput] = useState('');
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [studentInput, setStudentInput] = useState('');

    const addClass  = () => {
        if (!classInput.trim()) return
        setClasses([...classes, { name: classInput, students: [] }]) // add new class
        setClassInput("") // clear input
    }
    const addStudent = () => {
        if (selectedClass === null || !studentInput.trim()) return
        const updated = [...classes]
        updated[selectedClass].students.push(studentInput.trim())
        setClasses(updated)
        setStudentInput('')
    }
    return (
        <div dir="rtl" className='p-8'>
            {/* Add Class */}
            <div className='flex gap-2 mb-6'>
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
            <div className='flex gap-4 flex-wrap'>
                {classes.map((c, i) => (
                    <div key={i}
                        onClick={() => setSelectedClass(i)}
                        className={`border p-4 rounded cursor-pointer ${selectedClass === i ? 'border-blue-500' : 'border-gray-400'}`}>
                        <h2 className='font-bold mb-2'>{c.name}</h2>
                        <ul>
                            {c.students.map((s, j) => <li key={j}>{s}</li>)}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Add Student */}
            {selectedClass !== null && (
                <div className='flex gap-2 mt-6'>
                    <input
                        type="text"
                        value={studentInput}
                        onChange={(e) => setStudentInput(e.target.value)}
                        placeholder="اسم التلميذ"
                        className='border p-2 rounded'
                    />
                    <button onClick={addStudent} className='bg-green-500 text-white px-4 py-2 rounded'>إضافة تلميذ</button>
                </div>
            )}
        </div>
    )
}

export default ManageClasses

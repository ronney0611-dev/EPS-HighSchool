'use client'

import { useState } from "react"


const ClassPlan = () => {

    const [numberOfGroups, setNumberOfGroups] = useState(2);
    const [groups, setGroups] = useState<{
        leader: string,
        students: string[]
    }[]>(Array.from({ length: numberOfGroups }, () => ({ leader: '', students: [] })));
    const [newStudents, setNewStudents] = useState<string[]>(Array(numberOfGroups).fill(''));
    const [info, setInfo] = useState({
        school: '',
        teacher: '',
        calss: ''
    });

    const updateLeader = (groupIndex: number, value: string) => {
        const newGroups = [...groups];
        newGroups[groupIndex] = { ...newGroups[groupIndex], leader: value };
        setGroups(newGroups);
    }
    const addStudent = (groupIndex: number, name: string) => {
        const newGroups = [...groups];
        newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            students: [...newGroups[groupIndex].students, name]
        };
        setGroups(newGroups);
    }

    return (
        <div dir="rtl" className=' lg:mx-20 mx-4 my-10'>
            {/* input section */}
            <div className='flex flex-col gap-2 my-8' >
                <div className='flex flex-col gap-2 p-4 border border-gray-300'>
                    <div className="flex gap-4">
                        <label htmlFor="">الثانوية :</label>
                        <input className="px-2" onChange={e => setInfo({ ...info, school: e.target.value })} type="text" placeholder='ادخل اسم الثانوية' />
                    </div>
                    <div className="flex gap-4">
                        <label htmlFor="">الاستاذ :</label>
                        <input className="px-2" onChange={e => setInfo({ ...info, teacher: e.target.value })} type="text" placeholder='ادخل اسم الاستاذ' />
                    </div>
                    <div className="flex gap-4">
                        <label htmlFor="">القسم :</label>
                        <input className="px-2" onChange={e => setInfo({ ...info, calss: e.target.value })} type="text" placeholder='ادخل القسم' />
                    </div>
                </div>
                <div className="flex gap-6 my-4 border border-gray-200 p-4" >
                    <h1>اختر عدد الافواج :</h1>
                    <select className="pr-4 bg-white text-black cursor-pointer" name="" id="" onChange={e => {
                        const n = Number(e.target.value);
                        setNumberOfGroups(n);
                        setGroups(Array.from({ length: n }, () => ({ leader: '', students: [] })));
                    }}>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>
                <div className=" lg:grid lg:grid-cols-3 flex flex-col gap-2 " >
                    {Array.from({ length: numberOfGroups }, (_, i) => {
                        return (
                            <div key={i} className='flex flex-col gap-2 p-4 border border-gray-300'>
                                <h1 className="text-lg font-semibold my-2" >الفوج</h1>
                                <div className="flex gap-4">
                                    <label htmlFor="">قائد الفوج :</label>
                                    <input className="px-2 lg:w-40" onChange={e => updateLeader(i, e.target.value)} type="text" placeholder='اكتب اسم قائد الفوج' />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-2">
                                        <label htmlFor="">اعضاء الفوج :</label>
                                        <input className=" px-2 lg:w-40" type="text" value={newStudents[i] || ''} onChange={e => {
                                            const updated = [...newStudents];
                                            updated[i] = e.target.value;
                                            setNewStudents(updated);
                                        }} placeholder='ادخل اسم التلميذ' />
                                    </div>

                                    <button
                                        className="bg-red-900 py-1 px-2 rounded-2xl cursor-pointer"
                                        onClick={() => {
                                            addStudent(i, newStudents[i]);
                                            const updated = [...newStudents];
                                            updated[i] = '';
                                            setNewStudents(updated);
                                        }}>ادخل</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* how it look */}
            <div className='bg-white text-black p-6 lg:pt-20 flex flex-col min-h-full '>
                <div className='p-6 m-2 border border-blue-300'>
                    <p className="text-blue-800 font-semibold text-lg flex gap-2 items-center">الثانوية : <span className="text-black text-sm">{info.school}</span> </p>
                    <p className="text-blue-800 font-semibold text-lg flex gap-2 items-center">الاستاذ : <span className="text-sm text-black">{info.teacher}</span></p>
                    <p className=" text-blue-800 font-semibold text-lg flex gap-2 items-center">القسم : <span className="text-sm text-black">{info.calss}</span></p>
                </div>
                <div className='flex flex-col gap-10 mt-2 text-black p-6 ' >
                    <div className="grid lg:grid-cols-2 gap-10 my-10" >
                        {Array.from({ length: numberOfGroups }, (_, i) => {
                            return (
                                <div key={i} className='border border-blue-600 px-2 py-6 relative rounded-xl'>
                                    <div className=' flex border rounded-lg bg-blue-800 text-white absolute top-[-16] right-2 py-1 px-4' >
                                        القائد:  {groups[i].leader}
                                    </div>
                                    <ul className="grid lg:grid-cols-2 px-2">
                                        {groups[i].students.map((student, index) => (
                                            <li key={index}> <span className="text-4xl rounded-full mx-1 text-blue-700">.</span> {student}</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                    <div className='grid lg:grid-cols-2 md:grid-rows-2 gap-6 px-6'>
                        <div className='bg-amber-200 p-4 flex flex-col'>
                            <h1 className="text-lg font-bold my-2"> قائمة المعفيين :</h1>
                        </div>
                        <div className='bg-amber-400 p-4 flex flex-col'>
                            <h1 className="text-lg font-bold my-2">أسس تقسيم الافواد :</h1>
                            <p>زمن الحصة والنشاط</p>
                            <p>العمر الزمني </p>
                            <p>العمر التشريحي</p>
                            <p>الجنس</p>
                            <p>الامكانيات والاستعدادات البدنية والفنية</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default ClassPlan
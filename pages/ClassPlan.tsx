'use client'

import { useState } from "react"


const ClassPlan = () => {

    const [numberOfGroups, setNumberOfGroups] = useState(2);
    const [groups, setGroups] = useState<{
        leader: string,
        students: string[]
    }[]>(Array.from({ length: numberOfGroups }, () => ({ leader: '', students: [] })));
    const [newStudents, setNewStudents] = useState<string[]>(Array(numberOfGroups).fill(''));

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
        <div className='lg:mx-10 mx-4 my-8' >
            {/* input section */}
            <div className='flex flex-col gap-2' >
                <div>
                    <select name="" id="" onChange={e => {
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
                <div className="lg:grid lg:grid-cols-4 flex flex-col gap-2 " >
                    {Array.from({ length: numberOfGroups }, (_, i) => {
                        return (
                            <div key={i} className='flex flex-col gap-2 p-4 border border-gray-300'>
                                <h1>Groupe</h1>
                                <div>
                                    <label htmlFor="">leader :</label>
                                    <input onChange={e => updateLeader(i, e.target.value)} type="text" placeholder='Groupe leader' />
                                    <button>add</button>
                                </div>
                                <div>
                                    <label htmlFor="">Groupe:</label>

                                    <input type="text" value={newStudents[i] || ''} onChange={e => {
                                        const updated = [...newStudents];
                                        updated[i] = e.target.value;
                                        setNewStudents(updated);
                                    }} placeholder='teh team' />

                                    <button onClick={() => {
                                        addStudent(i, newStudents[i]);
                                        const updated = [...newStudents];
                                        updated[i] = '';
                                        setNewStudents(updated);

                                    }}>add</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* how it look */}
            <div className='bg-white text-black py-6 my-10'>
                <div className='px-6 pt-2 my-2'>
                    <p>Teacher Name : benhammada mohammed</p>
                    <p>Class: 3ln2</p>
                </div>
                <div className='flex flex-col gap-10 my-2 text-black p-6' >
                    <div className="grid grid-cols-2 gap-10 " >
                        {Array.from({ length: numberOfGroups }, (_, i) => {
                            return (
                                <div key={i} className='border border-blue-600 px-2 py-6 relative'>
                                    <div className='border rounded-lg bg-blue-800 text-white absolute top-[-16] left-4 py-1 px-4' >
                                        Leader: {groups[i].leader}
                                    </div>
                                    <ul>
                                        {groups[i].students.map((student, index) => (
                                            <li key={index}>{student}</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                    <div className='grid lg:grid-cols-2 md:grid-rows-2 gap-6 px-6'>
                        <div className='bg-amber-400 p-4'>
                            <h1>Title Shite</h1>
                            <p>heloo</p>
                            <p>heloo</p>
                            <p>heloo</p>
                            <p>heloo</p>
                        </div>
                        <div className='bg-amber-400 p-4'>
                            <h1>Title Shite</h1>
                            <p>heloo</p>
                            <p>heloo</p>
                            <p>heloo</p>
                            <p>heloo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default ClassPlan
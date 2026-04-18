'use client'

import { useClasses } from "@/hooks/useClasses";
import React, { useState } from "react"

const TakwimTshTable = () => {
    const { classes, setClasses } = useClasses();
    const [mochir, setMochir] = useState(4);
    const [students, setStudents] = useState<{ name: string, result: { t1: number, t2: number }, score: { t1: number, t2: number }[] }[]>([]);

    const [classSelect, setClassSelect] = useState('');
    const selectedClassData = classes.find(c => c.name === classSelect);

    //add student
    {/*
        const addStudent = () => {
        setStudents([...students, {
            name: newName,
            score: Array.from({ length: mochir }, () => ({ t1: 0, t2: 0 })) //creat a new array with lenght of mochir and fill it with value=0
        }]);
        setNewName('');
    }
         */}


    const handleClassSelect = (className: string) => {
        setClassSelect(className);
        const found = classes.find(c => c.name === className);
        if (found) {
            setStudents(found.students.map(name => ({
                name,
                score: Array.from({ length: mochir }, () => ({ t1: 0, t2: 0 })),
                result: { t1: 0, t2: 0 }
            })));
        }
    }

    const updateResult = (studentIndex: number, attempt: string, value: number) => {
        const updated = students.map((s, i) =>
            i === studentIndex ? { ...s, result: { ...s.result, [attempt]: value } } : s
        )
        setStudents(updated)
    }

    //update the score for student
    const updateScore = (studentIndex: number, scoreIndex: number, attempt: string, value: number) => {
        const newStudents = [...students]; //copy the students array
        const newStudentScore = [...newStudents[studentIndex].score]; //copy the spsfic student score
        newStudentScore[scoreIndex] = { ...newStudentScore[scoreIndex], [attempt]: value }
        newStudents[studentIndex] = { ...newStudents[studentIndex], score: newStudentScore } //put the updated scores back into the student
        setStudents(newStudents); // update the state
        console.log(students)
    }

    {/* const totalResult1 = students.reduce((acc, student)=> {
        return(
            (acc + student.score.reduce((a, b)=> a + b.t1, 0 ))  
        )
    },0 );

    const averageT1 = students.length === 0
    ?0
    : totalResult1 / students.length; */} //this calculate all t1 score 

    const totalT2PerMochir = Array.from({ length: mochir }, (_, i) => {
        const total = students.reduce((acc, student) => {
            return acc + (student.score[i]?.t2 ?? 0);
        }, 0);
        return students.length === 0 ? 0 : total / students.length;
    });
    const totalT1PerMochir = Array.from({ length: mochir }, (_, i) => {
        const total = students.reduce((acc, student) => {
            return acc + (student.score[i]?.t1 ?? 0);
        }, 0);
        return students.length === 0 ? 0 : total / students.length;
    });

    return (
        <section dir="rtl" className="mb-10 mx-10 bg-white text-black ">
            {/* المؤشر handler*/}
            <div className="flex border border-black px-2 gap-6 mx-4 bg-amber-100" >
                <div className="flex gap-4 border-l" >
                    <p>عدد المؤشرات</p>
                    <select disabled={students.length > 0} className="mx-2 p-1 bg-white text-center border-none pr-2" name="" id="" onChange={e => setMochir(Number(e.target.value))} >
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                    </select>
                </div>
                {/* class select */}
                <div className='flex gap-2'>
                    <label htmlFor="">اختر القسم</label>
                    <select className='text-center py-1 px-4 bg-white' name="" id="" onChange={e => handleClassSelect(e.target.value)}>
                        {
                            classes.map((c, i) => {
                                return (
                                    <option key={i} value={c.name}> {c.name} </option>
                                )
                            })}
                    </select>
                </div>

            </div>
            <div className="overflow-x-auto  p-4">
                <table className="w-full border-collapse border border-black text-center" >
                    <thead className="border border-black bg-blue-200" >
                        <tr className="border border-black">
                            <th className="border border-black" >Nmbr</th>
                            <th className="border border-black">الاسم واللقب</th>
                            {Array(mochir).fill(0).map((_, i) => (
                                <th className="border border-black" key={i} colSpan={2}>مؤشر {i + 1}</th>
                            ))}
                            <th className="border border-black" colSpan={3}>النسبة المئوية</th>
                            <th className="border border-black" colSpan={3}>النتيجة الفردية</th>
                            <th className="border border-black" colSpan={2}>المستوى</th>
                        </tr>
                    </thead>
                    <tbody className="border border-black" >
                        <tr className="border border-black bg-amber-100">
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
                            <td className="border border-black">ت1- ت2%</td>
                            <td className="border border-black">ت1</td>
                            <td className="border border-black">ت2</td>
                            <td className="border border-black">ت1- ت2</td>
                            <td className="border border-black">ت1</td>
                            <td className="border border-black">ت2</td>
                        </tr>
                        {
                            students.map((student, studentIndex) => {
                                const percentaget1 = (Object.values(student.score).reduce((a, b) => a + b.t1, 0) / mochir) * 100
                                const percentaget2 = (Object.values(student.score).reduce((a, b) => a + b.t2, 0) / mochir) * 100
                                const t2_t1 = (percentaget2 - percentaget1);
                                return (
                                    <tr className="border border-black " key={studentIndex}>
                                        <td className="border border-black bg-amber-100">{studentIndex + 1}</td>
                                        <td className="border border-black bg-blue-200">{student.name}</td>
                                        {
                                            student.score.map((sc, scoreIndex) => (
                                                <React.Fragment key={scoreIndex}>
                                                    <td className="border border-black w-2 ">
                                                        <select className="border-none outline-none appearance-none bg-transparent w-10" onChange={e => updateScore(studentIndex, scoreIndex, 't1', Number(e.target.value))}>
                                                            <option className="" value="0">0</option>
                                                            <option value="1">1</option>
                                                        </select>
                                                    </td>
                                                    <td className="border border-black w-2">
                                                        <select className="border-none outline-none appearance-none bg-transparent w-10" onChange={e => updateScore(studentIndex, scoreIndex, 't2', Number(e.target.value))}>
                                                            <option value="0">0</option>
                                                            <option value="1">1</option>
                                                        </select>
                                                    </td>
                                                </React.Fragment>
                                            ))
                                        }
                                        <td className="border border-black w-12">{percentaget1.toFixed(2)}</td>
                                        <td className="border border-black w-12">{percentaget2.toFixed(2)}</td>
                                        <td className="border border-black w-16"> {t2_t1.toFixed(2)}</td>
                                        <td className="border border-black w-14">
                                            <input type="number" className="w-full border-none outline-none text-center bg-transparent appearance-none"
                                                onChange={e => updateResult(studentIndex, 't1', Number(e.target.value))} />
                                        </td>
                                        <td className="border border-black w-14">
                                            <input type="number" className="w-full border-none outline-none text-center bg-transparent appearance-none"
                                                onChange={e => updateResult(studentIndex, 't2', Number(e.target.value))} />
                                        </td>
                                        <td className="border border-black w-16">{(student.result.t1 - student.result.t2).toFixed(2)}</td>
                                        <td className="border border-black items-center">
                                            <select name="" id="" className="border-none w-6 outline-none appearance-none bg-transparent">
                                                <option value="">.</option>
                                                <option value="">A</option>
                                                <option value="">B</option>
                                                <option value="">C</option>
                                                <option value="">D</option>
                                                <option value="">E</option>
                                            </select></td>
                                        <td className="border border-black items-center">
                                            <select name="" id="" className="border-none w-6 outline-none appearance-none bg-transparent">
                                                <option value="">.</option>
                                                <option value="">A</option>
                                                <option value="">B</option>
                                                <option value="">C</option>
                                                <option value="">D</option>
                                                <option value="">E</option>
                                            </select>
                                        </td>
                                    </tr>
                                )
                            })
                        }

                        <tr>
                            <td className="border border-black bg-amber-100"></td>
                            <td className="border border-black bg-blue-200">النتيجة الجماعية</td>
                            {totalT1PerMochir.map((value, i) => (
                                <React.Fragment key={i}>
                                    {/* T1 */}
                                    <td className="border border-black bg-blue-200">{value.toFixed(2)}</td>
                                    {/*T2 */}
                                    <td className="border border-black bg-blue-200">{totalT2PerMochir[i].toFixed(2)}</td>
                                </React.Fragment>
                            ))}
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                        </tr>

                        <tr>
                            <td className="border border-black bg-amber-100"></td>
                            <td className="border border-black bg-blue-200">النسبة %</td>
                            {totalT1PerMochir.map((value, i) => (
                                <React.Fragment key={i}>
                                    {/* T1 */}
                                    <td className="border border-black bg-blue-200">{(value * 100).toFixed(2)}</td>
                                    {/*T2 */}
                                    <td className="border border-black bg-blue-200">{(totalT2PerMochir[i] * 100).toFixed(2)}</td>
                                </React.Fragment>
                            ))}
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section >
    )
}

export default TakwimTshTable

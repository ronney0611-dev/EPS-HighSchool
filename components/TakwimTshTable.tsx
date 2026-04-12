'use client'

import React, { useState } from "react"

const TakwimTshTable = () => {

    const [mochir, setMochir] = useState(4);
    const [newName, setNewName] = useState('');
    const [students, setStudents] = useState<{ name: string, score: { t1: number, t2: number }[] }[]>([]);

    //add student
    const addStudent = () => {
        setStudents([...students, {
            name: newName,
            score: Array.from({ length: mochir }, () => ({ t1: 0, t2: 0 })) //creat a new array with lenght of mochir and fill it with value=0
        }]);
        setNewName('');
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
        <section dir="rtl" className="mb-10 mx-10  ">
            {/* المؤشر handler*/}
            <div className="flex border px-2 py-1 gap-6 " >
                <div className="flex gap-4 border-l" >
                    <p>عدد المؤشرات</p>
                    <select disabled={students.length > 0} className="mx-2 p-1 text-center border-none pr-2" name="" id="" onChange={e => setMochir(Number(e.target.value))} >
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                    </select>
                </div>
                {/* students handler */}
                <div className=" flex gap-4" >
                    <input type="text" placeholder="studente name" value={newName} onChange={e => setNewName(e.target.value)} />
                    <button onClick={addStudent} >Add Student</button>
                </div>
            </div>
            <table className="w-full border-collapse border" >
                <thead className="border" >
                    <tr className="border">
                        <th className="border" >Nmbr</th>
                        <th className="border">الاسم واللقب</th>
                        {Array(mochir).fill(0).map((_, i) => (
                            <th className="border" key={i} colSpan={2}>مؤشر {i + 1}</th>
                        ))}
                        <th className="border" colSpan={3}>النسبة المئوية</th>
                        <th className="border" colSpan={3}>النتيجة الفردية</th>
                        <th className="border" colSpan={2}>المستوى</th>
                    </tr>
                </thead>
                <tbody className="border" >
                    <tr className="border">
                        <td className="border"></td>
                        <td className="border"></td>
                        {Array(mochir).fill(0).map((_, i) => (
                            <React.Fragment key={i}>
                                <td className="border">ت1</td>
                                <td className="border">ت2</td>
                            </React.Fragment>
                        ))}
                        <td className="border">ت1</td>
                        <td className="border">ت2</td>
                        <td className="border">ت1- ت2</td>
                        <td className="border">ت1</td>
                        <td className="border">ت2</td>
                        <td className="border">ت1- ت2</td>
                        <td className="border">ت1</td>
                        <td className="border">ت2</td>
                    </tr>
                    {
                        students.map((student, studentIndex) => {
                            const percentaget1 = (Object.values(student.score).reduce((a, b) => a + b.t1, 0) / mochir) * 100
                            const percentaget2 = (Object.values(student.score).reduce((a, b) => a + b.t2, 0) / mochir) * 100
                            const t2_t1 = (percentaget2 - percentaget1);
                            return (
                                <tr className="border" key={studentIndex}>
                                    <td className="border">{studentIndex + 1}</td>
                                    <td className="border">{student.name}</td>
                                    {
                                        student.score.map((sc, scoreIndex) => (
                                            <React.Fragment key={scoreIndex}>
                                                <td className="border">
                                                    <select onChange={e => updateScore(studentIndex, scoreIndex, 't1', Number(e.target.value))}>
                                                        <option value="0">0</option>
                                                        <option value="1">1</option>
                                                    </select>
                                                </td>
                                                <td className="border">
                                                    <select onChange={e => updateScore(studentIndex, scoreIndex, 't2', Number(e.target.value))}>
                                                        <option value="0">0</option>
                                                        <option value="1">1</option>
                                                    </select>
                                                </td>
                                            </React.Fragment>
                                        ))
                                    }
                                    <td className="border">{percentaget1.toFixed(2)}%</td>
                                    <td className="border">{percentaget2.toFixed(2)}%</td>
                                    <td className="border"> {t2_t1.toFixed(2)}%</td>
                                    <td className="border"></td><td className="border"></td><td className="border"></td>
                                    <td className="border"></td><td className="border"></td>
                                </tr>
                            )
                        })
                    }

                    <tr>
                        <td className="border"></td>
                        <td className="border">النتيجة الجماعية</td>
                        {totalT1PerMochir.map((value, i) => (
                            <React.Fragment key={i}>
                                {/* T1 */}
                                <td className="border">{value.toFixed(2)}</td>
                                {/*T2 */}
                                <td className="border">{totalT2PerMochir[i].toFixed(2)}</td>
                            </React.Fragment>
                        ))}
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                    </tr>

                    <tr>
                        <td className="border"></td>
                        <td className="border">النسبة %</td>
                        {totalT1PerMochir.map((value, i) => (
                            <React.Fragment key={i}>
                                {/* T1 */}
                                <td className="border">{(value * 100).toFixed(2)}%</td>
                                {/*T2 */}
                                <td className="border">{(totalT2PerMochir[i] * 100).toFixed(2)}%</td>
                            </React.Fragment>
                        ))}
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border"></td>
                    </tr>
                </tbody>
            </table>
        </section>
    )
}

export default TakwimTshTable

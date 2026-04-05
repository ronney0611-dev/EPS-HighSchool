'use client'

import { useState } from "react"

const TakwimTshTable = () => {

    const [mochir, setMochir] = useState(3);
    const [newName, setNewName] = useState('');
    const [students, setStudents] = useState([]);

    //add student
    const addStudent = () => {
        setStudents([...students, {
            name: newName,
            score: Array(mochir).fill(0) //creat a new array with lenght of mochir and fill it with value=0
        }]);
        setNewName('');
    }

    //update the score for student
    const updateScore = (studentIndex, scoreIndex, value)=>{
        let newStudents = [...students]; //copy the students array
        let newStudentScore = [...newStudents[studentIndex].score]; //copy the spsfic student score
        newStudentScore[scoreIndex] = value; //update the specific score
        newStudents[studentIndex] = {...newStudents[studentIndex], score: newStudentScore} //put the updated scores back into the student
        setStudents(newStudents); // update the state
        console.log(students)
    }

    return (
        <section>
            {/* المؤشر handler*/}
            <div>
                <select name="" id="" onChange={e => setMochir(Number(e.target.value))} >
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>
            {/* students handler */}
            <div>
                <input type="text" placeholder="studente name" value={newName} onChange={e => setNewName(e.target.value)} />
                <button onClick={addStudent} >Add Student</button>
            </div>
            <div>
                {
                    students.map((student,studentIndex) => {
                        const percentage = (student.score.reduce((a, b) => a + b, 0) / mochir) * 100
                        return (
                            <div key={studentIndex}>
                                <p>{student.name}</p>
                                {
                                    student.score.map((sc,scoreIndex)=>{
                                        return(
                                            <div key={scoreIndex}>
                                                <select name="" id="" onChange={e => updateScore(studentIndex, scoreIndex, Number(e.target.value))} >
                                                    <option value="0">0</option>
                                                    <option value="1">1</option>
                                                </select>
                                                
                                            </div>
                                        )
                                    })
                                }
                                <p>{percentage}%</p>
                            </div>
                        )
                    })
                }
            </div>
        </section>
    )
}

export default TakwimTshTable

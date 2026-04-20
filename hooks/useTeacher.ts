import { useEffect, useState } from "react"

export type Teacher = {
    name: string, school: string, nationality: string,
    birthday: string, birthloc: string, statu: string,
    email: string, phone: string, univerLic: string,
    anneLic: string, univerMas: string, anneMas: string,
    photo: string,
}

const defaultTeacher: Teacher = {
    name: '', school: '', nationality: '',
    birthday: '', birthloc: '', statu: '',
    email: '', phone: '', univerLic: '',
    anneLic: '', univerMas: '', anneMas: '',
    photo: '',
}

export const useTeacher = () => {
    const [teacher, setTeacher] = useState<Teacher>(() => {
        if (typeof window === 'undefined') return defaultTeacher
        const saved = localStorage.getItem('teacher')
        return saved ? JSON.parse(saved) : defaultTeacher
    })

    useEffect(() => {
        localStorage.setItem('teacher', JSON.stringify(teacher))
    }, [teacher])

    return { teacher, setTeacher }
}
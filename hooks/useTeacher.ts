'use client'

import axios from "axios"
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
    const [teacher , setTeacher] = useState<Teacher>(defaultTeacher);
    const [loading, setLoading] = useState(false);

    const fetchTeacher = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/teacher');
            const photo = localStorage.getItem('teacher-photo') || ''
            setTeacher({ ...response.data.teacher, photo })
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTeacher();
    }, []);

    const updateTeacher = async (data: Partial<Teacher>) => {
        try {
            const { photo, ...rest } = data;
            const response = await axios.patch('/api/teacher', rest);
            if (photo) localStorage.setItem('teacher-photo', photo);
            setTeacher({ ...response.data.teacher, photo: photo || localStorage.getItem('teacher-photo') || '' })
        } catch (error) {
            console.error('Error updating teacher:', error)
        }
    }

    return {
        fetchTeacher, teacher, setTeacher, loading, setLoading, updateTeacher
    }
}



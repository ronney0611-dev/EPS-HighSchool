'use client'

import axios from "axios"
import { useEffect, useState } from "react"

export type Teacher = {
    name: string, school: string, nationality: string,
    birthday: string, birthloc: string, statu: string,
    email: string, phone: string, univerLic: string,
    anneLic: string, univerMas: string, anneMas: string,
    photo: string, review: string,
    nameLocked?: boolean,
}

const defaultTeacher: Teacher = {
    name: '', school: '', nationality: '',
    birthday: '', birthloc: '', statu: '',
    email: '', phone: '', univerLic: '',
    anneLic: '', univerMas: '', anneMas: '',
    photo: '', review: '',
}

export const useTeacher = () => {
    const [teacher, setTeacher] = useState<Teacher>(defaultTeacher);
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false); // true after the first fetch finishes

    const applyTeacher = (data: Partial<Teacher> | null | undefined) => {
        const photo = localStorage.getItem('teacher-photo') || ''
        setTeacher({ ...defaultTeacher, ...(data ?? {}), photo })
    }

    // manual refetch (from event handlers)
    const fetchTeacher = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/teacher');
            applyTeacher(response.data.teacher)
        } catch (error) {
            console.error('Error fetching teacher:', error);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    }

    // initial fetch: state is only set inside promise callbacks
    useEffect(() => {
        let cancelled = false
        axios.get('/api/teacher')
            .then(response => { if (!cancelled) applyTeacher(response.data.teacher) })
            .catch(error => console.error('Error fetching teacher:', error))
            .finally(() => {
                if (cancelled) return
                setLoading(false)
                setLoaded(true)
            })
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateTeacher = async (data: Partial<Teacher>) => {
        try {
            const { photo, ...rest } = data;
            const response = await axios.patch('/api/teacher', rest);
            if (photo) localStorage.setItem('teacher-photo', photo);
            setTeacher({
                ...defaultTeacher,
                ...(response.data.teacher ?? {}),
                photo: photo || localStorage.getItem('teacher-photo') || '',
            })
        } catch (error) {
            console.error('Error updating teacher:', error)
            throw error // let the caller show the error toast
        }
    }

    return {
        fetchTeacher, teacher, setTeacher, loading, loaded, setLoading, updateTeacher
    }
}
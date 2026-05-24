'use client'

import axios from "axios";
import { useState } from "react";

interface IStudentGrade {
    name: string;
    matricule: string;
    final: number;
}

interface TahsiliData {
    classId: string;
    activity: 'sprint' | 'longjump' | 'throw';
    students: IStudentGrade[];
}

export const useTahsili = () => {
    const [tahsili, setTahsili] = useState<TahsiliData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchTahsili = async (
        classId: string,
        activity: 'sprint' | 'longjump' | 'throw'
    ) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/tahsili/${classId}`, {
                params: { activity }
            });
            setTimeout(() => setTahsili(res.data), 0);
        } catch (err) {
            console.error("fetchTahsili error:", err);
            setTimeout(() => setTahsili(null), 0);
        } finally {
            setLoading(false);
        }
    };

    const saveTahsili = async (
        classId: string,
        activity: 'sprint' | 'longjump' | 'throw',
        students: IStudentGrade[]
    ) => {
        setLoading(true);
        try {
            const res = await axios.post(`/api/tahsili/${classId}`, {
                activity,
                students,
            });
            setTimeout(() => setTahsili(res.data), 0);
        } catch (err) {
            console.error("saveTahsili error:", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        tahsili,
        setTahsili,
        loading,
        fetchTahsili,
        saveTahsili,
    };
};
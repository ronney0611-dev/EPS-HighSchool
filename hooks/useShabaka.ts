'use client'

import { useState } from "react";
import axios from "axios";

export type StudentCheck = {
    studentId: string;
    name: string;
    checks: boolean[][];
};

export type ShabakaData = {
    _id?: string;
    classId: string;
    level: string;
    maidanIndex: number;
    tashkhisi?: { students: StudentCheck[] };
    tahsili?: { students: StudentCheck[] };
};

export const useShabaka = () => {
    const [shabaka, setShabaka] = useState<ShabakaData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchShabaka = async (classId: string, level: string, maidanIndex: number) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/shabaka', {
                params: { classId, level, maidanIndex },
            });
            setShabaka(response.data.shabaka);
            return response.data.shabaka as ShabakaData | null;
        } catch (error) {
            console.error('Error fetching shabaka:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const saveShabaka = async (
        classId: string,
        level: string,
        maidanIndex: number,
        type: 'tashkhisi' | 'tahsili',
        students: StudentCheck[]
    ) => {
        try {
            const response = await axios.post('/api/shabaka', {
                classId, level, maidanIndex, type, students,
            });
            setShabaka(response.data.shabaka);
            return response.data.shabaka as ShabakaData;
        } catch (error) {
            console.error('Error saving shabaka:', error);
            return null;
        }
    };

    return { shabaka, loading, fetchShabaka, saveShabaka, setShabaka };
};
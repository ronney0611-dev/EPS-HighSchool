'use client'

import axios from "axios";
import { useState } from "react";

interface IMostamirStudent {
    studentId: string;
    scores: number[];
}

export const useMostamir = () => {
    const [mostamir, setMostamir] = useState<IMostamirStudent[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMostamir = async (classId: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/mostamir/${classId}`);
            setTimeout(() => setMostamir(res.data.students || []), 0);
        } catch (err) {
            console.error('fetchMostamir error:', err);
            setTimeout(() => setMostamir([]), 0);
        } finally {
            setLoading(false);
        }
    };

    const saveMostamir = async (classId: string, students: IMostamirStudent[]) => {
        setLoading(true);
        try {
            const res = await axios.post(`/api/mostamir/${classId}`, { students });
            setTimeout(() => setMostamir(res.data.students || []), 0);
        } catch (err) {
            console.error('saveMostamir error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { mostamir, setMostamir, loading, fetchMostamir, saveMostamir };
};
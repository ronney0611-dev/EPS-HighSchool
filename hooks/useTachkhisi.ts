'use client'

import axios from "axios";
import { useState } from "react";

interface ICriteriaScore {
    t1: number;
    t2: number;
}

interface INumericalResult {
    t1: number;
    t2: number;
}

interface IStudentEvaluation {
    name: string;
    score: ICriteriaScore[];
    result?: INumericalResult;
    percentaget2: number;
    percentaget1: number;
    tatawaor: number;
    levelT1?: string;  // جماعي only
    levelT2?: string;  // جماعي only
}

interface IMochirAverage {
    t1: number;
    t2: number;
}

interface TachkhisiData {
    classId: string;
    sportKey: string;
    sportType: 'fardi' | 'groupe';
    mochirCount: number;
    selectedIndicatorIds: number[];
    students: IStudentEvaluation[];
    mochirAverages: IMochirAverage[];
}

export const useTachkhisi = () => {
    const [tachkhisi, setTachkhisi] = useState<TachkhisiData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchTachkhisi = async (
        classId: string,
        sportKey: string,
        sportType: 'fardi' | 'groupe'
    ): Promise<TachkhisiData | null> => {
        console.log('FETCH CALLED:', sportKey, sportType);
        setLoading(true);
        try {
            const res = await axios.get(`/api/tachkhisi/${classId}`, {
                params: { sportKey, sportType }
            });
            setTachkhisi(res.data);
            return res.data;
        } catch (err) {
            console.error("fetchTachkhisi error:", err);
            setTachkhisi(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const saveTachkhisi = async (
        classId: string,
        sportKey: string,
        sportType: 'fardi' | 'groupe',
        mochirCount: number,
        selectedIndicatorIds: number[],
        students: IStudentEvaluation[],
        mochirAverages: IMochirAverage[]
    ) => {
        setLoading(true);
        try {
            const res = await axios.post(`/api/tachkhisi/${classId}`, {
                sportKey,
                sportType,
                mochirCount,
                selectedIndicatorIds,
                students,
                mochirAverages,
            });
            setTachkhisi(res.data);
        } catch (err) {
            console.error("saveTachkhisi error:", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        tachkhisi,
        setTachkhisi,
        loading,
        fetchTachkhisi,
        saveTachkhisi,
    };
};
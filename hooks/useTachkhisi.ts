'use client'

import axios from "axios";
import { useState } from "react";

export interface ICriteriaScore {
    t1: number;
    t2: number;
}

export interface INumericalResult {
    t1: number;
    t2: number;
}

export interface IStudentEvaluation {
    name: string;
    score: ICriteriaScore[];
    result?: INumericalResult;
    percentaget2: number;
    percentaget1: number;
    tatawaor: number;
    levelT1?: string;  // جماعي only
    levelT2?: string;  // جماعي only
}

export interface IMochirAverage {
    t1: number;
    t2: number;
}

export interface TachkhisiData {
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

    // returns true when the server saved the data, false otherwise
    const saveTachkhisi = async (
        classId: string,
        sportKey: string,
        sportType: 'fardi' | 'groupe',
        mochirCount: number,
        selectedIndicatorIds: number[],
        students: IStudentEvaluation[],
        mochirAverages: IMochirAverage[]
    ): Promise<boolean> => {
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
            return true;
        } catch (err) {
            console.error("saveTachkhisi error:", err);
            return false;
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
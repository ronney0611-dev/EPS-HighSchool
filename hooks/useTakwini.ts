'use client'
import { useState } from "react";
import axios from "axios";
import { Gender, getScore } from "@/src/config/barem2";

export const useTakwini = () => {
    const [loading, setLoading] = useState(false);

    // flat state for the page
    const [performances, setPerformances] = useState<Record<string, string>>({});
    const [groupLevels, setGroupLevels] = useState<Record<string, string>>({});
    const [groupNotes, setGroupNotes] = useState<Record<string, number>>({});

    const toFlat = (students: { studentId: string, performances: string[] }[]) => {
        const flat: Record<string, string> = {};
        students.forEach(s => {
            s.performances.forEach((p, i) => {
                flat[`${s.studentId}-${i}`] = p;
            });
        });
        return flat;
    };

    const toStudents = (
        performances: Record<string, string>,
        studentIds: string[],
        genders: Record<string, Gender>,
        activity: 'sprint' | 'longjump' | 'throw',
        isThirdYear: boolean
    ) => {
        // 9 sessions only if the teacher used sessions 7-9, otherwise 6 as before
        const count = Object.keys(performances).some(k => /-(6|7|8)$/.test(k)) ? 9 : 6;
        return studentIds.map(id => {
            const perfs = Array.from({ length: count }, (_, i) => performances[`${id}-${i}`] ?? '');
            const scores = perfs.map(p => {
                const val = parseFloat(p);
                if (isNaN(val) || val <= 0) return 0;
                return getScore(activity, genders[id], val, isThirdYear);
            });
            const bestFardi = Math.max(...scores, 0);
            return { studentId: id, performances: perfs, bestFardi };
        });
    };

    const fetchTakwini = async (classId: string, activity: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/takwini/${classId}?activity=${activity}`);
            const doc = res.data.data;
            if (!doc) {
                setPerformances({});
                setGroupLevels({});
                setGroupNotes({});
                return;
            }
            setPerformances(toFlat(doc.students || []));
            setGroupLevels(doc.groupLevels ? doc.groupLevels : {});
            setGroupNotes(doc.groupNotes ? doc.groupNotes : {});
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveTakwini = async (
        classId: string,
        activity: 'sprint' | 'longjump' | 'throw',
        studentIds: string[],
        genders: Record<string, Gender>,
        isThirdYear: boolean
    ) => {
        setLoading(true);
        try {
            const students = toStudents(performances, studentIds, genders, activity, isThirdYear);
            await axios.post(`/api/takwini/${classId}`, {
                activity,
                students,
                groupLevels: Object.fromEntries(Object.entries(groupLevels)),
                groupNotes: Object.fromEntries(Object.entries(groupNotes)),
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        performances, setPerformances,
        groupLevels, setGroupLevels,
        groupNotes, setGroupNotes,
        fetchTakwini,
        saveTakwini,
    };
};
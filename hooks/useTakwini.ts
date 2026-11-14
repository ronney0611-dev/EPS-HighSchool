'use client'
import { useState } from "react";
import axios from "axios";
import { Gender, getScore } from "@/src/config/barem2";

// الأداء (A..E) -> its note (same scale as the collective part)
export const levelToNote = (level: string) => {
    switch (level) {
        case 'A': return { default: 19, min: 18, max: 20 };
        case 'B': return { default: 16, min: 15, max: 17 };
        case 'C': return { default: 12, min: 11, max: 14 };
        case 'D': return { default: 9, min: 7, max: 10 };
        case 'E': return { default: 4, min: 3, max: 6 };
        default: return null;
    }
};

// note of ONE individual session:
// only الأداء -> its note / only النتيجة -> barème score / both -> (الأداء + النتيجة) / 2
export const fardiSessionNote = (
    level: string,
    perf: string,
    activity: 'sprint' | 'longjump' | 'throw',
    gender: Gender,
    isThirdYear: boolean
): number => {
    const lv = levelToNote(level)?.default ?? 0;
    const val = parseFloat(perf);
    const sc = isNaN(val) || val <= 0 ? 0 : getScore(activity, gender, val, isThirdYear);
    if (lv > 0 && sc > 0) return (lv + sc) / 2;
    return lv > 0 ? lv : sc;
};

export const useTakwini = () => {
    const [loading, setLoading] = useState(false);

    // flat state for the page
    const [performances, setPerformances] = useState<Record<string, string>>({});
    const [fardiLevels, setFardiLevels] = useState<Record<string, string>>({});
    const [groupLevels, setGroupLevels] = useState<Record<string, string>>({});
    const [groupNotes, setGroupNotes] = useState<Record<string, number>>({});
    // notes typed by the teacher (studentId -> note). empty = automatic note
    const [fardiEdit, setFardiEdit] = useState<Record<string, string>>({});
    const [finalEdit, setFinalEdit] = useState<Record<string, string>>({});
    // attendance cell (0..35) of each ح — per teacher + activity (same for all classes)
    const [weeks, setWeeks] = useState<number[]>([]);

    const fetchWeeks = async (activity: string) => {
        try {
            const res = await axios.get(`/api/takwini-weeks?activity=${activity}`);
            setWeeks(Array.isArray(res.data.weeks) ? res.data.weeks : []);
        } catch (err) {
            console.error(err);
            setWeeks([]);
        }
    };

    // saved right away (no حفظ needed)
    const saveWeeks = async (activity: string, next: number[]) => {
        setWeeks(next);
        try {
            await axios.post(`/api/takwini-weeks`, { activity, weeks: next });
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const toFlat = (students: { studentId: string, performances?: string[], levels?: string[] }[]) => {
        const perf: Record<string, string> = {};
        const lv: Record<string, string> = {};
        students.forEach(s => {
            (s.performances ?? []).forEach((p, i) => { if (p) perf[`${s.studentId}-${i}`] = p; });
            (s.levels ?? []).forEach((l, i) => { if (l) lv[`${s.studentId}-${i}`] = l; });
        });
        return { perf, lv };
    };

    const toStudents = (
        studentIds: string[],
        genders: Record<string, Gender>,
        activity: 'sprint' | 'longjump' | 'throw',
        isThirdYear: boolean
    ) => {
        // 9 sessions only if the teacher used sessions 7-9, otherwise 6 as before
        const used = [...Object.keys(performances), ...Object.keys(fardiLevels)];
        const count = used.some(k => /-(6|7|8)$/.test(k)) ? 9 : 6;
        return studentIds.map(id => {
            const perfs = Array.from({ length: count }, (_, i) => performances[`${id}-${i}`] ?? '');
            const levels = Array.from({ length: count }, (_, i) => fardiLevels[`${id}-${i}`] ?? '');
            const notes = perfs.map((p, i) => fardiSessionNote(levels[i], p, activity, genders[id], isThirdYear));
            const typedFardi = parseFloat(fardiEdit[id] ?? '');
            const typedFinal = parseFloat(finalEdit[id] ?? '');
            return {
                studentId: id,
                performances: perfs,
                levels,
                // كشف النقاط reads bestFardi -> the teacher's note goes here
                bestFardi: !isNaN(typedFardi) ? typedFardi : Math.max(...notes, 0),
                fardiEdited: !isNaN(typedFardi),
                finalNote: !isNaN(typedFinal) ? typedFinal : null,
            };
        });
    };

    const fetchTakwini = async (classId: string, activity: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/takwini/${classId}?activity=${activity}`);
            const doc = res.data.data;
            if (!doc) {
                setPerformances({});
                setFardiLevels({});
                setGroupLevels({});
                setGroupNotes({});
                setFardiEdit({});
                setFinalEdit({});
                return;
            }
            const { perf, lv } = toFlat(doc.students || []);
            setPerformances(perf);
            setFardiLevels(lv);
            setGroupLevels(doc.groupLevels ? doc.groupLevels : {});
            setGroupNotes(doc.groupNotes ? doc.groupNotes : {});
            const fe: Record<string, string> = {};
            const fi: Record<string, string> = {};
            (doc.students || []).forEach((s: { studentId: string, bestFardi?: number, fardiEdited?: boolean, finalNote?: number | null }) => {
                if (s.fardiEdited && typeof s.bestFardi === 'number') fe[s.studentId] = String(s.bestFardi);
                if (typeof s.finalNote === 'number') fi[s.studentId] = String(s.finalNote);
            });
            setFardiEdit(fe);
            setFinalEdit(fi);
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
            const students = toStudents(studentIds, genders, activity, isThirdYear);
            await axios.post(`/api/takwini/${classId}`, {
                activity,
                students,
                groupLevels: Object.fromEntries(Object.entries(groupLevels)),
                groupNotes: Object.fromEntries(Object.entries(groupNotes)),
            });
            return true;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        performances, setPerformances,
        fardiLevels, setFardiLevels,
        groupLevels, setGroupLevels,
        groupNotes, setGroupNotes,
        fardiEdit, setFardiEdit,
        finalEdit, setFinalEdit,
        weeks, fetchWeeks, saveWeeks,
        fetchTakwini,
        saveTakwini,
    };
};
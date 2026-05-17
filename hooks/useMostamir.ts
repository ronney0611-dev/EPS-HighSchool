import axios from "axios";
import { useState } from "react"


export type Sessions = {
    studentId: string,
    sessions: string[],
}

export type Attendance = {
    classId: string,
    attendance: Sessions[],
}

export const useAttendance = () => {
    const [attendance, setAttendance] = useState<Sessions[]>([]);
    const [loading, setLoading] = useState(false);

    const fetcheAttendance = async (classId: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/attendance/${classId}`);
            setAttendance(response.data.attendance?.attendance || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    }

    const updateAttendance = async (classId: string, data: Sessions[]) => {
        try {
            const response = await axios.post(`/api/attendance/${classId}`, { attendance: data });
            setAttendance(response.data.newAtt.attendance || []);
        } catch (error) {
            console.error('Error updating attendance:', error);
        }
    }

    return {
        attendance, setAttendance, loading, setLoading, fetcheAttendance, updateAttendance,
    }
}
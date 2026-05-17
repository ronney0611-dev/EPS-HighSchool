import axios from "axios"
import { useState } from "react"

export type GroupStudent = {
    _id?: string
    id?: string
    name: string
    gender: string
    level?: string
    isLeader?: boolean
}

export type Group = {
    leader: string | undefined
    students: GroupStudent[]
}

export const useGroupe = () => {
    const [groupe, setGroupe] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGroupes = async (classId: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/groupe/${classId}`);
            setGroupe(response.data.groupe?.groupe || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    }

    const creatGroupes = async (classId: string, groupe: Group[]) => {
        try {
            const response = await axios.post(`/api/groupe/${classId}`, { groupe: groupe });
            setGroupe(response.data.newGroupe.groupe || []);
        } catch (error) {
            console.error('Error creating groups:', error);
        }
    }

    return {
        fetchGroupes, creatGroupes, loading, groupe, setGroupe, setLoading,
    }
}

// hooks/useWahdaPrimaire.ts
'use client'

import { useCallback, useState } from 'react'
import axios from 'axios'
import type { ISessionPrimaire } from '@/app/models/Wahdaprimairedoc'

export type WahdaPrimaireState = {
    level: string
    maidanId: number
    maidanName: string
    kafaKhitamya: string
    sessions: ISessionPrimaire[]
}

export const useWahdaPrimaire = () => {
    const [wahda, setWahda] = useState<WahdaPrimaireState | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchWahda = useCallback(async (classId: string, level: string, maidanId: number) => {
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get('/api/wahda-primaire', {
                params: { classId, level, maidanId },
            })
            return res.data.wahda as (WahdaPrimaireState & { _id: string }) | null
        } catch (err) {
            console.error('Error fetching primaire wahda:', err)
            setError('حدث خطأ أثناء جلب الوحدة التعلمية')
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    const saveWahda = useCallback(async (classId: string, data: WahdaPrimaireState) => {
        setError(null)
        try {
            const res = await axios.post('/api/wahda-primaire', { classId, ...data })
            return res.data.wahda
        } catch (err) {
            console.error('Error saving primaire wahda:', err)
            setError('حدث خطأ أثناء الحفظ')
            return null
        }
    }, [])

    return { wahda, setWahda, loading, error, fetchWahda, saveWahda }
}
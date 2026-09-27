'use client'

import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

export type DailyLogEntryLycee = {
    _id: string
    classId: string
    className: string
    institution: string
    date: string
    time: string
    sport: string
    done: boolean
    reason: string
    nextTime: string
}

export const useDailyLogLycee = () => {
    const [entries, setEntries] = useState<DailyLogEntryLycee[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEntries = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get('/api/daily-log-lycee')
            setEntries(res.data.entries || [])
        } catch (err) {
            console.error('Error fetching lycee daily log:', err)
            setError('حدث خطأ أثناء جلب الدفتر اليومي')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEntries()
    }, [fetchEntries])

    const addEntry = useCallback(async (data: Omit<DailyLogEntryLycee, '_id'>) => {
        try {
            const res = await axios.post('/api/daily-log-lycee', data)
            setEntries(prev => [...prev, res.data.entry])
            return res.data.entry as DailyLogEntryLycee
        } catch (err) {
            console.error('Error adding lycee daily log entry:', err)
            setError('حدث خطأ أثناء الحفظ')
            return null
        }
    }, [])

    const deleteEntry = useCallback(async (id: string) => {
        try {
            await axios.delete('/api/daily-log-lycee', { params: { id } })
            setEntries(prev => prev.filter(e => e._id !== id))
            return true
        } catch (err) {
            console.error('Error deleting lycee daily log entry:', err)
            setError('حدث خطأ أثناء الحذف')
            return false
        }
    }, [])

    return { entries, loading, error, fetchEntries, addEntry, deleteEntry }
}
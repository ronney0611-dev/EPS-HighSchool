'use client'

import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

export type DailyLogEntry = {
    _id: string
    classId: string
    className: string
    institution: string
    date: string
    time: string
    teachingContent: string
    learningContent: string
    notes: string
    level?: string
    maidanId?: number
    sessionIndex?: number
}

export const useDailyLog = () => {
    const [entries, setEntries] = useState<DailyLogEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEntries = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get('/api/daily-log')
            setEntries(res.data.entries || [])
        } catch (err) {
            console.error('Error fetching daily log:', err)
            setError('حدث خطأ أثناء جلب الدفتر اليومي')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEntries()
    }, [fetchEntries])

    const addEntry = useCallback(async (data: Omit<DailyLogEntry, '_id'>) => {
        try {
            const res = await axios.post('/api/daily-log', data)
            setEntries(prev => [...prev, res.data.entry])
            return res.data.entry as DailyLogEntry
        } catch (err) {
            console.error('Error adding daily log entry:', err)
            setError('حدث خطأ أثناء الحفظ')
            return null
        }
    }, [])

    const deleteEntry = useCallback(async (id: string) => {
        try {
            await axios.delete('/api/daily-log', { params: { id } })
            setEntries(prev => prev.filter(e => e._id !== id))
            return true
        } catch (err) {
            console.error('Error deleting daily log entry:', err)
            setError('حدث خطأ أثناء الحذف')
            return false
        }
    }, [])

    return { entries, loading, error, fetchEntries, addEntry, deleteEntry }
}
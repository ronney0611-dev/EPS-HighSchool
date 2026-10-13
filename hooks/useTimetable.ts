'use client'

import { useCallback, useEffect, useState } from 'react'

export interface TimetableSlot {
    day: number
    start: number
    end: number
    classId: string
}

export function useTimetable() {
    const [slots, setSlots] = useState<TimetableSlot[]>([])
    const [loaded, setLoaded] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let cancelled = false
        fetch('/api/timetable')
            .then(r => (r.ok ? r.json() : { slots: [] }))
            .then(data => {
                if (cancelled) return
                setSlots((data.slots ?? []).map((s: TimetableSlot) => ({ ...s, classId: String(s.classId) })))
            })
            .catch(err => console.error('Error fetching timetable:', err))
            .finally(() => { if (!cancelled) setLoaded(true) })
        return () => { cancelled = true }
    }, [])

    const save = useCallback(async (next: TimetableSlot[]) => {
        setSaving(true)
        try {
            const res = await fetch('/api/timetable', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slots: next }),
            })
            return res.ok
        } catch {
            return false
        } finally {
            setSaving(false)
        }
    }, [])

    return { slots, setSlots, loaded, saving, save }
}
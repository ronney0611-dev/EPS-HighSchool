'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import type { ISession } from '@/app/models/WahdaDoc'

// neededKeys: "level|sport|trimester,level|sport|trimester,..."
export function useWahdaSessions(neededKeys: string) {
    const [wahdas, setWahdas] = useState<Record<string, ISession[]>>({})
    const inflight = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!neededKeys) return
        neededKeys.split(',').forEach(key => {
            if (inflight.current.has(key)) return
            inflight.current.add(key)
            const [level, sport, trimester] = key.split('|')
            axios.get(`/api/wahda/${level}`, { params: { sport, trimester } })
                .then(res => setWahdas(prev => ({ ...prev, [key]: res.data?.sessions ?? [] })))
                .catch(() => setWahdas(prev => ({ ...prev, [key]: [] })))
        })
    }, [neededKeys])

    return wahdas
}
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const round2 = (n: number) => Math.round(n * 100) / 100

export function useChrono() {
    const startRef = useRef<number | null>(null)
    const rafRef = useRef<number | null>(null)
    const [elapsedMs, setElapsedMs] = useState(0)
    const [running, setRunning] = useState(false)

    const cancelLoop = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
    }

    const start = useCallback(() => {
        cancelLoop()
        startRef.current = performance.now()
        setElapsedMs(0)
        setRunning(true)

        const loop = () => {
            if (startRef.current == null) return
            setElapsedMs(performance.now() - startRef.current)
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
    }, [])

    // time since start without stopping (used later for heats)
    const lap = useCallback((): number | null => {
        if (startRef.current == null) return null
        return round2((performance.now() - startRef.current) / 1000)
    }, [])

    const stop = useCallback((): number | null => {
        if (startRef.current == null) return null
        const seconds = round2((performance.now() - startRef.current) / 1000)
        cancelLoop()
        startRef.current = null
        setRunning(false)
        setElapsedMs(seconds * 1000)
        return seconds
    }, [])

    const reset = useCallback(() => {
        cancelLoop()
        startRef.current = null
        setRunning(false)
        setElapsedMs(0)
    }, [])

    useEffect(() => cancelLoop, [])

    return {
        seconds: round2(elapsedMs / 1000),
        running,
        start,
        stop,
        lap,
        reset,
    }
}
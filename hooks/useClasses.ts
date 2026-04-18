'use client'
import { useEffect, useState } from "react"

type Class = { name: string, students: string[] }

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('classes')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes))
  }, [classes])

  return { classes, setClasses }
}
'use client'
import { useEffect, useState } from "react"

export type Student = {
  id: string,
  matricule?: string,
  name: string,
  gender: 'female' | 'male',
  status: 'active' | 'malade' | 'special'
}
export type Class = { name: string, level: string, students: Student[] }

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('classes')
    return saved ? JSON.parse(saved) : []
  });
  
  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('classes')
      if (saved) setClasses(JSON.parse(saved))
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return { classes, setClasses }
}
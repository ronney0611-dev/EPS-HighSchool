'use client'
import { useEffect, useState } from "react"

export type Student = {
  name : string,
  gender: 'female' | 'male',
  status : 'active' | 'malade' | 'special'
}
export type Class = { name: string, students: Student[] }

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('classes')
    return saved ? JSON.parse(saved) : []
  });

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes))
  }, [classes])

  return { classes, setClasses }
}
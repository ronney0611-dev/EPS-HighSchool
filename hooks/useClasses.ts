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
  const [classes, setClasses] = useState<Class[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('classes')
    if (saved) setClasses(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (classes.length > 0) {
      localStorage.setItem('classes', JSON.stringify(classes))
    }
  }, [classes])

  return { classes, setClasses }
}
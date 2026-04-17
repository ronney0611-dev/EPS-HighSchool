import { useEffect, useState } from "react"

export const useClasses = () => {
  const [classes, setClasses] = useState(() => {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem('classes')
  return saved ? JSON.parse(saved) : []
})

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes))
  }, [classes])

  return { classes, setClasses }
}
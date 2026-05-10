export const saveTahsili = (className: string, grades: { name: string, final: number }[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`tahsili-${className}`, JSON.stringify(grades))
}

export const loadTahsili = (className: string) => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(`tahsili-${className}`)
    return data ? JSON.parse(data) : null
}
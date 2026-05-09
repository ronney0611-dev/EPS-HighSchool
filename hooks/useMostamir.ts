export const saveMostamir = (className: string, scores: number[][]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`mostamir-${className}`, JSON.stringify(scores))
}

export const loadMostamir = (className: string): number[][] | null => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(`mostamir-${className}`)
    return data ? JSON.parse(data) : null
}

export type GroupStudent = {
    id?: string
    name: string
    gender: string
    level?: string
    isLeader?: boolean
}

export type Group = {
    leader: string
    students: GroupStudent[]
}

export const saveGroups = (className: string, groups: Group[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`groups-${className}`, JSON.stringify(groups))
}

export const loadGroups = (className: string) => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(`groups-${className}`)
    return data ? JSON.parse(data) : null
}
import { Student } from './useClasses'

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
    localStorage.setItem(`groups-${className}`, JSON.stringify(groups))
}

export const loadGroups = (className: string): Group[] | null => {
    const data = localStorage.getItem(`groups-${className}`)
    return data ? JSON.parse(data) : null
}
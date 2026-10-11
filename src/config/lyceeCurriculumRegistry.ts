import level1Data from '@/src/config/level1Curriculum.json'
import level2Data from '@/src/config/level2Curriculum.json'
import level3Data from '@/src/config/level3Curriculum.json'

export interface Indicator { id: number; text: string; goal_base: string }
export interface SportConfig { activity: string; kafaa_kaadia: string; indicators: Indicator[] }
export interface LevelCurriculum { kafaa_khatamia: string; sports: { [key: string]: SportConfig | undefined } }

type RawCurriculumFile = { [key: string]: LevelCurriculum }

export const curriculumRegistry: Record<string, LevelCurriculum | undefined> = {
    '1': (level1Data as unknown as RawCurriculumFile)['1'] || (level1Data as unknown as LevelCurriculum),
    '2': (level2Data as unknown as RawCurriculumFile)['2'] || (level2Data as unknown as LevelCurriculum),
    '3': (level3Data as unknown as RawCurriculumFile)['3'] || (level3Data as unknown as LevelCurriculum),
}

export const getLevelKeyFromClass = (className: string | number | undefined, fallbackLevel?: string | number): '1' | '2' | '3' => {
    const source = className ?? fallbackLevel
    if (source === undefined || source === null) return '1'
    const str = String(source).trim()
    if (str.startsWith('1')) return '1'
    if (str.startsWith('2')) return '2'
    if (str.startsWith('3')) return '3'
    const n = str.toLowerCase()
    if (n.includes('أولى') || n.includes('اولى') || n.includes('niveau 1') || n.includes('s1')) return '1'
    if (n.includes('ثانية') || n.includes('niveau 2') || n.includes('s2')) return '2'
    if (n.includes('ثالثة') || n.includes('niveau 3') || n.includes('s3')) return '3'
    return '1'
}

export const getAllIndicatorIds = (levelKey: string, sportKey: string) =>
    curriculumRegistry[levelKey]?.sports?.[sportKey]?.indicators.map(i => i.id) ?? []
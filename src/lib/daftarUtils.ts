import { INDIVIDUAL_SPORTS, COLLECTIVE_SPORTS } from '@/src/config/ficheTechData'
import type { TimetableSlot } from '@/hooks/useTimetable'
import type { DailyLogEntryLycee } from '@/hooks/useDailyLogLycee'

export type Level = '1' | '2' | '3'
export type SportType = 'fardi' | 'jama3i'

export const SPORT_NAMES_AR: Record<string, string> = {
    sprint: 'سباق السرعة',
    basketball: 'كرة السلة',
    long_jump: 'الوثب الطويل',
    handball: 'كرة اليد',
    shot_put: 'دفع الجلة',
    volleyball: 'الكرة الطائرة',
}
export const sportLabel = (k: string) => SPORT_NAMES_AR[k] ?? k

export const LEVEL_LABEL: Record<Level, string> = {
    '1': 'السنة الأولى ثانوي',
    '2': 'السنة الثانية ثانوي',
    '3': 'السنة الثالثة ثانوي',
}

export const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
export const REASONS = ['أحوال جوية', 'اختبارات', 'نشاط مدرسي', 'غياب الأستاذ', 'غياب التلاميذ']
export const SUGGESTIONS = ['تعويض الحصة لاحقا', 'تأجيل إلى الحصة القادمة', 'حصة نظرية في القسم']
export const PERIOD_STARTS = [480, 540, 600, 660, 810, 870, 930, 990]
export const LUNCH = 720
export const DAY_END = 1050
export const LOOKBACK_DAYS = 7

// Sunday of the first school week (school started Monday 21/09/2026)
export const SCHOOL_YEAR_START = '2026-09-20'

export const SPORTS_BY_TYPE: Record<SportType, readonly string[]> = {
    fardi: INDIVIDUAL_SPORTS,
    jama3i: COLLECTIVE_SPORTS,
}
export const TYPE_LABEL: Record<SportType, string> = { fardi: 'فردي', jama3i: 'جماعي' }
export const typeOfSport = (sport: string): SportType =>
    (COLLECTIVE_SPORTS as readonly string[]).includes(sport) ? 'jama3i' : 'fardi'

/* ---------- time & dates ---------- */
export const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
export const hourTime = (start: number) => `${fmt(start)} - ${fmt(start + 60)}`

export const isoLocal = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parseIso = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}
export const addDays = (iso: string, n: number) => {
    const d = parseIso(iso)
    d.setDate(d.getDate() + n)
    return isoLocal(d)
}
export const shortDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
export const displayDate = (iso: string) => iso.split('-').reverse().join('/')

export const trimesterOf = (date: string): Level => {
    const m = Number(date.slice(5, 7))
    if (m >= 9) return '1'
    if (m <= 3) return '2'
    return '3'
}

/* ---------- weeks (Sunday → Thursday) ---------- */
export const weekStartOf = (iso: string) => {
    const d = parseIso(iso)
    d.setDate(d.getDate() - d.getDay())
    return isoLocal(d)
}
export const weekNumberOf = (weekStart: string) =>
    Math.round((parseIso(weekStart).getTime() - parseIso(SCHOOL_YEAR_START).getTime()) / (7 * 86400000)) + 1
export const weekRangeLabel = (weekStart: string) =>
    `من ${displayDate(weekStart)} إلى ${displayDate(addDays(weekStart, 4))}`

/* ---------- entries ---------- */
export const sortEntries = (list: DailyLogEntryLycee[]) =>
    [...list].sort((a, b) =>
        a.date === b.date ? (a.time || '').localeCompare(b.time || '') : a.date.localeCompare(b.date)
    )

export const isHourLogged = (entries: DailyLogEntryLycee[], classId: string, date: string, time: string) =>
    entries.some(e => String(e.classId) === classId && e.date === date && e.time === time)

// pending hours over the last days (used for the tab badge)
export function countPendingHours(slots: TimetableSlot[], entries: DailyLogEntryLycee[]) {
    let n = 0
    const today = new Date()
    for (let offset = 0; offset <= LOOKBACK_DAYS; offset++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
        const dow = d.getDay()
        if (dow > 4) continue
        const date = isoLocal(d)
        slots.filter(s => s.day === dow).forEach(s => {
            for (let t = s.start; t < s.end; t += 60) {
                if (!isHourLogged(entries, s.classId, date, hourTime(t))) n++
            }
        })
    }
    return n
}
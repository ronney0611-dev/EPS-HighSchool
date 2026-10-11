export type PrimaireTour = '123' | '45'

export interface PlanWeek {
    kind: 'week'
    from: string // YYYY-MM-DD
    to: string
    slots: Record<PrimaireTour, number>
    label?: string // fixed label (حصة تنظيم واتصال)
}

export interface PlanBreak {
    kind: 'break'
    label: string
    from: string
    to: string
}

export interface PlanTrimester {
    maidanId: number
    rows: (PlanWeek | PlanBreak)[]
    breakAfter?: PlanBreak
}

const w = (from: string, to: string, s123: number, s45: number, label?: string): PlanWeek => ({
    kind: 'week', from, to, slots: { '123': s123, '45': s45 }, label,
})

export const ANNUAL_PLAN_PRIMAIRE: PlanTrimester[] = [
    {
        maidanId: 1,
        rows: [
            w('2026-09-21', '2026-09-24', 0, 0, 'حصة تنظيم واتصال'),
            w('2026-09-27', '2026-10-01', 1, 1),
            w('2026-10-04', '2026-10-08', 2, 1),
            w('2026-10-11', '2026-10-15', 2, 1),
            w('2026-10-18', '2026-10-22', 2, 1),
            w('2026-10-25', '2026-10-29', 1, 1),
            { kind: 'break', label: 'عطلة الخريف', from: '2026-10-27', to: '2026-11-02' },
            w('2026-11-01', '2026-11-05', 2, 1),
            w('2026-11-08', '2026-11-12', 2, 1),
            w('2026-11-15', '2026-11-19', 2, 1),
            w('2026-11-22', '2026-11-26', 2, 1),
            w('2026-11-29', '2026-12-03', 2, 1),
            w('2026-12-06', '2026-12-10', 2, 1),
            w('2026-12-13', '2026-12-17', 1, 1),
        ],
        breakAfter: { kind: 'break', label: 'عطلة الشتاء', from: '2026-12-17', to: '2027-01-03' },
    },
    {
        maidanId: 2,
        rows: [
            w('2027-01-03', '2027-01-07', 2, 1),
            w('2027-01-10', '2027-01-14', 2, 1),
            w('2027-01-17', '2027-01-21', 2, 1),
            w('2027-01-24', '2027-01-28', 2, 1),
            w('2027-01-31', '2027-02-04', 2, 1),
            w('2027-02-07', '2027-02-11', 2, 1),
            w('2027-02-14', '2027-02-18', 2, 1),
            w('2027-02-21', '2027-02-25', 2, 1),
            w('2027-02-28', '2027-03-04', 2, 1),
            w('2027-03-07', '2027-03-11', 2, 1),
            w('2027-03-14', '2027-03-18', 1, 1),
        ],
        breakAfter: { kind: 'break', label: 'عطلة الربيع', from: '2027-03-18', to: '2027-04-04' },
    },
    {
        maidanId: 3,
        rows: [
            w('2027-04-04', '2027-04-08', 2, 1),
            w('2027-04-11', '2027-04-15', 2, 1),
            w('2027-04-18', '2027-04-22', 2, 1),
            w('2027-04-25', '2027-04-29', 2, 1),
            w('2027-05-02', '2027-05-06', 2, 1),
            w('2027-05-09', '2027-05-13', 2, 1),
            w('2027-05-16', '2027-05-20', 2, 1),
        ],
    },
]

export const getTourFromLevel = (level: string): PrimaireTour =>
    /[45]/.test(String(level)) ? '45' : '123'

export const pad2 = (n: number) => String(n).padStart(2, '0')

// consecutive duplicates (several exercises under the same unit_name) → one session
export const dedupeConsecutive = (names: string[]) =>
    names.filter((n, i) => i === 0 || n !== names[i - 1])

// fewer sessions than slots → pad with حصة معالجة (like the official sheet)
// more sessions than slots → extras merged into the last slot
export function fitSessions(names: string[], total: number): string[] {
    if (total <= 0) return []
    if (names.length === 0) return Array(total).fill('')
    if (names.length === total) return names
    if (names.length < total) {
        const extra = total - names.length
        return [...names, ...Array.from({ length: extra }, (_, i) => `حصة معالجة ${pad2(i + 1)}`)]
    }
    return [...names.slice(0, total - 1), names.slice(total - 1).join(' + ')]
}
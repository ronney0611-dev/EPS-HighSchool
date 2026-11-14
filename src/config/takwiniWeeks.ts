import { SCHEDULES, SCHEDULE_S1_S2 } from "@/src/config/annualSchedule";

export type Activity = 'sprint' | 'longjump' | 'throw';

const DOMAIN_OF_ACTIVITY: Record<Activity, string> = { sprint: 'المجال التعلمي الأول', throw: 'المجال التعلمي الثاني', longjump: 'المجال التعلمي الثالث' };

// attendance page: 36 cells = 9 months x 4 weeks
export const MONTHS = ['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي'];
export const WEEK_OPTIONS = MONTHS.flatMap((m, mi) => [0, 1, 2, 3].map(w => ({ value: mi * 4 + w, label: `${m} ${w + 1}` })));

export const levelKeyOfClass = (name?: string) => name?.startsWith('3') ? 's3' : name?.startsWith('2') ? 's2' : 's1';

// default cell of ح1 = week "الوحدة رقم 01" of the domain, counted like the attendance page (4 weeks per month)
export const defaultFirstWeek = (levelKey: string, activity: Activity): number => {
    const rows = SCHEDULES[levelKey as keyof typeof SCHEDULES] ?? SCHEDULE_S1_S2;
    const perMonth: Record<string, number> = {};
    for (const r of rows) {
        const w = perMonth[r.month] ?? 0;
        perMonth[r.month] = w + 1;
        if (r.domain === DOMAIN_OF_ACTIVITY[activity] && r.type === 'regular' && Number(r.unit) === 1) {
            const mi = MONTHS.indexOf(r.month);
            if (mi !== -1) return mi * 4 + Math.min(3, w);
        }
    }
    return 2;
};

// ح k after ح from: one week each; in 9 sessions the week after ح6 is تقويم بيني
export const nextWeeks = (fromIndex: number, fromCell: number, sessions: number): number[] =>
    Array.from({ length: sessions }, (_, k) => {
        if (k <= fromIndex) return -1;
        const bayni = sessions === 9 && fromIndex <= 5 && k >= 6 ? 1 : 0;
        return Math.min(35, fromCell + (k - fromIndex) + bayni);
    });

// attendance cell of each ح: saved weeks of the teacher, the rest follow ح1
export const buildSessionWeeks = (weeks: number[], sessions: number, levelKey: string, activity: Activity): number[] => {
    const out: number[] = [];
    for (let gi = 0; gi < sessions; gi++) {
        const saved = weeks[gi];
        if (gi === 0) out.push(typeof saved === 'number' && saved >= 0 && saved < 36 ? saved : defaultFirstWeek(levelKey, activity));
        else if (typeof saved === 'number' && saved >= 0 && saved < 36) out.push(saved);
        else out.push(Math.min(35, out[gi - 1] + 1 + (sessions === 9 && gi === 6 ? 1 : 0)));
    }
    return out;
};
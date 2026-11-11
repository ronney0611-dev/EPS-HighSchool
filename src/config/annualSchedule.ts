// src/config/annualSchedule.ts
// The official 2026/2027 annual schedule (المخطط السنوي), shared by the annual plan page and the وحدة page.

export type RowType = 'regular' | 'diagnostic' | 'holiday' | 'exam' | 'summative' | 'merged' | 'competition';

export interface ScheduleRow {
    domain: string;
    month: string;
    dates: string;
    unit: string;
    individualGoal: string;
    teamGoal: string;
    type: RowType;
}

export type DomainKey = 'd1' | 'd2' | 'd3';
export type SportPair = { individual: string; team: string };

// Official 2026/2027 Algerian PE annual schedule — starting 21 September 2026
export const SCHEDULE_S1_S2: ScheduleRow[] = [
    // --- المجال التعلمي الأول ---
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '21/09/2026 - 24/09/2026', unit: '', individualGoal: 'تنظيم واتصال', teamGoal: 'تنظيم واتصال', type: 'diagnostic' },
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '27/09/2026 - 01/10/2026', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '04/10/2026 - 08/10/2026', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '11/10/2026 - 15/10/2026', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '18/10/2026 - 22/10/2026', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '25/10/2026 - 27/10/2026', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '02/11/2026 - 05/11/2026', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '08/11/2026 - 12/11/2026', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '15/11/2026 - 19/11/2026', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },

    // --- المجال التعلمي الثاني ---
    { domain: 'المجال التعلمي الثاني', month: 'نوفمبر', dates: '22/11/2026 - 26/11/2026', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '29/11/2026 - 03/12/2026', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '06/12/2026 - 10/12/2026', unit: '', individualGoal: 'اختبارات الفصل الأول', teamGoal: 'اختبارات الفصل الأول', type: 'exam' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '13/12/2026 - 17/12/2026', unit: '', individualGoal: 'أنشطة تنافسية', teamGoal: 'أنشطة تنافسية', type: 'competition' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '18/12/2026 - 02/01/2027', unit: '', individualGoal: 'عطلة الشتاء', teamGoal: 'عطلة الشتاء', type: 'holiday' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '03/01/2027 - 07/01/2027', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '10/01/2027 - 14/01/2027', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '17/01/2027 - 21/01/2027', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '24/01/2027 - 28/01/2027', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'فيفري', dates: '31/01/2027 - 04/02/2027', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'فيفري', dates: '07/02/2027 - 11/02/2027', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },

    // --- المجال التعلمي الثالث ---
    { domain: 'المجال التعلمي الثالث', month: 'فيفري', dates: '14/02/2027 - 18/02/2027', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الثالث', month: 'فيفري', dates: '21/02/2027 - 25/02/2027', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '28/02/2027 - 01/03/2027', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '02/03/2027 - 08/03/2027', unit: '', individualGoal: 'اختبارات الفصل الثاني', teamGoal: 'اختبارات الفصل الثاني', type: 'exam' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '09/03/2027 - 11/03/2027', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '14/03/2027 - 18/03/2027', unit: '', individualGoal: 'أنشطة تنافسية', teamGoal: 'أنشطة تنافسية', type: 'competition' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '19/03/2027 - 03/04/2027', unit: '', individualGoal: 'عطلة الربيع', teamGoal: 'عطلة الربيع', type: 'holiday' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '04/04/2027 - 08/04/2027', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '11/04/2027 - 15/04/2027', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '18/04/2027 - 22/04/2027', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'ماي', dates: '25/04/2027 - 29/04/2027', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'ماي', dates: '02/05/2027 - 06/05/2027', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },
];

export const SCHEDULE_S3: ScheduleRow[] = [
    // --- المجال التعلمي الأول ---
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '21/09/2026 - 24/09/2026', unit: '', individualGoal: 'تنظيم واتصال', teamGoal: 'تنظيم واتصال', type: 'diagnostic' },
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '27/09/2026 - 01/10/2026', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الأول', month: 'سبتمبر', dates: '04/10/2026 - 08/10/2026', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '11/10/2026 - 15/10/2026', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '18/10/2026 - 22/10/2026', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'أكتوبر', dates: '25/10/2026 - 24/10/2026', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '02/11/2026 - 05/11/2026', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '08/11/2026 - 12/11/2026', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الأول', month: 'نوفمبر', dates: '15/11/2026 - 19/11/2026', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },

    // --- المجال التعلمي الثاني ---
    { domain: 'المجال التعلمي الثاني', month: 'نوفمبر', dates: '22/11/2026 - 26/11/2026', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '29/11/2026 - 03/12/2026', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '06/12/2026 - 10/12/2026', unit: '', individualGoal: 'اختبارات الفصل الأول', teamGoal: 'اختبارات الفصل الأول', type: 'exam' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '13/12/2026 - 17/12/2026', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'ديسمبر', dates: '18/12/2026 - 02/01/2027', unit: '', individualGoal: 'عطلة الشتاء', teamGoal: 'عطلة الشتاء', type: 'holiday' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '03/01/2027 - 07/01/2027', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '10/01/2027 - 14/01/2027', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '17/01/2027 - 21/01/2027', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'جانفي', dates: '24/01/2027 - 28/01/2027', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الثاني', month: 'فيفري', dates: '31/01/2027 - 04/02/2027', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },

    // --- المجال التعلمي الثالث ---
    { domain: 'المجال التعلمي الثالث', month: 'فيفري', dates: '07/02/2027 - 11/02/2027', unit: '', individualGoal: 'تقويم تشخيصي', teamGoal: 'تقويم تشخيصي', type: 'diagnostic' },
    { domain: 'المجال التعلمي الثالث', month: 'فيفري', dates: '14/02/2027 - 18/02/2027', unit: '01', individualGoal: 'الوحدة التعلمية رقم 01', teamGoal: 'الوحدة التعلمية رقم 01', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'فيفري', dates: '21/02/2027 - 25/02/2027', unit: '02', individualGoal: 'الوحدة التعلمية رقم 02', teamGoal: 'الوحدة التعلمية رقم 02', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '28/02/2027 - 01/03/2027', unit: '03', individualGoal: 'الوحدة التعلمية رقم 03', teamGoal: 'الوحدة التعلمية رقم 03', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '02/03/2027 - 08/03/2027', unit: '', individualGoal: 'اختبارات الفصل الثاني', teamGoal: 'اختبارات الفصل الثاني', type: 'exam' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '09/03/2027 - 11/03/2027', unit: '', individualGoal: 'استدراكي', teamGoal: 'استدراكي', type: 'merged' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '14/03/2027 - 18/03/2027', unit: '04', individualGoal: 'الوحدة التعلمية رقم 04', teamGoal: 'الوحدة التعلمية رقم 04', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'مارس', dates: '19/03/2027 - 03/04/2027', unit: '', individualGoal: 'عطلة الربيع', teamGoal: 'عطلة الربيع', type: 'holiday' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '04/04/2027 - 08/04/2027', unit: '05', individualGoal: 'الوحدة التعلمية رقم 05', teamGoal: 'الوحدة التعلمية رقم 05', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '11/04/2027 - 15/04/2027', unit: '06', individualGoal: 'الوحدة التعلمية رقم 06', teamGoal: 'الوحدة التعلمية رقم 06', type: 'regular' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '18/04/2027 - 22/04/2027', unit: '', individualGoal: 'تقويم تحصيلي', teamGoal: 'تقويم تحصيلي', type: 'summative' },
    { domain: 'المجال التعلمي الثالث', month: 'أفريل', dates: '25/04/2027 - 29/04/2027', unit: '', individualGoal: 'اسبوع استدراكي', teamGoal: 'اسبوع استدراكي', type: 'merged' },
];

export const SCHEDULES: Record<string, ScheduleRow[]> = {
    s1: SCHEDULE_S1_S2,
    s2: SCHEDULE_S1_S2,
    s3: SCHEDULE_S3.length > 0 ? SCHEDULE_S3 : SCHEDULE_S1_S2,
};
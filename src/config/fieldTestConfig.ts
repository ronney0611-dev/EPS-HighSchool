export type FieldSportKey = 'sprint' | 'long_jump' | 'shot_put'

export const FIELD_TEST_SPORTS: Record<FieldSportKey, { label: string; input: 'chrono' | 'distance'; unit: string }> = {
    sprint: { label: 'سباق السرعة', input: 'chrono', unit: 'ث' },
    long_jump: { label: 'الوثب الطويل', input: 'distance', unit: 'م' },
    shot_put: { label: 'دفع الجلة', input: 'distance', unit: 'م' },
}
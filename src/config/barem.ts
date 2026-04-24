// src/config/bareme.ts

export type Activity = 'sprint' | 'longjump' | 'throw';
export type Gender = 'male' | 'female';

// Each entry: { performance, score }
// Sprint: performance = max time to get this score (lower is better)
// Longjump/Throw: performance = min distance to get this score (higher is better)

export const bareme: Record<Activity, Record<Gender, { performance: number; score: number }[]>> = {
  sprint: {
    male: [
      { performance: 7.60, score: 16 },
      { performance: 7.65, score: 15.50 },
      { performance: 7.70, score: 15 },
      { performance: 7.75, score: 14.50 },
      { performance: 7.80, score: 14 },
      { performance: 7.85, score: 13.50 },
      { performance: 7.90, score: 13 },
      { performance: 7.95, score: 12.50 },
      { performance: 8.00, score: 12 },
      { performance: 8.10, score: 11.50 },
      { performance: 8.20, score: 11 },
      { performance: 8.30, score: 10.50 },
      { performance: 8.40, score: 10 },
      { performance: 8.50, score: 9.50 },
      { performance: 8.60, score: 9 },
      { performance: 8.70, score: 8.50 },
      { performance: 8.80, score: 8 },
      { performance: 8.90, score: 7.50 },
      { performance: 9.00, score: 7 },
      { performance: 9.10, score: 6.50 },
      { performance: 9.20, score: 6 },
      { performance: 9.30, score: 5.50 },
      { performance: 9.40, score: 5 },
      { performance: 9.50, score: 4.50 },
      { performance: 9.60, score: 4 },
      { performance: 9.80, score: 3.50 },
      { performance: 10.00, score: 3 },
      { performance: 10.20, score: 2.50 },
      { performance: 10.40, score: 2 },
      { performance: 10.60, score: 1.50 },
      { performance: 10.80, score: 1 },
      { performance: 10.90, score: 0.50 },
    ],
    female: [
      { performance: 9.60, score: 16 },
      { performance: 9.65, score: 15.50 },
      { performance: 9.70, score: 15 },
      { performance: 9.75, score: 14.50 },
      { performance: 9.80, score: 14 },
      { performance: 9.85, score: 13.50 },
      { performance: 9.90, score: 13 },
      { performance: 9.95, score: 12.50 },
      { performance: 10.00, score: 12 },
      { performance: 10.10, score: 11.50 },
      { performance: 10.20, score: 11 },
      { performance: 10.30, score: 10.50 },
      { performance: 10.40, score: 10 },
      { performance: 10.50, score: 9.50 },
      { performance: 10.60, score: 9 },
      { performance: 10.70, score: 8.50 },
      { performance: 10.80, score: 8 },
      { performance: 10.90, score: 7.50 },
      { performance: 11.00, score: 7 },
      { performance: 11.10, score: 6.50 },
      { performance: 11.20, score: 6 },
      { performance: 11.30, score: 5.50 },
      { performance: 11.40, score: 5 },
      { performance: 11.50, score: 4.50 },
      { performance: 11.60, score: 4 },
      { performance: 11.80, score: 3.50 },
      { performance: 12.00, score: 3 },
      { performance: 12.20, score: 2.50 },
      { performance: 12.40, score: 2 },
      { performance: 12.60, score: 1.50 },
      { performance: 12.80, score: 1 },
      { performance: 12.90, score: 0.50 },
    ],
  },
  longjump: {
    male: [
      { performance: 5.50, score: 16 },
      { performance: 5.45, score: 15.50 },
      { performance: 5.40, score: 15 },
      { performance: 5.35, score: 14.50 },
      { performance: 5.30, score: 14 },
      { performance: 5.25, score: 13.50 },
      { performance: 5.20, score: 13 },
      { performance: 5.15, score: 12.50 },
      { performance: 5.10, score: 12 },
      { performance: 5.00, score: 11.50 },
      { performance: 4.90, score: 11 },
      { performance: 4.80, score: 10.50 },
      { performance: 4.70, score: 10 },
      { performance: 4.60, score: 9.50 },
      { performance: 4.50, score: 9 },
      { performance: 4.40, score: 8.50 },
      { performance: 4.30, score: 8 },
      { performance: 4.20, score: 7.50 },
      { performance: 4.10, score: 7 },
      { performance: 4.00, score: 6.50 },
      { performance: 3.90, score: 6 },
      { performance: 3.80, score: 5.50 },
      { performance: 3.70, score: 5 },
      { performance: 3.60, score: 4.50 },
      { performance: 3.50, score: 4 },
      { performance: 3.35, score: 3.50 },
      { performance: 3.20, score: 3 },
      { performance: 3.05, score: 2.50 },
      { performance: 2.95, score: 2 },
      { performance: 2.65, score: 1.50 },
      { performance: 2.50, score: 1 },
      { performance: 2.35, score: 0.50 },
    ],
    female: [
      { performance: 3.70, score: 16 },
      { performance: 3.65, score: 15.50 },
      { performance: 3.60, score: 15 },
      { performance: 3.55, score: 14.50 },
      { performance: 3.50, score: 14 },
      { performance: 3.45, score: 13.50 },
      { performance: 3.40, score: 13 },
      { performance: 3.35, score: 12.50 },
      { performance: 3.30, score: 12 },
      { performance: 3.20, score: 11.50 },
      { performance: 3.10, score: 11 },
      { performance: 3.00, score: 10.50 },
      { performance: 2.90, score: 10 },
      { performance: 2.80, score: 9.50 },
      { performance: 2.70, score: 9 },
      { performance: 2.60, score: 8.50 },
      { performance: 2.50, score: 8 },
      { performance: 2.40, score: 7.50 },
      { performance: 2.30, score: 7 },
      { performance: 2.20, score: 6.50 },
      { performance: 2.10, score: 6 },
      { performance: 2.00, score: 5.50 },
      { performance: 1.90, score: 5 },
      { performance: 1.80, score: 4.50 },
      { performance: 1.70, score: 4 },
      { performance: 1.55, score: 3.50 },
      { performance: 1.40, score: 3 },
      { performance: 1.25, score: 2.50 },
      { performance: 1.10, score: 2 },
      { performance: 0.95, score: 1.50 },
      { performance: 0.80, score: 1 },
      { performance: 0.65, score: 0.50 },
    ],
  },
  throw: {
    male: [
      { performance: 10.90, score: 16 },
      { performance: 10.80, score: 15.50 },
      { performance: 10.70, score: 15 },
      { performance: 10.60, score: 14.50 },
      { performance: 10.40, score: 14 },
      { performance: 10.30, score: 13.50 },
      { performance: 10.20, score: 13 },
      { performance: 10.10, score: 12.50 },
      { performance: 10.00, score: 12 },
      { performance: 9.85, score: 11.50 },
      { performance: 9.70, score: 11 },
      { performance: 9.55, score: 10.50 },
      { performance: 9.40, score: 10 },
      { performance: 9.25, score: 9.50 },
      { performance: 9.10, score: 9 },
      { performance: 8.95, score: 8.50 },
      { performance: 8.80, score: 8 },
      { performance: 8.75, score: 7.50 },
      { performance: 8.60, score: 7 },
      { performance: 8.55, score: 6.50 },
      { performance: 8.40, score: 6 },
      { performance: 8.15, score: 5.50 },
      { performance: 7.05, score: 5 },
      { performance: 6.80, score: 4.50 },
      { performance: 6.75, score: 4 },
      { performance: 7.55, score: 3.50 },
      { performance: 7.35, score: 3 },
      { performance: 6.15, score: 2.50 },
      { performance: 5.95, score: 2 },
      { performance: 5.75, score: 1.50 },
      { performance: 5.55, score: 1 },
      { performance: 5.35, score: 0.50 },
    ],
    female: [
      { performance: 7.50, score: 16 },
      { performance: 7.40, score: 15.50 },
      { performance: 7.30, score: 15 },
      { performance: 7.20, score: 14.50 },
      { performance: 7.10, score: 14 },
      { performance: 7.00, score: 13.50 },
      { performance: 6.90, score: 13 },
      { performance: 6.80, score: 12.50 },
      { performance: 6.70, score: 12 },
      { performance: 6.55, score: 11.50 },
      { performance: 6.40, score: 11 },
      { performance: 6.25, score: 10.50 },
      { performance: 6.10, score: 10 },
      { performance: 5.95, score: 9.50 },
      { performance: 5.80, score: 9 },
      { performance: 5.65, score: 8.50 },
      { performance: 5.50, score: 8 },
      { performance: 5.35, score: 7.50 },
      { performance: 5.20, score: 7 },
      { performance: 5.05, score: 6.50 },
      { performance: 4.90, score: 6 },
      { performance: 4.75, score: 5.50 },
      { performance: 4.60, score: 5 },
      { performance: 4.45, score: 4.50 },
      { performance: 4.30, score: 4 },
      { performance: 4.10, score: 3.50 },
      { performance: 3.90, score: 3 },
      { performance: 3.70, score: 2.50 },
      { performance: 3.50, score: 2 },
      { performance: 3.30, score: 1.50 },
      { performance: 3.10, score: 1 },
      { performance: 2.90, score: 0.50 },
    ],
  },
};

// lookup function
export const getScore = (activity: Activity, gender: Gender, performance: number): number => {
  const table = bareme[activity][gender];
  if (activity === 'sprint') {
    // lower is better
    if (performance <= table[0].performance) return 16;
    for (const entry of table) {
      if (performance <= entry.performance) return entry.score;
    }
    return 0.50;
  } else {
    // higher is better
    if (performance >= table[0].performance) return 16;
    for (const entry of table) {
      if (performance >= entry.performance) return entry.score;
    }
    return 0.50;
  }
};

// now that for tatawor

export const tawaorBareme: Record<Activity, { performance: number; score: number }[]> = {
  sprint: [
    { performance: 0.40, score: 4 },
    { performance: 0.30, score: 3.5 },
    { performance: 0.25, score: 3 },
    { performance: 0.20, score: 2.5 },
    { performance: 0.15, score: 2 },
    { performance: 0.10, score: 1.5 },
    { performance: 0.05, score: 1 },
    { performance: 0.01, score: 0.5 },
  ],
  longjump: [
    { performance: 70, score: 4 },
    { performance: 60, score: 3.5 },
    { performance: 50, score: 3 },
    { performance: 40, score: 2.5 },
    { performance: 30, score: 2 },
    { performance: 20, score: 1.5 },
    { performance: 10, score: 1 },
    { performance: 1, score: 0.5 },
  ],
  throw: [
    { performance: 35, score: 4 },
    { performance: 30, score: 3.5 },
    { performance: 25, score: 3 },
    { performance: 20, score: 2.5 },
    { performance: 15, score: 2 },
    { performance: 10, score: 1.5 },
    { performance: 5, score: 1 },
    { performance: 1, score: 0.5 },
  ],
};

export const getTawaorScore = (activity: Activity, tatawaor: number): number => {
  if (tatawaor <= 0) return 0;
  const table = tawaorBareme[activity];
  if (tatawaor >= table[0].performance) return 4;
  for (const entry of table) {
    if (tatawaor >= entry.performance) return entry.score;
  }
  return 0.5;
};
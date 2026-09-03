// src/config/ficheTechData.ts
import level1Curriculum from "@/src/config/level1Curriculum.json";
import level2Curriculum from "@/src/config/level2Curriculum.json";
import level3Curriculum from "@/src/config/level3Curriculum.json";
import sprint1 from "@/src/config/session/level1/sprint1.json";
import longJump1 from "@/src/config/session/level1/long_jump1.json";
import shoyPut1 from "@/src/config/session/level1/shoy_put.json";
import basketball1 from "@/src/config/session/level1/basketball1.json";
import handball1 from "@/src/config/session/level1/handball1.json";
import volleyball1 from "@/src/config/session/level1/volleyball1.json";
import basketball2 from "@/src/config/session/level2/basketball2.json";
import sprint2 from "@/src/config/session/level2/sprint2.json";
import shot_put2 from "@/src/config/session/level2/shot_put2.json";
import longJump2 from "@/src/config/session/level2/long_jump2.json";
import handball2 from "@/src/config/session/level2/handball2.json";
import volleyball2 from "@/src/config/session/level2/volleyball2.json";
import sprint3 from "@/src/config/session/level3/sprint3.json";
import longJump3 from "@/src/config/session/level3/long_jump3.json";
import shot_put3 from "@/src/config/session/level3/shot_put3.json";
import basketball3 from "@/src/config/session/level3/basketball3.json";
import handball3 from "@/src/config/session/level3/handball3.json";
import volleyball3 from "@/src/config/session/level3/volleyball3.json";

export type Exercise = { but: string; description: string; najah: string };
export type GoalStep = { step: number; sessionGoal: string; exercises: Exercise[] };
export type SportBank = { sport: string; level: string; indicators: { indicatorId: number; goalSteps: GoalStep[] }[] };

export type CurriculumIndicator = { id: number; text: string; goal_base: string; goals: string[] };
export type CurriculumSport = { activity: string; indicators: CurriculumIndicator[] };
export type LevelCurriculum = { kafaa_khatamia: string; sports: Record<string, CurriculumSport> };

export type PooledExercise = Exercise & { step: number; sessionGoal: string; key: string };

export type SportPickState = {
  sport: string;
  indicatorId: number | null;
  count: number;
  chosenKeys: (string | null)[];
};

export const EMPTY_PICK: SportPickState = { sport: "", indicatorId: null, count: 3, chosenKeys: [] };

function normalizeCurriculum(raw: unknown): LevelCurriculum {
  const obj = raw as Record<string, unknown>;
  if (obj && typeof obj === "object" && "sports" in obj) {
    return obj as unknown as LevelCurriculum;
  }
  const firstKey = obj ? Object.keys(obj)[0] : undefined;
  const inner = firstKey ? (obj[firstKey] as unknown) : undefined;
  return (inner as LevelCurriculum) ?? { kafaa_khatamia: "", sports: {} };
}

export const LEVEL_DATA: Record<string, { label: string; curriculum: LevelCurriculum; banks: Record<string, SportBank> }> = {
  level1: {
    label: "السنة الأولى ثانوي",
    curriculum: normalizeCurriculum(level1Curriculum),
    banks: {
      sprint: sprint1 as unknown as SportBank,
      long_jump: longJump1 as unknown as SportBank,
      shot_put: shoyPut1 as unknown as SportBank,
      basketball: basketball1 as unknown as SportBank,
      handball: handball1 as unknown as SportBank,
      volleyball: volleyball1 as unknown as SportBank,
    },
  },
  level2: {
    label: "السنة الثانية ثانوي",
    curriculum: normalizeCurriculum(level2Curriculum),
    banks: {
      sprint: sprint2 as unknown as SportBank,
      long_jump: longJump2 as unknown as SportBank,
      shot_put: shot_put2 as unknown as SportBank,
      basketball: basketball2 as unknown as SportBank,
      handball: handball2 as unknown as SportBank,
      volleyball: volleyball2 as unknown as SportBank,
    },
  },
  level3: {
    label: "السنة الثالثة ثانوي",
    curriculum: normalizeCurriculum(level3Curriculum),
    banks: {
      sprint: sprint3 as unknown as SportBank,
      long_jump: longJump3 as unknown as SportBank,
      shot_put: shot_put3 as unknown as SportBank,
      basketball: basketball3 as unknown as SportBank,
      handball: handball3 as unknown as SportBank,
      volleyball: volleyball3 as unknown as SportBank,
    },
  },
};

export const INDIVIDUAL_SPORTS = ["sprint", "long_jump", "shot_put"];
export const COLLECTIVE_SPORTS = ["basketball", "handball", "volleyball"];

export function getIndicatorOptions(curriculumSport: CurriculumSport | undefined, bank: SportBank | undefined) {
  if (!bank) return [];
  return bank.indicators.map((ind) => {
    const meta = curriculumSport?.indicators.find((c) => c.id === ind.indicatorId);
    return { id: ind.indicatorId, label: meta?.text ?? `مؤشر ${ind.indicatorId}` };
  });
}

export function poolExercises(bank: SportBank | undefined, indicatorId: number | null): PooledExercise[] {
  if (!bank || indicatorId === null) return [];
  const indicator = bank.indicators.find((i) => i.indicatorId === indicatorId);
  if (!indicator) return [];
  return indicator.goalSteps.flatMap((gs) =>
    gs.exercises.map((ex, idx) => ({
      ...ex,
      step: gs.step,
      sessionGoal: gs.sessionGoal,
      key: `${indicatorId}-${gs.step}-${idx}`,
    }))
  );
}
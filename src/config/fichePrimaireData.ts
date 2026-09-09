// src/config/fichePrimaireData.ts

// --- Curriculum imports (level x maidan) ---
import s1_alwad3iyat from "@/src/config/s1_wihda_1_alwad3iyat.json";
import s1_harakat from "@/src/config/s1_wihda_2_harakat.json";
import s1_alhaykala from "@/src/config/s1_wihda_3_alhaykala.json";
import s2_alwad3iyat from "@/src/config/s2_wihda_1_alwad3iyat.json";
import s2_harakat from "@/src/config/s2_wihda_2_harakat.json";
import s2_alhaykala from "@/src/config/s2_wihda_3_alhaykala.json";
import s3_alwad3iyat from "@/src/config/s3_wihda_1_alwad3iyat.json";
import s3_harakat from "@/src/config/s3_wihda_2_harakat.json";
import s3_alhaykala from "@/src/config/s3_wihda_3_alhaykala.json";
import s4_alwad3iyat from "@/src/config/s4_wihda_1_alwad3iyat.json";
import s4_harakat from "@/src/config/s4_wihda_2_harakat.json";
import s4_alhaykala from "@/src/config/s4_wihda_3_alhaykala.json";
import s5_alwad3iyat from "@/src/config/s5_wihda_1_alwad3iyat.json";
import s5_harakat from "@/src/config/s5_wihda_2_harakat.json";
import s5_alhaykala from "@/src/config/s5_wihda_3_alhaykala.json";

// --- Exercises imports (level x maidan) ---
// Only level1/alwad3iyat exists so far — add each import as you create the file,
// same pattern, and add its entry in MAIDAN_KEYS map below.
import ex_s1_alwad3iyat from "@/src/config/sessionP/level1/maidan1.json";
import ex_s2_alwad3iyat from "@/src/config/sessionP/level2/maidan1.json";
import ex_s3_alwad3iyat from "@/src/config/sessionP/level3/maidan1.json";

export interface CurriculumSession {
  type: string;
  unit_name: string;
  kafa_components: string;
  knowledge_resources: string;
  learning_content: string;
  execution_content: string;
  guidelines: string;
}

export interface CurriculumFile {
  level: string;
  level_name: string;
  maidan_id: number;
  maidan_name: string;
  kafa_khitamya: string;
  sessions: CurriculumSession[];
}

export interface SessionExercise {
  id: string;
  unit_name: string;
  number: number;
  title: string;
  duration: number;
  mohtawaTaalum: string;
  mohtawaInjaz: string;
  tachkilat: string;
  tawjihat: string;
}

interface MaidanEntry {
  key: string;   // "alwad3iyat" | "harakat" | "alhaykala"
  label: string;
  curriculum: CurriculumFile;
  exercises: SessionExercise[];
}

interface LevelEntry {
  key: string;
  label: string;
  maidans: MaidanEntry[];
}

// helper: safely cast + fall back to empty exercises array if not yet created
const asCurriculum = (j: unknown) => j as CurriculumFile;
const asExercises = (j: unknown | undefined) => (j as SessionExercise[] | undefined) ?? [];

function buildLevel(key: string, label: string, files: {
  alwad3iyat: unknown; harakat: unknown; alhaykala: unknown;
  ex_alwad3iyat?: unknown; ex_harakat?: unknown; ex_alhaykala?: unknown;
}): LevelEntry {
  return {
    key,
    label,
    maidans: [
      { key: "alwad3iyat", label: asCurriculum(files.alwad3iyat).maidan_name, curriculum: asCurriculum(files.alwad3iyat), exercises: asExercises(files.ex_alwad3iyat) },
      { key: "harakat", label: asCurriculum(files.harakat).maidan_name, curriculum: asCurriculum(files.harakat), exercises: asExercises(files.ex_harakat) },
      { key: "alhaykala", label: asCurriculum(files.alhaykala).maidan_name, curriculum: asCurriculum(files.alhaykala), exercises: asExercises(files.ex_alhaykala) },
    ],
  };
}

export const LEVEL_DATA_P: LevelEntry[] = [
  buildLevel("level1", "السنة الأولى ابتدائي", {
    alwad3iyat: s1_alwad3iyat, harakat: s1_harakat, alhaykala: s1_alhaykala,
    ex_alwad3iyat: ex_s1_alwad3iyat,
  }),
  buildLevel("level2", "السنة الثانية ابتدائي", { alwad3iyat: s2_alwad3iyat, harakat: s2_harakat, alhaykala: s2_alhaykala,
    ex_alwad3iyat: ex_s2_alwad3iyat, }),
  buildLevel("level3", "السنة الثالثة ابتدائي", { alwad3iyat: s3_alwad3iyat, harakat: s3_harakat, alhaykala: s3_alhaykala,
    ex_alwad3iyat: ex_s3_alwad3iyat,
   }),
  buildLevel("level4", "السنة الرابعة ابتدائي", { alwad3iyat: s4_alwad3iyat, harakat: s4_harakat, alhaykala: s4_alhaykala }),
  buildLevel("level5", "السنة الخامسة ابتدائي", { alwad3iyat: s5_alwad3iyat, harakat: s5_harakat, alhaykala: s5_alhaykala }),
];

export function getMaidan(levelKey: string, maidanKey: string) {
  return LEVEL_DATA_P.find((l) => l.key === levelKey)?.maidans.find((m) => m.key === maidanKey);
}

export function getSessions(levelKey: string, maidanKey: string): CurriculumSession[] {
  return getMaidan(levelKey, maidanKey)?.curriculum.sessions ?? [];
}

export function getExercisePool(levelKey: string, maidanKey: string, unitName: string | null): SessionExercise[] {
  if (!unitName) return [];
  return (getMaidan(levelKey, maidanKey)?.exercises ?? [])
    .filter((e) => e.unit_name === unitName)
    .sort((a, b) => a.number - b.number);
}

export interface SessionPickState {
  maidan: string;
  unitName: string | null;
  count: number;
  chosenIds: (string | null)[];
}

export const EMPTY_PICK_P: SessionPickState = { maidan: "", unitName: null, count: 1, chosenIds: [] };
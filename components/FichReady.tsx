"use client";

// "بطاقة جاهزة": one fiche per LEVEL, filled automatically from the saved وحدة
// and from the الدفتر اليومي (same session count as DaftarPending: done sessions + 1).
// Read only: it never writes anything, it only prepares the wizard state.

import { useEffect, useMemo, useState } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useDailyLogLycee } from "@/hooks/useDailyLogLycee";
import type { ISession } from "@/app/models/WahdaDoc";
import { getLevelKeyFromClass } from "@/src/config/lyceeCurriculumRegistry";
import { isoLocal, trimesterOf } from "@/src/lib/daftarUtils";
import {
  LEVEL_DATA, INDIVIDUAL_SPORTS, COLLECTIVE_SPORTS, poolExercises,
  type SportPickState,
} from "@/src/config/ficheTechData";
import { type UnitChoice, UNIT_DIAGNOSTIC, UNIT_SUMMATIVE } from "@/components/FicheTechConfig";

export type ReadyConfig = {
  level: string;
  sessionNumber: UnitChoice;
  individual: SportPickState;
  collective: SportPickState;
  fields: Record<string, string>;
};

type WahdaLite = { level: string; sport: string; sessions: ISession[]; updatedAt?: string };
type Kind = "diag" | "sum" | "bini" | "learn";

// same list as DaftarPending: تشخيصي + sessions of the وحدة + تحصيلي
const buildFullSessions = (sessions: ISession[]): ISession[] => [
  { sessionNumber: 0, indicatorId: -1, indicatorText: "", goal: "تقويم تشخيصي: إجراء منافسة مصغرة وتسجيل النتائج", specialGoal: "تقويم تشخيصي", isReminder: false },
  ...sessions.map((s) => ({ ...s, indicatorId: Number(s.indicatorId), sessionNumber: Number(s.sessionNumber) })),
  { sessionNumber: 0, indicatorId: -2, indicatorText: "", goal: "تقويم تحصيلي: إجراء منافسة نهائية تطبيقية وتحصيل العلامات", specialGoal: "تقويم تحصيلي", isReminder: false },
];

const kindOf = (s: ISession): Kind =>
  s.indicatorId === -1 ? "diag" : s.indicatorId === -2 ? "sum" : s.sessionNumber === 0 ? "bini" : "learn";

const labelOf = (s: ISession): string => {
  const k = kindOf(s);
  if (k === "diag") return "تقويم تشخيصي";
  if (k === "sum") return "تقويم تحصيلي";
  if (k === "bini") return "تقويم بيني";
  return `${s.isReminder ? "حصة تذكيرية" : "تعليمية"} ${String(s.sessionNumber).padStart(2, "0")}`;
};

const SPORT_LABEL: Record<string, string> = {
  sprint: "السرعة", long_jump: "الوثب الطويل", shot_put: "رمي الجلة",
  basketball: "كرة السلة", handball: "كرة اليد", volleyball: "الكرة الطائرة",
};

// most frequent value; on a tie the smallest one (the class that is late decides)
const mode = (values: number[]): number | null => {
  if (!values.length) return null;
  const count = new Map<number, number>();
  values.forEach((v) => count.set(v, (count.get(v) ?? 0) + 1));
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
};

/* ---------- build the wizard state from a session ---------- */

function learningPick(levelKey: string, sport: string, full: ISession[], idx: number): SportPickState {
  const s = full[idx];
  const pool = poolExercises(LEVEL_DATA[levelKey]?.banks[sport], s.indicatorId);
  // 1) the step whose sessionGoal is exactly the goal of the session
  let step = pool.find((e) => e.sessionGoal.trim() === s.goal.trim())?.step;
  // 2) otherwise: 1st time this indicator appears = step 1, 2nd time = step 2...
  if (step === undefined) {
    const occurrence = full.slice(0, idx + 1).filter((x) => kindOf(x) === "learn" && x.indicatorId === s.indicatorId).length;
    const maxStep = Math.max(1, ...pool.map((e) => e.step));
    step = Math.min(occurrence, maxStep);
  }
  let keys = pool.filter((e) => e.step === step).slice(0, 3).map((e) => e.key);
  if (!keys.length) keys = pool.slice(0, 3).map((e) => e.key);
  return { sport, indicatorId: s.indicatorId, indicatorIds: [], batteryChosen: {}, count: keys.length || 3, chosenKeys: keys };
}

function batteryPick(levelKey: string, sport: string, full: ISession[], kind: "diag" | "sum"): SportPickState {
  const bank = LEVEL_DATA[levelKey]?.banks[sport];
  const inBank = (id: number) => !!bank?.indicators.some((i) => i.indicatorId === id);
  const ids: number[] = [];
  full.forEach((s) => { if (kindOf(s) === "learn" && inBank(s.indicatorId) && !ids.includes(s.indicatorId)) ids.push(s.indicatorId); });
  bank?.indicators.forEach((i) => { if (ids.length < 4 && !ids.includes(i.indicatorId)) ids.push(i.indicatorId); });
  const batteryChosen: Record<number, string | null> = {};
  ids.forEach((id) => {
    const pool = poolExercises(bank, id);
    const steps = pool.map((e) => e.step);
    const step = kind === "diag" ? Math.min(...steps) : Math.max(...steps);
    batteryChosen[id] = pool.find((e) => e.step === step)?.key ?? pool[0]?.key ?? null;
  });
  return { sport, indicatorId: null, indicatorIds: ids, batteryChosen, count: 3, chosenKeys: [] };
}

function firstLearningFrom(full: ISession[], idx: number): number {
  for (let i = idx; i < full.length; i++) if (kindOf(full[i]) === "learn") return i;
  for (let i = idx; i >= 0; i--) if (kindOf(full[i]) === "learn") return i;
  return -1;
}

/* ---------- component ---------- */

type Part = { sport: string; full: ISession[]; idx: number } | null;

export default function FicheReady({ onOpen }: { onOpen: (cfg: ReadyConfig) => void }) {
  const { classes } = useClasses();
  const { entries } = useDailyLogLycee();
  const trimester = String(trimesterOf(isoLocal(new Date())));

  const [wahdas, setWahdas] = useState<WahdaLite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pick, setPick] = useState<Record<string, number>>({}); // manual change of the session

  useEffect(() => {
    let ignore = false;
    fetch(`/api/wahda-ready?trimester=${trimester}`)
      .then((r) => r.json())
      .then((d) => {
        if (ignore) return;
        if (d.error) setError(d.error);
        else setWahdas(d.wahdas ?? []);
      })
      .catch(() => { if (!ignore) setError("خطأ في تحميل الوحدات التعلمية"); });
    return () => { ignore = true; };
  }, [trimester]);

  const rows = useMemo(() => {
    if (!wahdas) return [];
    const list = Array.isArray(classes) ? classes : [];
    const levelOfClass = new Map(list.map((c) => [String(c._id), String(getLevelKeyFromClass(c.name, c.level))]));
    const levels = [...new Set([...levelOfClass.values(), ...wahdas.map((w) => String(w.level))])]
      .filter((l) => LEVEL_DATA[`level${l}`])
      .sort();

    const sorted = [...(entries ?? [])].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    const partFor = (level: string, sports: string[]): Part => {
      const classIds = [...levelOfClass.entries()].filter(([, l]) => l === level).map(([id]) => id);
      // sport = the one used last in the الدفتر by most classes of this level
      const used: string[] = [];
      classIds.forEach((id) => {
        const last = [...sorted].reverse().find((e) => String(e.classId) === id && !!e.sport && sports.includes(e.sport));
        if (last?.sport) used.push(last.sport);
      });
      const fromDaftar = used.length
        ? [...new Set(used)].sort((a, b) => used.filter((x) => x === b).length - used.filter((x) => x === a).length)[0]
        : null;
      const docs = wahdas.filter((w) => String(w.level) === level && sports.includes(w.sport) && w.sessions?.length);
      const doc = (fromDaftar && docs.find((w) => w.sport === fromDaftar))
        || [...docs].sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")))[0];
      if (!doc) return null;

      const full = buildFullSessions(doc.sessions);
      // same rule as DaftarPending: done sessions of this sport in this trimester + 1
      const next = classIds.map((id) =>
        sorted.filter((e) => String(e.classId) === id && e.sport === doc.sport && e.done && String(trimesterOf(e.date)) === trimester).length
      );
      const idx = Math.min(mode(next) ?? 0, full.length - 1);
      return { sport: doc.sport, full, idx };
    };

    return levels.map((level) => ({
      level,
      individual: partFor(level, INDIVIDUAL_SPORTS),
      collective: partFor(level, COLLECTIVE_SPORTS),
    }));
  }, [wahdas, classes, entries, trimester]);

  const open = (level: string, ind: Part, col: Part) => {
    const levelKey = `level${level}`;
    const main = ind ?? col!;
    const mainIdx = pick[`${level}|ind`] ?? main.idx;
    const kind = kindOf(main.full[mainIdx]);
    const battery = kind === "diag" || kind === "sum" || kind === "bini";
    const bKind: "diag" | "sum" = kind === "diag" ? "diag" : "sum";

    const build = (part: Part, key: string): { state: SportPickState; goal: string } => {
      if (!part) return { state: { sport: "", indicatorId: null, indicatorIds: [], batteryChosen: {}, count: 3, chosenKeys: [] }, goal: "" };
      const idx = pick[key] ?? part.idx;
      if (battery) return { state: batteryPick(levelKey, part.sport, part.full, bKind), goal: part.full[idx]?.goal ?? "" };
      const li = firstLearningFrom(part.full, idx);
      if (li < 0) return { state: batteryPick(levelKey, part.sport, part.full, "sum"), goal: "" };
      return { state: learningPick(levelKey, part.sport, part.full, li), goal: part.full[li].goal };
    };

    const i = build(ind, `${level}|ind`);
    const c = build(col, `${level}|col`);
    const s = main.full[mainIdx];
    const sessionNumber: UnitChoice = kind === "diag" ? UNIT_DIAGNOSTIC
      : battery ? UNIT_SUMMATIVE
        : s.sessionNumber;

    onOpen({
      level: levelKey,
      sessionNumber,
      individual: i.state,
      collective: c.state,
      // only non-empty values: an empty field keeps the normal default of the sheet
      fields: Object.fromEntries(Object.entries({ goal_ind: i.goal, goal_col: c.goal }).filter(([, v]) => v.trim())),
    });
  };

  if (error) return <p style={{ fontSize: 13, color: "#B03030" }}>{error}</p>;
  if (!wahdas) return <p style={{ fontSize: 13, color: "#7A8471" }}>⏳ جاري تحضير البطاقات...</p>;
  if (!rows.length) {
    return <p style={{ fontSize: 13, color: "#7A8471" }}>لا توجد وحدات تعلمية محفوظة لهذا الفصل. أنشئ الوحدة التعلمية أولاً ثم ارجع هنا.</p>;
  }

  const partLine = (title: string, part: Part, key: string) => {
    if (!part) {
      return (
        <div style={{ fontSize: 12, color: "#B07020", fontWeight: 700 }}>
          {title}: لا توجد وحدة تعلمية محفوظة لهذا النشاط
        </div>
      );
    }
    const idx = pick[key] ?? part.idx;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{title}: {SPORT_LABEL[part.sport] ?? part.sport}</span>
        <select
          value={idx}
          onChange={(e) => setPick((p) => ({ ...p, [key]: Number(e.target.value) }))}
          style={{ padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, background: "#fff" }}
        >
          {part.full.map((s, i) => (
            <option key={i} value={i}>الحصة {i + 1} · {labelOf(s)}</option>
          ))}
        </select>
        <span style={{ fontSize: 11.5, color: "#555" }}>{part.full[idx]?.goal}</span>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
      {rows.map(({ level, individual, collective }) => (
        <div key={level} className="panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 className="panel-title" style={{ margin: 0 }}>{LEVEL_DATA[`level${level}`].label}</h3>
          {partLine("النشاط الفردي", individual, `${level}|ind`)}
          {partLine("النشاط الجماعي", collective, `${level}|col`)}
          <button
            className="btn btn-primary"
            style={{ justifyContent: "center" }}
            disabled={!individual && !collective}
            onClick={() => open(level, individual, collective)}
          >
            📄 افتح البطاقة الجاهزة
          </button>
        </div>
      ))}
    </div>
  );
}
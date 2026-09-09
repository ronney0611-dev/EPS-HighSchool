"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { LEVEL_DATA_P, getSessions, getExercisePool, type SessionPickState } from "@/src/config/fichePrimaireData";

export default function FicheTechConfigP({
  level,
  setLevel,
  pick,
  setPick,
  onNext,
}: {
  level: string;
  setLevel: (v: string) => void;
  pick: SessionPickState;
  setPick: (v: SessionPickState) => void;
  onNext: () => void;
}) {
  const levelData = LEVEL_DATA_P.find((l) => l.key === level)!;
  const sessions = useMemo(() => getSessions(level, pick.maidan), [level, pick.maidan]);
  const pool = useMemo(() => getExercisePool(level, pick.maidan, pick.unitName), [level, pick.maidan, pick.unitName]);

  const inputStyle = "w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none";

  const canProceed = !!pick.maidan && !!pick.unitName && pick.chosenIds.filter(Boolean).length === pick.count;

  const handleLevelChange = (v: string) => {
    setLevel(v);
    setPick({ maidan: "", unitName: null, count: 1, chosenIds: [] });
  };

  const handleMaidanChange = (maidan: string) => {
    setPick({ maidan, unitName: null, count: 1, chosenIds: [] });
  };

  const handleUnitChange = (unitName: string) => {
    setPick({ ...pick, unitName, count: 1, chosenIds: [] });
  };

  const handleCountChange = (count: number) => {
    setPick({ ...pick, count, chosenIds: Array.from({ length: count }, (_, i) => pick.chosenIds[i] ?? null) });
  };

  const handleSlotChange = (slotIdx: number, id: string) => {
    const chosenIds = [...pick.chosenIds];
    chosenIds[slotIdx] = id;
    setPick({ ...pick, chosenIds });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between text-lg font-medium text-red-600">
        <span>الخطوة 1 من 2 — إعداد المذكرة</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-xs font-medium">
          <span>المستوى</span>
          <select value={level} onChange={(e) => handleLevelChange(e.target.value)} className={`${inputStyle} mt-1`}>
            {LEVEL_DATA_P.map((l) => (
              <option key={l.key} value={l.key}>{l.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium">
          <span>الميدان</span>
          <select value={pick.maidan} onChange={(e) => handleMaidanChange(e.target.value)} className={`${inputStyle} mt-1`}>
            <option value="">— اختر —</option>
            {levelData.maidans.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
      </div>

      {pick.maidan && (
        <label className="block text-xs font-medium">
          <span>الحصة (الوحدة التعليمية)</span>
          <select value={pick.unitName ?? ""} onChange={(e) => handleUnitChange(e.target.value)} className={`${inputStyle} mt-1`}>
            <option value="">— اختر —</option>
            {sessions.map((s) => (
              <option key={s.unit_name} value={s.unit_name}>{s.unit_name}</option>
            ))}
          </select>
        </label>
      )}

      {pick.unitName && pool.length > 0 && (
        <label className="block text-xs font-medium">
          <span>عدد التمارين</span>
          <select value={pick.count} onChange={(e) => handleCountChange(Number(e.target.value))} className={`${inputStyle} mt-1`}>
            {Array.from({ length: pool.length }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      )}

      {pick.unitName &&
        Array.from({ length: pick.count }).map((_, slotIdx) => {
          const takenElsewhere = pick.chosenIds.filter((id, i) => i !== slotIdx);
          const options = pool.filter((ex) => !takenElsewhere.includes(ex.id) || ex.id === pick.chosenIds[slotIdx]);
          return (
            <label className="block text-xs font-medium" key={slotIdx}>
              <span>التمرين {slotIdx + 1}</span>
              <select value={pick.chosenIds[slotIdx] ?? ""} onChange={(e) => handleSlotChange(slotIdx, e.target.value)} className={`${inputStyle} mt-1`}>
                <option value="">— اختر —</option>
                {options.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.title}</option>
                ))}
              </select>
            </label>
          );
        })}

      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          التالي <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}
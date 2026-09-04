"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import {
  LEVEL_DATA,
  INDIVIDUAL_SPORTS,
  COLLECTIVE_SPORTS,
  getIndicatorOptions,
  poolExercises,
  type SportPickState,
  type LevelCurriculum,
  type SportBank,
} from "@/src/config/ficheTechData";

function SportPanel({
  title,
  sportKeys,
  curriculum,
  banks,
  value,
  onChange,
}: {
  title: string;
  sportKeys: string[];
  curriculum: LevelCurriculum;
  banks: Record<string, SportBank>;
  value: SportPickState;
  onChange: (next: SportPickState) => void;
}) {
  const bank = banks?.[value.sport];
  const curriculumSport = curriculum?.sports?.[value.sport];
  const indicatorOptions = useMemo(() => getIndicatorOptions(curriculumSport, bank), [curriculumSport, bank]);
  const pool = useMemo(() => poolExercises(bank, value.indicatorId), [bank, value.indicatorId]);

  const handleSportChange = (sport: string) => {
    onChange({ sport, indicatorId: null, count: 3, chosenKeys: [] });
  };

  const handleIndicatorChange = (indicatorId: number) => {
    onChange({ ...value, indicatorId, chosenKeys: [] });
  };

  const handleCountChange = (count: number) => {
    onChange({ ...value, count, chosenKeys: Array.from({ length: count }, (_, i) => value.chosenKeys[i] ?? null) });
  };

  const handleSlotChange = (slotIdx: number, key: string) => {
    const chosenKeys = [...value.chosenKeys];
    chosenKeys[slotIdx] = key;
    onChange({ ...value, chosenKeys });
  };

  const selectStyle = "w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none";

  return (
    <div className="rounded-xl border border-neutral-800 bg-black/40 p-4 space-y-4 ">
      <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-2">{title}</h3>

      <div className="space-y-3">
        <label className="block text-xs font-medium text-black">
          <span>الرياضة</span>
          <select value={value.sport} onChange={(e) => handleSportChange(e.target.value)} className={`${selectStyle} mt-1`}>
            <option value="">— اختر —</option>
            {sportKeys.map((k) => (
              <option key={k} value={k}>
                {curriculum?.sports?.[k]?.activity ?? k}
              </option>
            ))}
          </select>
        </label>

        {value.sport && (
          <label className="block text-xs font-medium text-black">
            <span>المؤشر</span>
            <select value={value.indicatorId ?? ""} onChange={(e) => handleIndicatorChange(Number(e.target.value))} className={`${selectStyle} mt-1`}>
              <option value="">— اختر —</option>
              {indicatorOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {value.indicatorId !== null && pool.length > 0 && (
          <label className="block text-xs font-medium text-black">
            <span>عدد التمارين</span>
            <select value={value.count} onChange={(e) => handleCountChange(Number(e.target.value))} className={`${selectStyle} mt-1`}>
              {Array.from({ length: pool.length }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}

        {value.indicatorId !== null &&
          Array.from({ length: value.count }).map((_, slotIdx) => {
            const takenElsewhere = value.chosenKeys.filter((k, i) => i !== slotIdx);
            const options = pool.filter((ex) => !takenElsewhere.includes(ex.key) || ex.key === value.chosenKeys[slotIdx]);
            return (
              <label className="block text-xs font-medium text-black" key={slotIdx}>
                <span>التمرين {slotIdx + 1}</span>
                <select value={value.chosenKeys[slotIdx] ?? ""} onChange={(e) => handleSlotChange(slotIdx, e.target.value)} className={`${selectStyle} mt-1`}>
                  <option value="">— اختر —</option>
                  {options.map((ex) => (
                    <option key={ex.key} value={ex.key}>
                      {ex.but}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
      </div>
    </div>
  );
}

export default function FicheTechConfig({
  level,
  setLevel,
  sessionNumber,
  setSessionNumber,
  individual,
  setIndividual,
  collective,
  setCollective,
  onNext,
}: {
  level: string;
  setLevel: (v: string) => void;
  sessionNumber: number;
  setSessionNumber: (v: number) => void;
  individual: SportPickState;
  setIndividual: (v: SportPickState) => void;
  collective: SportPickState;
  setCollective: (v: SportPickState) => void;
  canProceed: boolean;
  onNext: () => void;
}) {
  const levelData = LEVEL_DATA[level];
  const inputStyle = "w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none";

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between text-lg font-medium text-red-600">
        <span>الخطوة 1 من 2 — إعداد المذكرة</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-xs font-medium text-black">
          <span>المستوى</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={`${inputStyle} mt-1`}>
            {Object.entries(LEVEL_DATA).map(([key, d]) => (
              <option key={key} value={key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-black">
          <span> الوحدة التعلمية رقم</span>
          <select value={sessionNumber} onChange={(e) => setSessionNumber(Number(e.target.value))} className={`${inputStyle} mt-1`}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SportPanel
          title="النشاط الفردي"
          sportKeys={INDIVIDUAL_SPORTS}
          curriculum={levelData.curriculum}
          banks={levelData.banks}
          value={individual}
          onChange={setIndividual}
        />
        <SportPanel
          title="النشاط الجماعي"
          sportKeys={COLLECTIVE_SPORTS}
          curriculum={levelData.curriculum}
          banks={levelData.banks}
          value={collective}
          onChange={setCollective}
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          التالي <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}
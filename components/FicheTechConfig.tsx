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
  isBattery,
}: {
  title: string;
  sportKeys: string[];
  curriculum: LevelCurriculum;
  banks: Record<string, SportBank>;
  value: SportPickState;
  onChange: (next: SportPickState) => void;
  isBattery: boolean;
}) {
  const bank = banks?.[value.sport];
  const curriculumSport = curriculum?.sports?.[value.sport];
  const indicatorOptions = useMemo(() => getIndicatorOptions(curriculumSport, bank), [curriculumSport, bank]);
  const pool = useMemo(() => poolExercises(bank, value.indicatorId), [bank, value.indicatorId]);

  const handleSportChange = (sport: string) => {
    onChange({ sport, indicatorId: null, indicatorIds: [], batteryChosen: {}, count: 3, chosenKeys: [] });
  };

  const toggleIndicator = (id: number) => {
    const has = value.indicatorIds.includes(id);
    if (has) {
      const indicatorIds = value.indicatorIds.filter((x) => x !== id);
      const batteryChosen = { ...value.batteryChosen };
      delete batteryChosen[id];
      onChange({ ...value, indicatorIds, batteryChosen });
    } else {
      onChange({ ...value, indicatorIds: [...value.indicatorIds, id] });
    }
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
              <option key={k} value={k}>{curriculum?.sports?.[k]?.activity ?? k}</option>
            ))}
          </select>
        </label>

        {value.sport && isBattery && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-sm font-semibold text-white">
                المؤشرات والتمارين المقترحة
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1.5 rounded-xl bg-neutral-950/50 border border-neutral-800 p-2.5">
              {indicatorOptions.map((opt) => {
                const checked = value.indicatorIds.includes(opt.id);
                const exOptions = poolExercises(bank, opt.id);

                return (
                  <div key={opt.id} className="space-y-2 p-1.5 rounded-lg hover:bg-neutral-900/40 transition">

                    <label className="flex items-start gap-3 text-xs text-white cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleIndicator(opt.id)}
                        className="sr-only" // Hidden but accessible
                      />

                      <div className={`
                        w-5 h-5 mt-0.5 rounded shrink-0 border-2 transition-colors flex items-center justify-center text-white text-[10px] font-bold
                        ${checked
                          ? 'bg-red-600 border-red-600 shadow-lg shadow-red-900/30'
                          : 'bg-neutral-900 border-neutral-600 group-hover:border-neutral-400'
                        }
                      `}>
                        {checked && "✓"}
                      </div>

                      <span className={`${checked ? 'font-semibold' : 'text-white'}`}>
                        {opt.label}
                      </span>
                    </label>

                    {checked && (
                      <div className="mr-8">
                        <select
                          value={value.batteryChosen[opt.id] ?? ""}
                          onChange={(e) => onChange({ ...value, batteryChosen: { ...value.batteryChosen, [opt.id]: e.target.value } })}
                          className={`
                            ${selectStyle} 
                            w-full text-xs font-medium bg-neutral-950/80! border-red-900/60! p-2! rounded-lg!
                            focus:border-red-500! focus:ring-red-500/20!
                          `}
                        >
                          <option value="" className="text-slate-500">— اختر تمرينا خاصا بهذا المؤشر —</option>
                          {exOptions.map((ex) => (
                            <option key={ex.key} value={ex.key} className="text-white bg-slate-950">
                              {ex.but}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {value.sport && !isBattery && (
          <label className="block text-xs font-medium text-black">
            <span>المؤشر</span>
            <select value={value.indicatorId ?? ""} onChange={(e) => handleIndicatorChange(Number(e.target.value))} className={`${selectStyle} mt-1`}>
              <option value="">— اختر —</option>
              {indicatorOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </label>
        )}

        {!isBattery && value.indicatorId !== null && pool.length > 0 && (
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

        {!isBattery && value.indicatorId !== null &&
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

export const UNIT_DIAGNOSTIC = "تقويم تشخيصي" as const;
export const UNIT_SUMMATIVE = "تقويم تحصيلي" as const;
export type UnitChoice = number | typeof UNIT_DIAGNOSTIC | typeof UNIT_SUMMATIVE;
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
  sessionNumber: UnitChoice;
  setSessionNumber: (v: UnitChoice) => void;
  individual: SportPickState;
  setIndividual: (v: SportPickState) => void;
  collective: SportPickState;
  setCollective: (v: SportPickState) => void;
  canProceed: boolean;
  onNext: () => void;
}) {
  const levelData = LEVEL_DATA[level];
  const inputStyle = "w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none";
  const isBattery = sessionNumber === UNIT_DIAGNOSTIC || sessionNumber === UNIT_SUMMATIVE;

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
          <select
            value={sessionNumber}
            onChange={(e) => {
              const v = e.target.value;
              setSessionNumber(v === UNIT_DIAGNOSTIC || v === UNIT_SUMMATIVE ? v : Number(v));
            }}
            className={`${inputStyle} mt-1`}
          >
            <option value={UNIT_DIAGNOSTIC}>{UNIT_DIAGNOSTIC}</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                تعليمية {n}
              </option>
            ))}
            <option value={UNIT_SUMMATIVE}>{UNIT_SUMMATIVE}</option>
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
          isBattery={isBattery}
        />

        <SportPanel
          title="النشاط الجماعي"
          sportKeys={COLLECTIVE_SPORTS}
          curriculum={levelData.curriculum}
          banks={levelData.banks}
          value={collective}
          onChange={setCollective}
          isBattery={isBattery}
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
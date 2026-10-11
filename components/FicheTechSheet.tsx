"use client";

import React, { useState } from "react";
import { Printer, ChevronRight, Save, RotateCcw } from "lucide-react";
import { LEVEL_DATA, poolExercises, getIndicatorOptions, type SportPickState } from "@/src/config/ficheTechData";
import { useTeacher } from "@/hooks/useTeacher";
import { type UnitChoice, UNIT_DIAGNOSTIC, UNIT_SUMMATIVE } from "./FicheTechConfig";
import type { PooledExercise } from "@/src/config/ficheTechData";

type BatteryExercise = PooledExercise & { indicatorLabel: string | undefined };

const clean = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "");

function Editable({
  as = "td",
  field,
  saved,
  className,
  children,
}: {
  as?: "td" | "span";
  field: string;
  saved?: Record<string, string>;
  className?: string;
  children?: React.ReactNode;
}) {
  const Tag = as;
  const value = saved?.[field];
  const common = { className, "data-field": field, contentEditable: true, suppressContentEditableWarning: true };
  return value !== undefined
    ? <Tag {...common} dangerouslySetInnerHTML={{ __html: clean(value) }} />
    : <Tag {...common}>{children}</Tag>;
}

const collectFields = () => {
  const out: Record<string, string> = {};
  document
    .querySelectorAll<HTMLElement>("#print-fiche-sheet [data-field]")
    .forEach(el => { if (el.dataset.field) out[el.dataset.field] = el.innerHTML; });
  return out;
};

export default function FicheTechSheet({
  level,
  sessionNumber,
  individual,
  collective,
  savedFields,
  onBack,
  onPrint,
  onSave,
  onRegenerate,
}: {
  level: string;
  sessionNumber: UnitChoice;
  individual: SportPickState;
  collective: SportPickState;
  savedFields?: Record<string, string>;
  onBack: () => void;
  onPrint: () => void;
  onSave: (fields: Record<string, string>, title: string) => Promise<boolean>;
  onRegenerate: () => void;
}) {
  const levelData = LEVEL_DATA[level];
  const isBattery = sessionNumber === UNIT_DIAGNOSTIC || sessionNumber === UNIT_SUMMATIVE;
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const individualExercises = isBattery ? [] : (individual.chosenKeys.filter(Boolean) as string[]).map(
    (key) => poolExercises(levelData.banks[individual.sport], individual.indicatorId).find((e) => e.key === key)!
  );
  const collectiveExercises = isBattery ? [] : (collective.chosenKeys.filter(Boolean) as string[]).map(
    (key) => poolExercises(levelData.banks[collective.sport], collective.indicatorId).find((e) => e.key === key)!
  );

  const individualBattery = isBattery
    ? individual.indicatorIds.map((id) => {
      const ex = poolExercises(levelData.banks[individual.sport], id).find((e) => e.key === individual.batteryChosen[id]);
      const label = getIndicatorOptions(levelData.curriculum.sports[individual.sport], levelData.banks[individual.sport]).find((o) => o.id === id)?.label;
      return ex ? { ...ex, indicatorLabel: label } : null;
    }).filter((x): x is BatteryExercise => x !== null)
    : [];

  const collectiveBattery = isBattery
    ? collective.indicatorIds.map((id) => {
      const ex = poolExercises(levelData.banks[collective.sport], id).find((e) => e.key === collective.batteryChosen[id]);
      const label = getIndicatorOptions(levelData.curriculum.sports[collective.sport], levelData.banks[collective.sport]).find((o) => o.id === id)?.label;
      return ex ? { ...ex, indicatorLabel: label } : null;
    }).filter((x): x is BatteryExercise => x !== null)
    : [];

  const { teacher } = useTeacher();

  const indActivity = levelData.curriculum.sports[individual.sport]?.activity ?? "";
  const colActivity = levelData.curriculum.sports[collective.sport]?.activity ?? "";

  const handleSave = async () => {
    setSaveState("saving");
    const title = `${levelData.label} — ${String(sessionNumber)} — ${indActivity} / ${colActivity}`;
    const ok = await onSave(collectFields(), title);
    setSaveState(ok ? "saved" : "error");
  };

  const s = savedFields;

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-ghost" onClick={onBack}>
          <ChevronRight size={16} /> رجوع للتعديل
        </button>
        <div className="btn-row">
          {s && (
            <button className="btn btn-ghost" onClick={onRegenerate}>
              <RotateCcw size={16} /> إعادة التوليد
            </button>
          )}
          <button className="btn btn-ghost" onClick={handleSave} disabled={saveState === "saving"}>
            <Save size={16} />
            {saveState === "saving" ? "جاري الحفظ..." : saveState === "saved" ? "تم الحفظ ✓" : saveState === "error" ? "فشل الحفظ، أعد المحاولة" : "حفظ"}
          </button>
          <button className="btn btn-primary" onClick={onPrint}>
            <Printer size={16} /> طباعة
          </button>
        </div>
      </div>

      <div className="sheet" id="print-fiche-sheet" onInput={() => saveState === "saved" && setSaveState("idle")}>
        <div className="letterhead">
          <h1>بطاقة الوحدة التعليمية </h1>
        </div>

        <div className="meta-strip">
          <div className="meta-item">
            <span className="meta-label">الأستاذ(ة)</span>
            <span className="meta-value" suppressContentEditableWarning>{teacher.name || "ادخل اسمك"}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">المؤسسة</span>
            <span className="meta-value" suppressContentEditableWarning>{teacher.school || "ادخل اسم المؤسسة"}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">المستوى الدراسي</span>
            <span className="meta-value">{levelData.label}</span>
          </div>
        </div>
        <div className="meta-strip">
          <div className="meta-item">
            <span className="meta-label">الوحدة التعلمية لنشاط</span>
            <span className="meta-value">{indActivity}</span>
          </div>
          <div className="meta-item border-b border-gray-300">
            <span className="meta-label">الوحدة التعلمية لنشاط</span>
            <span className="meta-value">{colActivity}</span>
          </div>
          <div className="meta-item border-b border-gray-300">
            <span className="meta-label ">طبيعة الحصة</span>
            <span className="meta-value">{sessionNumber}</span>
          </div>
          <div className="meta-item border-t flex gap-4 border-gray-300 w-full">
            <span className="meta-label">الوسائل :</span>
            <Editable as="span" className="meta-value" field="wasail" saved={s} />
          </div>
        </div>

        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الكفائة القاعدية: </strong>
          <Editable as="span" field="kafaa" saved={s} />
        </div>
        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الهدف (النشاط الفردي): </strong>
          <Editable as="span" field="goal_ind" saved={s} />
        </div>
        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الهدف (النشاط الجماعي): </strong>
          <Editable as="span" field="goal_col" saved={s} />
        </div>

        <div className="table-wrap overflow-x-auto">
          <table className="phases ">
            <thead>
              <tr>
                <th>المراحل</th>
                <th>الأهداف الإجرائية</th>
                <th>وضعيات التعلم</th>
                <th>المدة</th>
                <th>ظروف الإنجاز</th>
                <th>معايير النجاح</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="phase-label">مرحلة التحضير</td>
                <Editable field="prep_goal" saved={s}>
                  <div className="multi">التحضير النفسي. <br /> التحضير البدني العام ثم الخاص</div>
                </Editable>
                <Editable field="prep_situ" saved={s}>
                  الاصطفاف, مراقبة اللباس, المنادات, شرح هدف الحصة ثم تحية,
                  احماء عام: جري خفيف حول الملعب لمدة قصيرة ثم القيام بحركات الاحماء العام.
                  احماء خاص.
                </Editable>
                <Editable field="prep_dur" saved={s}>15د</Editable>
                <Editable field="prep_cond" saved={s} />
                <Editable field="prep_crit" saved={s}>
                  الالتزام بالاصطفاف, اللباس الرياضي, الانضباط, الانتباه, التركيز, الاحترام, التعاون
                </Editable>
              </tr>
              <tr>
                <td className="phase-label">مرحلة التعلم — النشاط الفردي</td>
                <Editable field="ind_goal" saved={s}>
                  <div className="multi">
                    {(isBattery ? individualBattery : individualExercises).map((ex, i) => (
                      <div key={i}>{'indicatorLabel' in ex ? `${ex.indicatorLabel}: ${ex.but}` : ex.but}</div>))}
                  </div>
                </Editable>
                <Editable field="ind_situ" saved={s}>
                  <div className="multi">{(isBattery ? individualBattery : individualExercises).map((ex, i) => <div key={i}>{ex.description}</div>)}</div>
                  <br />
                  <div className=" border-t border-gray-300 border-dashed">تقويم تكويني: شبه منافسة</div>
                </Editable>
                <Editable field="ind_dur" saved={s}>40د</Editable>
                <Editable field="ind_cond" saved={s} />
                <Editable field="ind_crit" saved={s}>
                  <div className="multi">{(isBattery ? individualBattery : individualExercises).map((ex, i) => <div key={i}>{ex.najah}</div>)}</div>
                </Editable>
              </tr>
              <tr>
                <td className="phase-label">مرحلة التعلم — النشاط الجماعي</td>
                <Editable field="col_goal" saved={s}>
                  <div className="multi">
                    {(isBattery ? collectiveBattery : collectiveExercises).map((ex, i) => (
                      <div key={i}>{'indicatorLabel' in ex ? `${ex.indicatorLabel}: ${ex.but}` : ex.but}</div>))}
                  </div>
                </Editable>
                <Editable field="col_situ" saved={s}>
                  <div className="border-b pb-2 border-gray-300 border-dashed">احماء خاص:</div><br />
                  <div className="multi">{(isBattery ? collectiveBattery : collectiveExercises).map((ex, i) => <div key={i}>{ex.description}</div>)}</div>
                  <br />
                  <div className=" border-t border-gray-300 border-dashed">تقويم تكويني: شبه منافسة</div>
                </Editable>
                <Editable field="col_dur" saved={s}>50د</Editable>
                <Editable field="col_cond" saved={s} />
                <Editable field="col_crit" saved={s}>
                  <div className="multi">{(isBattery ? collectiveBattery : collectiveExercises).map((ex, i) => <div key={i}>{ex.najah}</div>)}</div>
                </Editable>
              </tr>
              <tr>
                <td className="phase-label">مرحلة التقييم</td>
                <Editable field="eval_goal" saved={s}>العودة بالجسم الى الحالة الطبيعية (الاسترخاء)</Editable>
                <Editable field="eval_situ" saved={s}>جري خفيف حول الملعب, اصطفاف ( تمديدات ) , ومناقشة الحصة ثم تحية و انصراف.</Editable>
                <Editable field="eval_dur" saved={s}>5د</Editable>
                <Editable field="eval_cond" saved={s} />
                <Editable field="eval_crit" saved={s}>العمل على استرخاء عضلات الجسم</Editable>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
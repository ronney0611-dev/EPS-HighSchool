"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Printer, Plus, Save, RotateCcw, Share2 } from "lucide-react";
import { LEVEL_DATA, poolExercises, getIndicatorOptions, type SportPickState } from "@/src/config/ficheTechData";
import { useTeacher } from "@/hooks/useTeacher";
import { type UnitChoice, UNIT_DIAGNOSTIC, UNIT_SUMMATIVE } from "./FicheTechConfig";
import type { PooledExercise } from "@/src/config/ficheTechData";
import DOMPurify from "isomorphic-dompurify";
import { planOfYearConfig } from "@/src/config/highPlan";
import { isoLocal, trimesterOf } from "@/src/lib/daftarUtils";
import ExerciseDiagram, { type DiagramSpec } from "@/components/Exercisediagram";

type BatteryExercise = PooledExercise & { indicatorLabel: string | undefined };

// the diagram comes from the exercises JSON ("diagram" field); missing = nothing drawn
const diagramOf = (ex: PooledExercise): DiagramSpec | undefined =>
  (ex as PooledExercise & { diagram?: DiagramSpec }).diagram;

type Conditions = {
  place?: string; tools?: string; organization?: string; time?: string;
  intensity?: string; reps?: string; rest?: string; instructions?: string;
};
const conditionsOf = (ex: PooledExercise): Conditions | undefined =>
  (ex as PooledExercise & { conditions?: Conditions }).conditions;

const COND_LABELS: [keyof Conditions, string][] = [
  ["place", "المكان"],
  ["tools", "الوسائل"],
  ["organization", "التنظيم"],
  ["time", "الزمن"],
  ["intensity", "الشدة"],
  ["reps", "التكرار"],
  ["rest", "الراحة"],
  ["instructions", "التعليمات"],
];

// default text of ظروف الإنجاز (editable + saved like the other cells)
function ConditionsText({ list }: { list: PooledExercise[] }) {
  return (
    <div className="multi">
      {list.map((ex, i) => {
        const c = conditionsOf(ex);
        if (!c) return null;
        return (
          <div key={i} className="cond-block">
            <strong>{i + 1}) </strong>
            {COND_LABELS.filter(([k]) => c[k]).map(([k, label]) => (
              <span key={k}><strong>{label}:</strong> {c[k]}. </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// diagrams are NOT editable and NOT saved in "fields": they are redrawn from the config
function Diagrams({ list }: { list: PooledExercise[] }) {
  const items = list.filter((ex) => diagramOf(ex));
  if (items.length === 0) return null;
  return (
    <div className="diagrams" contentEditable={false}>
      {items.map((ex, i) => (
        <div className="diagram-item" key={i}>
          <span className="diagram-num">{list.indexOf(ex) + 1}</span>
          <ExerciseDiagram spec={diagramOf(ex)} />
        </div>
      ))}
    </div>
  );
}

// fixed drawings for مرحلة التحضير / مرحلة التقييم (same style as ExerciseDiagram)
const PH_INK = "#111";
const PH_GRAY = "#777";
const Teacher = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x - 6} y={y - 6} width={12} height={12} fill="#fff" stroke={PH_INK} strokeWidth={1.3} />
    <text x={x} y={y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill={PH_INK}>أ</text>
  </g>
);
const Pupil = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={5} fill={PH_INK} />;
const Cone = ({ x, y }: { x: number; y: number }) => (
  <polygon points={`${x},${y - 5} ${x - 4},${y + 3} ${x + 4},${y + 3}`} fill="none" stroke={PH_INK} strokeWidth={1.1} />
);

// اصطفاف: pupils in one line facing the teacher (لباس, مناداة, شرح الهدف, تحية)
function LineupDiagram() {
  const xs = Array.from({ length: 10 }, (_, i) => 52 + i * 24);
  return (
    <svg viewBox="0 0 320 112" style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr" }} role="img">
      <rect x={20} y={8} width={280} height={84} fill="#f4f4f4" stroke={PH_GRAY} strokeWidth={0.8} />
      <Teacher x={160} y={28} />
      <text x={174} y={31} fontSize={8} fill={PH_INK}>الأستاذ</text>
      <line x1={40} y1={74} x2={280} y2={74} stroke={PH_GRAY} strokeWidth={0.8} strokeDasharray="4 3" />
      {xs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1={62} x2={x} y2={54} stroke={PH_INK} strokeWidth={1} />
          <Pupil x={x} y={66} />
        </g>
      ))}
      <text x={160} y={106} textAnchor="middle" fontSize={9} fill={PH_INK}>اصطفاف، مراقبة اللباس، المناداة، شرح هدف الحصة ثم التحية</text>
    </svg>
  );
}

// stadium: athletics track around the field, pupils running on the track (anticlockwise)
function WarmupDiagram() {
  const L = 92, R = 228, cy = 72;
  const stadium = (r: number) =>
    `M ${L} ${cy - r} L ${R} ${cy - r} A ${r} ${r} 0 0 1 ${R} ${cy + r} L ${L} ${cy + r} A ${r} ${r} 0 0 1 ${L} ${cy - r} Z`;
  const run = 50; // middle of the track
  const pupils = [
    ...[105, 135, 215].map((x) => ({ x, y: cy - run })),
    ...[105, 185, 215].map((x) => ({ x, y: cy + run })),
    ...[-0.6, 0.6].map((a) => ({ x: L - run * Math.cos(a), y: cy + run * Math.sin(a) })),
    ...[-0.6, 0.6].map((a) => ({ x: R + run * Math.cos(a), y: cy + run * Math.sin(a) })),
  ];
  return (
    <svg viewBox="0 0 320 150" style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr" }} role="img">
      <defs>
        <marker id="ph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={PH_INK} />
        </marker>
      </defs>
      {/* track */}
      <path d={stadium(58)} fill="#e9e9e9" stroke={PH_INK} strokeWidth={1.2} />
      <path d={stadium(54)} fill="none" stroke={PH_GRAY} strokeWidth={0.5} />
      <path d={stadium(46)} fill="none" stroke={PH_GRAY} strokeWidth={0.5} />
      <path d={stadium(42)} fill="#fff" stroke={PH_INK} strokeWidth={1} />
      {/* field */}
      <rect x={L - 14} y={cy - 30} width={R - L + 28} height={60} fill="none" stroke={PH_GRAY} strokeWidth={0.9} />
      <line x1={(L + R) / 2} y1={cy - 30} x2={(L + R) / 2} y2={cy + 30} stroke={PH_GRAY} strokeWidth={0.9} />
      <circle cx={(L + R) / 2} cy={cy} r={10} fill="none" stroke={PH_GRAY} strokeWidth={0.9} />
      <rect x={L - 14} y={cy - 14} width={16} height={28} fill="none" stroke={PH_GRAY} strokeWidth={0.9} />
      <rect x={R - 2} y={cy - 14} width={16} height={28} fill="none" stroke={PH_GRAY} strokeWidth={0.9} />
      {/* running direction */}
      <line x1={198} y1={cy - run} x2={155} y2={cy - run} stroke={PH_INK} strokeWidth={1.2} markerEnd="url(#ph-arrow)" />
      <line x1={122} y1={cy + run} x2={165} y2={cy + run} stroke={PH_INK} strokeWidth={1.2} markerEnd="url(#ph-arrow)" />
      {pupils.map((p, i) => <Pupil key={i} x={p.x} y={p.y} />)}
      <Teacher x={(L + R) / 2 + 30} y={cy} />
      <text x={160} y={146} textAnchor="middle" fontSize={9} fill={PH_INK}>جري خفيف حول الملعب ثم حركات الإحماء العام والخاص</text>
    </svg>
  );
}

function CooldownDiagram() {
  const cx = 160, cy = 34, r = 78;
  const pupils = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (0.15 + (0.7 * i) / 8);
    return { x: cx + r * Math.cos(a) * 1.5, y: cy + r * Math.sin(a) * 0.95 };
  });
  return (
    <svg viewBox="0 0 320 130" style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr" }} role="img">
      <rect x={20} y={10} width={280} height={104} fill="#f4f4f4" stroke={PH_GRAY} strokeWidth={0.8} />
      {pupils.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={p.y - 6} x2={cx + (p.x - cx) * 0.45} y2={cy + (p.y - cy) * 0.45} stroke={PH_GRAY} strokeWidth={0.7} strokeDasharray="2 3" />
          <Pupil x={p.x} y={p.y} />
        </g>
      ))}
      <Teacher x={cx} y={cy} />
      <text x={160} y={126} textAnchor="middle" fontSize={9} fill={PH_INK}>التلاميذ في نصف دائرة: تمديدات، تنفس، مناقشة الحصة</text>
    </svg>
  );
}

const PhaseDiagram = ({ kind }: { kind: "prep" | "eval" }) => (
  <div className="diagrams" contentEditable={false}>
    {kind === "prep" ? (
      <>
        <div className="diagram-item"><LineupDiagram /></div>
        <div className="diagram-item"><WarmupDiagram /></div>
      </>
    ) : (
      <div className="diagram-item"><CooldownDiagram /></div>
    )}
  </div>
);

// same cleaner as the server (a shared fiche comes from another teacher)
const clean = (html: string) =>
  DOMPurify.sanitize(html, {
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select", "option", "iframe", "object", "embed"],
    FORBID_ATTR: ["id", "name", "contenteditable"],
  });

// read-only = preview of a shared fiche in the library (nothing editable, no toolbar)
const ReadOnlyCtx = createContext(false);

function Editable({
  as = "td",
  field,
  saved,
  className,
  children,
}: {
  as?: "td" | "span" | "div";
  field: string;
  saved?: Record<string, string>;
  className?: string;
  children?: React.ReactNode;
}) {
  const Tag = as;
  const value = saved?.[field];
  const readOnly = useContext(ReadOnlyCtx);
  const common = { className, "data-field": field, contentEditable: !readOnly, suppressContentEditableWarning: true };
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
  onShare,
  onRegenerate,
  readOnly = false,
}: {
  level: string;
  sessionNumber: UnitChoice;
  individual: SportPickState;
  collective: SportPickState;
  savedFields?: Record<string, string>;
  onBack: () => void;
  onPrint: () => void;
  onSave: (fields: Record<string, string>, title: string) => Promise<boolean>;
  onShare?: (fields: Record<string, string>) => Promise<{ ok: boolean; error?: string; updated?: boolean }>;
  onRegenerate: () => void;
  readOnly?: boolean;
}) {
  const levelData = LEVEL_DATA[level];
  const isBattery = sessionNumber === UNIT_DIAGNOSTIC || sessionNumber === UNIT_SUMMATIVE;
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [shareState, setShareState] = useState<"idle" | "sharing" | "shared">("idle");

  const handleShare = async () => {
    if (!onShare) return;
    if (!confirm("نشر هذه البطاقة في مكتبة الأساتذة؟ سيظهر اسمك عليها ويمكن للأساتذة نسخها.")) return;
    setShareState("sharing");
    const res = await onShare(collectFields());
    if (res.ok) {
      setShareState("shared");
      alert(res.updated ? "تم تحديث البطاقة في مكتبة الأساتذة ✓" : "تم نشر البطاقة في مكتبة الأساتذة ✓");
    } else {
      setShareState("idle");
      alert(res.error || "خطأ أثناء النشر، حاول مرة أخرى");
    }
  };

  // goals of the session written in the saved وحدة (same source as the الدفتر)
  type WahdaLite = { level: string; sport: string; kaidiIndex?: number; sessions: { sessionNumber: number; goal: string; isReminder: boolean }[] };
  const [wahdas, setWahdas] = useState<WahdaLite[] | null>(null);
  useEffect(() => {
    let ignore = false;
    const tri = Number(trimesterOf(isoLocal(new Date()))) || 1;
    fetch(`/api/wahda-ready?trimester=${tri}`)
      .then((r) => r.json())
      .then((d) => { if (!ignore) setWahdas(Array.isArray(d?.wahdas) ? d.wahdas : []); })
      .catch(() => { if (!ignore) setWahdas([]); });
    return () => { ignore = true; };
  }, []);

  const [condMode, setCondMode] = useState<"text" | "draw">("draw");
  const showText = condMode !== "draw";
  const showDiagrams = condMode !== "text";

  const individualExercises = isBattery ? [] : (individual.chosenKeys.filter(Boolean) as string[]).map(
    (key) => poolExercises(levelData.banks[individual.sport], individual.indicatorId).find((e) => e.key === key)
  ).filter((e): e is PooledExercise => !!e); // a key that no longer exists in the bank is skipped (no crash)
  const collectiveExercises = isBattery ? [] : (collective.chosenKeys.filter(Boolean) as string[]).map(
    (key) => poolExercises(levelData.banks[collective.sport], collective.indicatorId).find((e) => e.key === key)
  ).filter((e): e is PooledExercise => !!e); // a key that no longer exists in the bank is skipped (no crash)

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

  // automatic defaults (the teacher can still edit them; a saved fiche keeps its own text)
  const uniq = (xs: (string | undefined)[]) => [...new Set(xs.map((x) => (x ?? "").trim()).filter(Boolean))];
  const kafaaOf = (sport: string) =>
    (levelData.curriculum.sports[sport] as { kafaa_kaadia?: string } | undefined)?.kafaa_kaadia;
  // 1) kafaa_kaadia of the curriculum if it exists, 2) otherwise the الكفاءة القاعدية of the year plan (same as the وحدة page) for the current فصل
  const planKafaa = () => {
    const plan = (planOfYearConfig as unknown as Record<string, { kafaatQaaidiya?: { title?: string }[] } | undefined>)[`s${level.replace("level", "")}`];
    // the الكفاءة القاعدية saved in the وحدة of this level (individual sport first), otherwise the current فصل
    const lvl = level.replace("level", "");
    const saved = [individual.sport, collective.sport]
      .map((sp) => wahdas?.find((w) => String(w.level) === lvl && w.sport === sp)?.kaidiIndex)
      .find((k) => k === 0 || k === 1 || k === 2);
    const tri = Number(trimesterOf(isoLocal(new Date()))) || 1;
    return plan?.kafaatQaaidiya?.[saved ?? Math.min(Math.max(tri - 1, 0), 2)]?.title;
  };
  const defaultKafaa = uniq([kafaaOf(individual.sport), kafaaOf(collective.sport)]).join(" / ") || (planKafaa() ?? "").trim();
  const goalBaseOf = (sport: string, id: number | null) =>
    (levelData.curriculum.sports[sport]?.indicators.find((i) => i.id === id)?.goal_base ?? "").trim();
  const batteryGoal = sessionNumber === UNIT_DIAGNOSTIC
    ? "تقويم تشخيصي: إجراء منافسة مصغرة وتسجيل النتائج"
    : "تقويم تحصيلي: إجراء منافسة نهائية تطبيقية وتحصيل العلامات";
  const wahdaGoalOf = (sport: string) => {
    if (isBattery || !sport || !wahdas) return "";
    const lvl = level.replace("level", "");
    const doc = wahdas.find((w) => String(w.level) === lvl && w.sport === sport);
    const list = (doc?.sessions ?? []).filter((x) => Number(x.sessionNumber) === Number(sessionNumber));
    return ((list.find((x) => !x.isReminder) ?? list[0])?.goal ?? "").trim();
  };
  const defaultGoalInd = wahdaGoalOf(individual.sport) || (isBattery ? (individual.sport ? batteryGoal : "") : uniq(individualExercises.map((e) => e.sessionGoal)).join(" / ") || goalBaseOf(individual.sport, individual.indicatorId));
  const defaultGoalCol = wahdaGoalOf(collective.sport) || (isBattery ? (collective.sport ? batteryGoal : "") : uniq(collectiveExercises.map((e) => e.sessionGoal)).join(" / ") || goalBaseOf(collective.sport, collective.indicatorId));

  const handleSave = async () => {
    setSaveState("saving");
    const title = `${levelData.label} — ${String(sessionNumber)} — ${indActivity} / ${colActivity}`;
    const ok = await onSave(collectFields(), title);
    setSaveState(ok ? "saved" : "error");
  };

  const s = savedFields;

  return (
    <ReadOnlyCtx.Provider value={readOnly}>
      {!readOnly && (
        <div className="toolbar">
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (saveState !== "saved" && !confirm("لم تحفظ هذه البطاقة. إنشاء بطاقة جديدة؟")) return;
              onBack();
            }}
          >
            <Plus size={16} /> بطاقة جديدة
          </button>
          <div className="btn-row">
            {s && (
              <button className="btn btn-ghost" onClick={onRegenerate}>
                <RotateCcw size={16} /> إعادة التوليد
              </button>
            )}
            <select
              className="btn btn-ghost"
              value={condMode}
              onChange={(e) => setCondMode(e.target.value as "text" | "draw")}
              title="ظروف الإنجاز"
            >
              <option value="text">ظروف الإنجاز: نص فقط</option>
              <option value="draw">ظروف الإنجاز: مخطط فقط</option>
            </select>
            <button className="btn btn-ghost" onClick={handleSave} disabled={saveState === "saving"}>
              <Save size={16} />
              {saveState === "saving" ? "جاري الحفظ..." : saveState === "saved" ? "تم الحفظ ✓" : saveState === "error" ? "فشل الحفظ، أعد المحاولة" : "حفظ"}
            </button>
            {onShare && (
              <button className="btn btn-ghost" onClick={handleShare} disabled={shareState === "sharing"}>
                <Share2 size={16} />
                {shareState === "sharing" ? "جاري النشر..." : shareState === "shared" ? "تم النشر ✓" : "مشاركة"}
              </button>
            )}
            <button className="btn btn-primary" onClick={onPrint}>
              <Printer size={16} /> طباعة
            </button>
          </div>
        </div>

      )}
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
          <Editable key={wahdas ? "kafaa-w" : "kafaa"} as="span" field="kafaa" saved={s}>{defaultKafaa}</Editable>
        </div>
        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الهدف (النشاط الفردي): </strong>
          <Editable key={wahdas ? "goal_ind-w" : "goal_ind"} as="span" field="goal_ind" saved={s}>{defaultGoalInd}</Editable>
        </div>
        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الهدف (النشاط الجماعي): </strong>
          <Editable key={wahdas ? "goal_col-w" : "goal_col"} as="span" field="goal_col" saved={s}>{defaultGoalCol}</Editable>
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
                <td>
                  <div style={{ display: showText ? undefined : "none" }}>
                    <Editable as="div" field="prep_cond" saved={s}>
                      <div className="multi">
                        <span><strong>المكان:</strong> الملعب. </span>
                        <span><strong>الوسائل:</strong> صفارة، أقماع. </span>
                        <span><strong>التنظيم:</strong> اصطفاف في خط واحد أمام الأستاذ، ثم جري خفيف حول الملعب في قاطرة، ثم انتشار للإحماء العام والخاص. </span>
                        <span><strong>الشدة:</strong> خفيفة ثم متزايدة. </span>
                        <span><strong>التعليمات:</strong> احترام المسافة بين التلاميذ، تسخين كل المفاصل من الأعلى إلى الأسفل.</span>
                      </div>
                    </Editable>
                  </div>
                  {showDiagrams && <PhaseDiagram kind="prep" />}
                </td>
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
                <td>
                  {/* kept in the page even when hidden, so it is still saved */}
                  <div style={{ display: showText ? undefined : "none" }}>
                    <Editable as="div" field="ind_cond" saved={s}>
                      <ConditionsText list={isBattery ? individualBattery : individualExercises} />
                    </Editable>
                  </div>
                  {showDiagrams && <Diagrams list={isBattery ? individualBattery : individualExercises} />}
                </td>
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
                <td>
                  <div style={{ display: showText ? undefined : "none" }}>
                    <Editable as="div" field="col_cond" saved={s}>
                      <ConditionsText list={isBattery ? collectiveBattery : collectiveExercises} />
                    </Editable>
                  </div>
                  {showDiagrams && <Diagrams list={isBattery ? collectiveBattery : collectiveExercises} />}
                </td>
                <Editable field="col_crit" saved={s}>
                  <div className="multi">{(isBattery ? collectiveBattery : collectiveExercises).map((ex, i) => <div key={i}>{ex.najah}</div>)}</div>
                </Editable>
              </tr>
              <tr>
                <td className="phase-label">مرحلة التقييم</td>
                <Editable field="eval_goal" saved={s}>العودة بالجسم الى الحالة الطبيعية (الاسترخاء)</Editable>
                <Editable field="eval_situ" saved={s}>جري خفيف حول الملعب, اصطفاف ( تمديدات ) , ومناقشة الحصة ثم تحية و انصراف.</Editable>
                <Editable field="eval_dur" saved={s}>5د</Editable>
                <td>
                  <div style={{ display: showText ? undefined : "none" }}>
                    <Editable as="div" field="eval_cond" saved={s}>
                      <div className="multi">
                        <span><strong>المكان:</strong> الملعب. </span>
                        <span><strong>التنظيم:</strong> جري خفيف ثم التلاميذ في نصف دائرة أمام الأستاذ. </span>
                        <span><strong>الشدة:</strong> منخفضة. </span>
                        <span><strong>التعليمات:</strong> تمديدات بطيئة، تنفس عميق، مناقشة الحصة.</span>
                      </div>
                    </Editable>
                  </div>
                  {showDiagrams && <PhaseDiagram kind="eval" />}
                </td>
                <Editable field="eval_crit" saved={s}>العمل على استرخاء عضلات الجسم</Editable>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ReadOnlyCtx.Provider>
  );
}
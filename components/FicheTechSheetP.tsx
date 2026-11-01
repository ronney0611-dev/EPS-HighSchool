"use client";

import { Printer, Plus, Save, Share2 } from "lucide-react";
import { createContext, useContext, useState } from "react";
import DOMPurify from "dompurify";
import { LEVEL_DATA_P, getExercisePool, type SessionPickState, type SessionExercise } from "@/src/config/fichePrimaireData";
import { useTeacher } from "@/hooks/useTeacher";
import PrimaireDiagram, { type PrimaireDiagramSpec } from "@/components/PrimaireDiagram";
import { LineupDiagram, WarmupDiagram, CooldownDiagram } from "@/components/PhaseDrawings";

// the drawing comes from the "diagram" field of the exercise (missing = nothing drawn)
const diagramOf = (ex: SessionExercise) => (ex as SessionExercise & { diagram?: PrimaireDiagramSpec }).diagram;

// drawings: small, side by side, not editable (contentEditable=false)
function Drawings({ items, width = 170 }: { items: React.ReactNode[]; width?: number }) {
  if (!items.length) return null;
  return (
    <div className="p-draw" contentEditable={false} style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
      {items.map((el, i) => <div key={i} style={{ width, maxWidth: "100%" }}>{el}</div>)}
    </div>
  );
}

// text the teacher typed (saved as HTML): cleaned before it is shown again
// browser only (dompurify needs a page); the saved text is never rendered on the server
const clean = (html: string) =>
  typeof window === "undefined" ? "" : DOMPurify.sanitize(html, {
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select", "option", "iframe", "object", "embed"],
    FORBID_ATTR: ["id", "name", "contenteditable"],
  });

// read-only = preview of a shared fiche in the library
const ReadOnlyCtx = createContext(false);

// one editable piece of the fiche: shows the saved text if there is one, otherwise the default
function Editable({
  as = "div",
  field,
  saved,
  className,
  style,
  children,
}: {
  as?: "td" | "span" | "div";
  field: string;
  saved?: Record<string, string>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const Tag = as;
  const value = saved?.[field];
  const readOnly = useContext(ReadOnlyCtx);
  // an emptied piece must keep a size, otherwise the teacher can no longer click in it to write
  const keepSize: React.CSSProperties =
    as === "span" ? { display: "inline-block", minWidth: "8em", minHeight: "1.3em" }
      : as === "div" ? { minHeight: "3em", outline: "none", cursor: "text" }
        : {};
  const common = { className, style: { ...keepSize, ...style }, "data-field": field, contentEditable: !readOnly, suppressContentEditableWarning: true };
  return value !== undefined
    ? <Tag {...common} dangerouslySetInnerHTML={{ __html: clean(value) }} />
    : <Tag {...common}>{children}</Tag>;
}

const collectFields = () => {
  const out: Record<string, string> = {};
  document
    .querySelectorAll<HTMLElement>("#print-fiche-sheet-p [data-field]")
    .forEach((el) => { if (el.dataset.field) out[el.dataset.field] = el.innerHTML; });
  return out;
};

export default function FicheTechSheetP({
  level,
  pick,
  onBack,
  onPrint,
  savedFields,
  onSave,
  onShare,
  readOnly = false,
}: {
  level: string;
  pick: SessionPickState;
  onBack: () => void;
  onPrint: () => void;
  savedFields?: Record<string, string>;
  onSave?: (fields: Record<string, string>, title: string) => Promise<boolean>;
  onShare?: (fields: Record<string, string>, title: string) => Promise<{ ok: boolean; error?: string; updated?: boolean }>;
  readOnly?: boolean;
}) {
  const levelData = LEVEL_DATA_P.find((l) => l.key === level)!;
  const maidanData = levelData.maidans.find((m) => m.key === pick.maidan)!;
  const session = maidanData.curriculum.sessions.find((s) => s.unit_name === pick.unitName)!;


  const pool = getExercisePool(level, pick.maidan, pick.unitName);
  const exercises = (pick.chosenIds.filter(Boolean) as string[]).map((id) => pool.find((e) => e.id === id)!);

  const { teacher } = useTeacher();
  const [showDraw, setShowDraw] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const s = savedFields;

  const [shareState, setShareState] = useState<"idle" | "sharing" | "shared">("idle");
  const title = `${levelData.label} — ${maidanData.label} — ${session.unit_name}`;

  const handleShare = async () => {
    if (!onShare) return;
    if (!confirm("نشر هذه البطاقة في مكتبة الأساتذة؟ سيظهر اسمك عليها ويمكن للأساتذة نسخها.")) return;
    setShareState("sharing");
    const res = await onShare(collectFields(), title);
    if (res.ok) {
      setShareState("shared");
      alert(res.updated ? "تم تحديث البطاقة في مكتبة الأساتذة ✓" : "تم نشر البطاقة في مكتبة الأساتذة ✓");
    } else {
      setShareState("idle");
      alert(res.error || "خطأ أثناء النشر، حاول مرة أخرى");
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaveState("saving");
    const ok = await onSave(collectFields(), title);
    setSaveState(ok ? "saved" : "error");
  };

  return (
    <ReadOnlyCtx.Provider value={readOnly}>
      {!readOnly && (
        <div className="toolbar">
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (onSave && saveState !== "saved" && !confirm("لم تحفظ هذه البطاقة. إنشاء بطاقة جديدة؟")) return;
              onBack();
            }}
          >
            <Plus size={16} /> بطاقة جديدة
          </button>
          <div className="btn-row">
            <select
              className="btn btn-ghost"
              value={showDraw ? "on" : "off"}
              onChange={(e) => setShowDraw(e.target.value === "on")}
              title="المخططات"
            >
              <option value="on">مع المخططات</option>
              <option value="off">بدون مخططات</option>
            </select>
            {onSave && (
              <button className="btn btn-ghost" onClick={handleSave} disabled={saveState === "saving"}>
                <Save size={16} />
                {saveState === "saving" ? "جاري الحفظ..." : saveState === "saved" ? "تم الحفظ ✓" : saveState === "error" ? "فشل الحفظ، أعد المحاولة" : "حفظ"}
              </button>
            )}
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

      <div className="sheet" id="print-fiche-sheet-p" onInput={() => saveState === "saved" && setSaveState("idle")}>
        <div className="letterhead">
          <h1>الوحدة التعلمية</h1>
        </div>

        <div className="meta-strip">
          <div className="meta-item">
            <span className="meta-label">الأستاذ(ة)</span>
            <span className="meta-value" >{teacher.name || "اسم الاستاذ"}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">المؤسسة</span>
            <Editable as="span" className="meta-value" field="school" saved={s}>{teacher.school || "اسم المؤسسة"}</Editable>
          </div>
          <div className="meta-item">
            <span className="meta-label">المستوى الدراسي</span>
            <span className="meta-value">{levelData.label}</span>
          </div>
        </div>
        <div className="meta-strip">
          <div className="meta-item">
            <span className="meta-label">الميدان</span>
            <span className="meta-value">{maidanData.label}</span>
          </div>
          <div className="meta-item border-b border-gray-300">
            <span className="meta-label">الحصة</span>
            <span className="meta-value">{session.unit_name}</span>
          </div>
          <div className="meta-item border-b border-gray-300 flex gap-2">
            <span className="meta-label">الوسائل :</span>
            <Editable as="span" className="meta-value" field="wasail" saved={s} />
          </div>
        </div>

        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الكفاءة الختامية: </strong>
          <Editable as="span" field="kafa_khitamya" saved={s}>{maidanData.curriculum.kafa_khitamya}</Editable>
        </div>

        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الكفاءة المستهدفة: </strong>
          <Editable as="span" field="kafa_components" saved={s}>{session.kafa_components}</Editable>
        </div>

        <div className="table-wrap overflow-x-auto ">
          <table className="phases">
            <colgroup>
              <col /><col /><col /><col /><col />
            </colgroup>
            <thead>
              <tr>
                <th>المراحل</th>
                <th>محتوى التعلم</th>
                <th>محتوى الإنجاز</th>
                <th>المدة</th>
                <th>التوجيهات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="phase-label">المرحلة التحضيرية</td>
                <Editable as="td" field="prep_taalum" saved={s}>
                  <div className="multi"> تهيئة الجسم بالجري بوتيرة منخفضة.</div>
                </Editable>
                <td>
                  <Editable field="prep_injaz" saved={s}>
                    التشكيلة, المناداة, مراقبة اللباس, نزع الاشياء الخطيرة, مراقبة الحالة الصحية, شرح هدف الحصة, التحية
                    الاحماء. جري خفيف حول الميدان مع تمارين احماء الاطراف العلوية والسفلية.
                  </Editable>
                  {showDraw && <Drawings items={[<LineupDiagram key="l" />, <WarmupDiagram key="w" />]} width={150} />}
                </td>
                <Editable as="td" field="prep_dur" saved={s}>15د</Editable>
                <Editable as="td" field="prep_tawjihat" saved={s}>الانتشار الجيد في الميدان <br /> تفادي الكلام والتزام الهدوء <br /> التنفس المنتظم شهيق زفير
                </Editable>
              </tr>

              <tr>
                <td className="phase-label">المرحلة التعليمية</td>
                <Editable as="td" field="learn_taalum" saved={s}>
                  <div className="multi">{exercises.map((ex, i) => <div key={i}>{ex.mohtawaTaalum}</div>)}</div>
                </Editable>
                <td>
                  <div>
                    {exercises.map((ex, i) => {
                      const spec = diagramOf(ex);
                      return (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", ...(i > 0 ? { marginTop: 5, paddingTop: 5, borderTop: "1px dashed var(--line)" } : {}) }}>
                          <Editable field={`learn_injaz_${i}`} saved={s} style={{ flex: 1, minWidth: 0 }}><strong>{ex.title}: </strong>{ex.mohtawaInjaz}</Editable>
                          {showDraw && spec && <div style={{ marginTop: -4 }}><Drawings items={[<PrimaireDiagram key="d" spec={spec} />]} width={175} /></div>}
                        </div>
                      );
                    })}
                  </div>
                </td>
                <Editable as="td" field="learn_dur" saved={s}>{exercises.reduce((sum, ex) => sum + ex.duration, 0)}د</Editable>
                <Editable as="td" field="learn_tawjihat" saved={s}>
                  <div className="multi">{exercises.map((ex, i) => <div key={i}>{ex.tawjihat}</div>)}</div>
                </Editable>
              </tr>

              <tr>
                <td className="phase-label">المرحلة الختامية</td>
                <Editable as="td" field="end_taalum" saved={s}>العودة بالجسم الى الحالة الطبيعية (الاسترخاء)</Editable>
                <td>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Editable field="end_injaz" saved={s} style={{ flex: 1, minWidth: 0 }}>حركات الاسترخاء, جمع الوسائل الرياضية, الاصطفاف وتحية ثم انصراف</Editable>
                    {showDraw && <div style={{ marginTop: -4 }}><Drawings items={[<CooldownDiagram key="c" />]} width={150} /></div>}
                  </div>
                </td>
                <Editable as="td" field="end_dur" saved={s}>5د</Editable>
                <Editable as="td" field="end_tawjihat" saved={s}>الحفاظ على الهدوء والانضباط والاصغاء لتعليمات الأستاذ</Editable>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ReadOnlyCtx.Provider>
  );
}
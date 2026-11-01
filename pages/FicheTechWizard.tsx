"use client";

import { useState, useCallback, useEffect } from "react";
import FicheTechConfig, { type UnitChoice, UNIT_DIAGNOSTIC, UNIT_SUMMATIVE } from "@/components/FicheTechConfig";
import FicheTechSheet from "@/components/FicheTechSheet";
import FicheReady, { type ReadyConfig } from "@/components/FichReady";
import { EMPTY_PICK, type SportPickState } from "@/src/config/ficheTechData";
import { useFicheTech } from "@/hooks/useFicheTech";
import { useShared } from "@/hooks/useShared";

// preview = a shared fiche shown read-only in the library (same sheet, same styles)
export type FichePreview = {
  level: string;
  sessionNumber: UnitChoice;
  individual: SportPickState;
  collective: SportPickState;
  fields: Record<string, string>;
};

export default function FicheTechWizard({ preview }: { preview?: FichePreview } = {}) {
  const [page, setPage] = useState<1 | 2 | 3>(preview ? 3 : 1);
  const [mode, setMode] = useState<"choose" | "manual" | "ready">("choose");
  const [level, setLevel] = useState(preview?.level ?? "level1");
  const [sessionNumber, setSessionNumber] = useState<UnitChoice>(preview?.sessionNumber ?? 1);
  const [individual, setIndividual] = useState<SportPickState>(preview?.individual ?? EMPTY_PICK);
  const [collective, setCollective] = useState<SportPickState>(preview?.collective ?? EMPTY_PICK);

  const { list, loading: listLoading, fetchList, fetchOne, save, remove } = useFicheTech();
  const [ficheId, setFicheId] = useState<string | null>(null);
  const [savedFields, setSavedFields] = useState<Record<string, string> | undefined>(preview?.fields);
  const [loadedConfigKey, setLoadedConfigKey] = useState<string | null>(null);
  const [sheetKey, setSheetKey] = useState(0);

  const configKey = JSON.stringify({ level, sessionNumber, individual, collective });

  useEffect(() => { if (!preview) fetchList(); }, [fetchList, preview]);

  const isBattery = sessionNumber === UNIT_DIAGNOSTIC || sessionNumber === UNIT_SUMMATIVE;
  const batteryReady = (p: SportPickState) =>
    !!p.sport && p.indicatorIds.length >= 4 && p.indicatorIds.every((id) => !!p.batteryChosen[id]);

  const canProceed = isBattery
    ? batteryReady(individual) && batteryReady(collective)
    : !!individual.sport && individual.indicatorId !== null && individual.chosenKeys.every(Boolean) && individual.chosenKeys.length > 0 &&
    !!collective.sport && collective.indicatorId !== null && collective.chosenKeys.every(Boolean) && collective.chosenKeys.length > 0;
  const handlePrint = useCallback(() => window.print(), []);

  // Print = ALWAYS one A4 landscape page, whatever the mode (text / drawing / both),
  // the number of exercises or what the teacher typed. Works with the button AND Ctrl+P.
  useEffect(() => {
    const PAGE_W = 1088; // px: 297mm - 8mm margins
    const PAGE_H = 752;  // px: 210mm - 8mm margins, minus a small safety
    const MIN_ZOOM = 0.6; // below this the text is unreadable: let it go to 2 pages

    const fit = () => {
      const root = document.querySelector<HTMLElement>(".fiche-root");
      const sheet = document.getElementById("print-fiche-sheet");
      if (!root || !sheet) return;
      root.classList.add("print-mode");
      sheet.style.zoom = "";
      let z = 1;
      while (true) {
        sheet.style.width = `${PAGE_W / z}px`;
        if (sheet.getBoundingClientRect().height * z <= PAGE_H || z <= MIN_ZOOM) break;
        z = Math.max(MIN_ZOOM, Math.round((z - 0.02) * 100) / 100);
      }
      sheet.style.zoom = String(z);
    };
    const reset = () => {
      document.querySelector(".fiche-root")?.classList.remove("print-mode");
      const sheet = document.getElementById("print-fiche-sheet");
      if (sheet) { sheet.style.width = ""; sheet.style.zoom = ""; }
    };

    window.addEventListener("beforeprint", fit);
    window.addEventListener("afterprint", reset);
    return () => {
      window.removeEventListener("beforeprint", fit);
      window.removeEventListener("afterprint", reset);
    };
  }, []);


  const handleNext = () => {
    if (loadedConfigKey !== null && loadedConfigKey !== configKey) {
      setSavedFields(undefined);
      setLoadedConfigKey(null);
    }
    setPage(2);
  };

  const handleNew = () => {
    setFicheId(null);
    setSavedFields(undefined);
    setLoadedConfigKey(null);
    setLevel("level1");
    setSessionNumber(1);
    setIndividual(EMPTY_PICK);
    setCollective(EMPTY_PICK);
    setMode("choose");
    setPage(1);
  };

  // "بطاقة جاهزة": the state is prepared from the وحدة + الدفتر, then same flow as the manual fiche
  const handleReady = (cfg: ReadyConfig) => {
    setLevel(cfg.level);
    setSessionNumber(cfg.sessionNumber);
    setIndividual(cfg.individual);
    setCollective(cfg.collective);
    setFicheId(null);
    setSavedFields(cfg.fields);
    setLoadedConfigKey(JSON.stringify({ level: cfg.level, sessionNumber: cfg.sessionNumber, individual: cfg.individual, collective: cfg.collective }));
    setSheetKey(k => k + 1);
    setPage(2);
  };

  const handleOpen = async (id: string) => {
    const f = await fetchOne(id);
    if (!f) return alert("تعذر فتح البطاقة، حاول مرة أخرى");
    setLevel(f.level);
    setSessionNumber(f.sessionNumber);
    setIndividual(f.individual);
    setCollective(f.collective);
    setFicheId(f._id);
    setSavedFields(f.fields);
    setLoadedConfigKey(JSON.stringify({ level: f.level, sessionNumber: f.sessionNumber, individual: f.individual, collective: f.collective }));
    setSheetKey(k => k + 1);
    setPage(3);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذه البطاقة نهائيا؟")) return;
    const ok = await remove(id);
    if (!ok) return alert("فشل الحذف، حاول مرة أخرى");
    if (id === ficheId) handleNew();
  };

  const handleSave = async (fields: Record<string, string>, title: string) => {
    const doc = await save({ _id: ficheId, title, level, sessionNumber, individual, collective, fields });
    if (!doc) return false;
    setFicheId(doc._id);
    setSavedFields(fields);
    setLoadedConfigKey(configKey);
    fetchList();
    return true;
  };

  const { publish } = useShared();
  // a snapshot of what is on the screen; the saved fiche (if any) is the source -> publishing again updates it
  const handleShare = (fields: Record<string, string>) =>
    publish("fiche", { level, sessionNumber, individual, collective, fields }, ficheId);

  const handleRegenerate = () => {
    if (!confirm("سيتم استبدال تعديلاتك بالمحتوى الأصلي (لن يحذف المحفوظ حتى تضغط حفظ). متابعة؟")) return;
    setSavedFields(undefined);
    setSheetKey(k => k + 1);
  };

  return (
    <div className="fiche-root" dir="rtl" lang="ar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700&display=swap');
        .fiche-root {
          --paper:#FAF7F0; --ink:#20241F; --green:#1F4732; --green-dark:#163524;
          --gold:#B08D3B; --sage:#E7ECE4; --line:#D8D2C2;
          font-family:'Tajawal',system-ui,sans-serif; color:var(--ink); background:var(--paper);
          padding:24px; max-width:1000px; margin:0 auto;
        }
        .fiche-root * { box-sizing:border-box; }
        .toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .steps { font-size:13px; color:#7A8471; font-weight:700; }
        .btn { display:flex; align-items:center; gap:8px; padding:9px 16px; border-radius:6px;
          font-weight:700; font-size:14px; cursor:pointer; border:1.5px solid var(--green); }
        .btn-primary { background:var(--green); color:var(--paper); }
        .btn-primary:hover { background:var(--green-dark); }
        .btn-ghost { background:transparent; color:var(--green); }
        .btn-ghost:hover { background:var(--sage); }
        .btn:disabled { opacity:.4; cursor:not-allowed; }
        .btn-row { display:flex; gap:10px; }
        .config-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px; }
        .top-fields { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
        .field { display:flex; flex-direction:column; gap:4px; margin-bottom:12px; font-size:13px; }
        .field span { font-weight:700; color:var(--green-dark); font-size:12px; }
        .field select, .field input { padding:7px 9px; border:1px solid var(--line); border-radius:5px;
          font-family:'Tajawal',sans-serif; font-size:13px; background:#fff; }
        .panel { background:#fff; border:1px solid var(--line); border-radius:6px; padding:16px; }
        .panel-title { font-family:'Amiri',serif; font-size:16px; color:var(--green); margin:0 0 12px; }
        .sheet { background:#fff; border:1px solid var(--line); box-shadow:0 2px 18px rgba(31,71,50,.08); }
        .letterhead { text-align:center; padding:16px; border-bottom:3px double var(--green); }
        .letterhead .eyebrow { font-size:12px; color:var(--gold); font-weight:700; margin:0 0 4px; }
        .letterhead h1 { font-family:'Amiri',serif; color:var(--green); font-size:22px; margin:0; }
        .meta-strip { display:grid; grid-template-columns:repeat(3,1fr); border-bottom:1px solid var(--line); }
        .meta-item { padding:10px 16px; border-right:1px solid var(--line); }
        .meta-item:first-child { border-right:none; }
        .meta-label { font-size:11px; color:#7A8471; font-weight:700; display:block; }
        .meta-value { font-family:'Amiri',serif; font-size:15px; }
        .meta-value[contenteditable], .objective-box[contenteditable] { outline:none; border-bottom:1px dashed var(--line); min-height:20px; }
        .objective-box { margin:14px 16px; padding:10px 14px; background:var(--sage); border-right:4px solid var(--green); font-size:13.5px; }
        table.phases { width:100%; border-collapse:collapse; font-size:12.5px; margin-top:4px; }
        table.phases th { background:var(--green); color:var(--paper); padding:8px; border:1px solid var(--green-dark); font-size:12px; }
        table.phases td { padding:9px 10px; border:1px solid var(--line); vertical-align:top; }
        table.phases td[contenteditable] { outline:none; }
        table.phases td[contenteditable]:focus { background:#FCFBEF; }
        .phase-label { font-weight:700; font-family:'Amiri',serif; font-size:13px; white-space:nowrap; }
        .multi div + div { margin-top:5px; padding-top:5px; border-top:1px dashed var(--line); }
        .reminder-screen {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 50vh;
              padding: 24px;
            }
            .reminder-box {
              max-width: 520px;
              background: #fff;
              border: 2px solid #B08D3B;
              border-radius: 12px;
              padding: 28px;
              text-align: center;
            }
            .reminder-box h2 {
              font-family: 'Amiri', serif;
              color: var(--green);
              font-size: 20px;
              margin: 0 0 14px;
            }
            .reminder-box p {
              font-size: 14px;
              line-height: 1.9;
              color: var(--ink);
              margin: 0 0 22px;
            }
            .reminder-actions {
              display: flex;
              gap: 10px;
              justify-content: center;
            }
        .diagrams { display:flex; flex-direction:column; gap:8px; margin-top:8px; }
        .diagram-item { position:relative; }
        .diagram-num { position:absolute; top:0; right:0; font-size:11px; font-weight:700; color:var(--green); }

          /* ===== PRINT =====
             The fit script (FicheTechWizard, "beforeprint") adds .print-mode to .fiche-root,
             measures the sheet and sets a zoom so it ALWAYS fits on one A4 landscape page.
             These rules are not inside @media print so they can be measured before printing. */
          .fiche-root.print-mode {
            background: #fff !important;
            padding: 0 !important;
            max-width: none !important;
            margin: 0 !important;
          }
          .print-mode #print-fiche-sheet {
            display: flex !important;
            flex-direction: column !important;
            max-width: none !important;
            height: auto !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 11px !important;
          }
          .print-mode .letterhead { padding: 4px 8px !important; border-bottom: 2px solid var(--green) !important; }
          .print-mode .letterhead h1 { font-size: 12px !important; margin: 0 !important; }
          .print-mode .letterhead .eyebrow { display: none !important; }
          .print-mode .meta-strip { display: grid !important; break-inside: avoid; page-break-inside: avoid; }
          .print-mode .meta-item { padding: 3px 10px !important; }
          .print-mode .meta-label { font-size: 8.5px !important; }
          .print-mode .meta-value { font-size: 11px !important; }
          .print-mode .objective-box { margin: 4px 8px !important; padding: 3px 10px !important; font-size: 10px !important; }
          .print-mode .table-wrap { overflow: visible !important; margin-top: 6px !important; }
          .print-mode table.phases { width: 100% !important; font-size: 8.5px !important; }
          .print-mode table.phases th,
          .print-mode table.phases td { padding: 6px 8px !important; }
          .print-mode table.phases tr { break-inside: avoid; page-break-inside: avoid; }
          .print-mode .multi div + div { margin-top: 3px; padding-top: 3px; }
          .print-mode .cond-block { font-size: 7.5px !important; line-height: 1.35 !important; }

          /* diagrams: 2 per row (drawing only), 3 per row (text + drawing) */
          .print-mode .diagrams { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 3px 5px !important; margin-top: 4px !important; }
          .print-mode div:not([style*="none"]) + .diagrams { grid-template-columns: repeat(3, 1fr) !important; gap: 2px 3px !important; }
          .print-mode .diagram-item { break-inside: avoid; page-break-inside: avoid; }
          .print-mode .diagram-num { font-size: 7px !important; color: #000 !important; }
          .print-mode .diagrams svg { display: block; width: 100% !important; max-width: 100% !important; height: auto !important; max-height: 125px; margin: 0 auto; }
          .print-mode div:not([style*="none"]) + .diagrams svg { max-height: 100px; }

          @media print {
            @page {
              size: A4 landscape;
              margin: 2mm;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            html, body {
              margin: 2mm !important;
              padding: 0 !important;
              height: auto !important;
              background: white !important;
            }

            .toolbar { display: none !important; }
          }
      `}</style>

      {page === 1 && (
        <>
          {mode === "choose" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 18 }}>
              <button
                className="panel"
                onClick={() => setMode("ready")}
                style={{ textAlign: "right", cursor: "pointer", border: "2px solid var(--line)", display: "flex", flexDirection: "column", gap: 6 }}
              >
                <span style={{ fontSize: 28 }}>⚡</span>
                <span style={{ fontSize: 17, fontWeight: 800 }}>بطاقة جاهزة</span>
                <span style={{ fontSize: 12.5, color: "#555" }}>
                  بطاقة واحدة لكل مستوى، تُملأ تلقائيا من الوحدة التعلمية وتقدم الدفتر اليومي. راجعها ثم اطبعها.
                </span>
              </button>
              <button
                className="panel"
                onClick={() => setMode("manual")}
                style={{ textAlign: "right", cursor: "pointer", border: "2px solid var(--line)", display: "flex", flexDirection: "column", gap: 6 }}
              >
                <span style={{ fontSize: 28 }}>✍️</span>
                <span style={{ fontSize: 17, fontWeight: 800 }}>بطاقة يدوية</span>
                <span style={{ fontSize: 12.5, color: "#555" }}>
                  اختر بنفسك المستوى والحصة والمؤشر والتمارين.
                </span>
              </button>
            </div>
          )}

          {mode !== "choose" && (
            <div style={{ marginBottom: 12 }}>
              <button className="btn btn-ghost" onClick={() => setMode("choose")}>→ رجوع إلى الاختيار</button>
            </div>
          )}

          {mode === "ready" && (
            <div style={{ marginBottom: 18 }}>
              <FicheReady onOpen={handleReady} />
            </div>
          )}

          {mode === "manual" && (
            <FicheTechConfig
              level={level} setLevel={setLevel}
              sessionNumber={sessionNumber} setSessionNumber={setSessionNumber}
              individual={individual} setIndividual={setIndividual}
              collective={collective} setCollective={setCollective}
              canProceed={canProceed}
              onNext={handleNext}
            />
          )}

          <div className="panel mt-4" style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 className="panel-title" style={{ margin: 0 }}>📁 المذكرات المحفوظة</h3>
              {ficheId && (
                <button className="btn btn-ghost" onClick={handleNew}>+ بطاقة جديدة</button>
              )}
            </div>

            {listLoading ? (
              <p style={{ fontSize: 13, color: "#7A8471" }}>⏳ جاري التحميل...</p>
            ) : list.length === 0 ? (
              <p style={{ fontSize: 13, color: "#7A8471" }}>لا توجد مذكرات محفوظة بعد. أنشئ مذكرة واضغط «حفظ».</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                {list.map(f => (
                  <div
                    key={f._id}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                      padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 6,
                      background: f._id === ficheId ? "var(--sage)" : "#fff",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.title || "بطاقة بدون عنوان"}
                      </div>
                      <div style={{ fontSize: 11, color: "#7A8471" }}>
                        آخر تعديل: {new Date(f.updatedAt).toLocaleDateString("ar-DZ")}
                      </div>
                    </div>
                    <div className="btn-row">
                      <button className="btn btn-primary" onClick={() => handleOpen(f._id)}>فتح</button>
                      <button className="btn btn-ghost" onClick={() => handleDelete(f._id)}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {page === 2 && (
        <div className="reminder-screen">
          <div className="reminder-box">
            <h2>⚠️ تنبيه قبل المتابعة</h2>
            <p>
              المسؤولية البيداغوجية الكاملة في اختيار وصياغة محتوى الحصة
              تقع على عاتق الأستاذ(ة).
              التمارين هي مقترحات فقط.  <strong className="text-red-500">يجب على الأستاذ(ة) مراجعتها وتعديلها </strong>
              لتناسب مستوى وخصوصيات تلاميذه قبل الطباعة أو الاعتماد
              عليها.
            </p>
            <div className="reminder-actions">
              <button className="btn btn-ghost" onClick={() => setPage(1)}>
                رجوع
              </button>
              <button className="btn btn-primary" onClick={() => setPage(3)}>
                فهمت، متابعة →
              </button>
            </div>
          </div>
        </div>
      )}

      {page === 3 && (
        <FicheTechSheet
          key={sheetKey}
          level={level} sessionNumber={sessionNumber}
          individual={individual} collective={collective}
          savedFields={savedFields}
          onBack={handleNew}
          onPrint={handlePrint}
          onSave={handleSave}
          onShare={preview ? undefined : handleShare}
          readOnly={!!preview}
          onRegenerate={handleRegenerate}
        />
      )}
    </div>
  );
}
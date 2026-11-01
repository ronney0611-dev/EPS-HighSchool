"use client";

import { useState, useCallback, useEffect } from "react";
import FicheTechConfigP from "@/components/FicheTechConfigP";
import FicheTechSheetP from "@/components/FicheTechSheetP";
import { EMPTY_PICK_P, type SessionPickState } from "@/src/config/fichePrimaireData";
import { useFicheTechP } from "@/hooks/useFicheTechP";
import { useShared } from "@/hooks/useShared";

// preview = a shared fiche shown read-only in the library (same sheet, same styles)
export type FichePPreview = { level: string; pick: SessionPickState; fields: Record<string, string> };

export default function FicheTechWizardP({ preview }: { preview?: FichePPreview } = {}) {
  const [page, setPage] = useState<1 | 2>(preview ? 2 : 1);
  const [level, setLevel] = useState(preview?.level ?? "level1");
  const [pick, setPick] = useState<SessionPickState>(preview?.pick ?? EMPTY_PICK_P);

  // saved fiches
  const { list, loading: listLoading, fetchList, fetchOne, save, remove } = useFicheTechP();
  const [ficheId, setFicheId] = useState<string | null>(null);
  const [savedFields, setSavedFields] = useState<Record<string, string> | undefined>(preview?.fields);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [sheetKey, setSheetKey] = useState(0);
  const configKey = JSON.stringify({ level, pick });

  useEffect(() => { if (!preview) fetchList(); }, [fetchList, preview]);

  const { publish } = useShared();
  // a snapshot of what is on the screen; the saved fiche (if any) is the source -> publishing again updates it
  const handleShare = (fields: Record<string, string>, title: string) =>
    publish("ficheP", { level, pick, fields }, ficheId, title);

  // the choice changed after opening a saved fiche -> its text no longer matches: start from the defaults
  const handleNext = () => {
    if (loadedKey !== null && loadedKey !== configKey) {
      setSavedFields(undefined);
      setLoadedKey(null);
      setFicheId(null);
    }
    setSheetKey((k) => k + 1);
    setPage(2);
  };

  const handleNew = () => {
    setFicheId(null);
    setSavedFields(undefined);
    setLoadedKey(null);
    setLevel("level1");
    setPick(EMPTY_PICK_P);
    setPage(1);
  };

  const handleOpen = async (id: string) => {
    const f = await fetchOne(id);
    if (!f) return alert("تعذر فتح البطاقة، حاول مرة أخرى");
    setLevel(f.level);
    setPick(f.pick);
    setFicheId(f._id);
    setSavedFields(f.fields);
    setLoadedKey(JSON.stringify({ level: f.level, pick: f.pick }));
    setSheetKey((k) => k + 1);
    setPage(2);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذه البطاقة نهائيا؟")) return;
    if (!(await remove(id))) return alert("فشل الحذف، حاول مرة أخرى");
    if (id === ficheId) handleNew();
    fetchList();
  };

  const handleSave = async (fields: Record<string, string>, title: string) => {
    const doc = await save({ _id: ficheId, title, level, pick, fields });
    if (!doc) return false;
    setFicheId(doc._id);
    setSavedFields(fields);
    setLoadedKey(configKey);
    fetchList();
    return true;
  };

  const handlePrint = useCallback(() => window.print(), []);

  // Print = ALWAYS one A4 landscape page (button AND Ctrl+P): the sheet gets the print styles,
  // then it is zoomed down until it fits.
  useEffect(() => {
    const PAGE_W = 1075; // px: 297mm - 2x6mm margins
    const PAGE_H = 740;  // px: 210mm - 2x6mm margins, minus a small safety
    const MIN_ZOOM = 0.55;

    const fit = () => {
      const root = document.querySelector<HTMLElement>(".fiche-root");
      const sheet = document.getElementById("print-fiche-sheet-p");
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
      const sheet = document.getElementById("print-fiche-sheet-p");
      if (sheet) { sheet.style.width = ""; sheet.style.zoom = ""; }
    };

    window.addEventListener("beforeprint", fit);
    window.addEventListener("afterprint", reset);
    return () => {
      window.removeEventListener("beforeprint", fit);
      window.removeEventListener("afterprint", reset);
    };
  }, []);

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

          /* drawings */
          .p-draw svg { display:block; width:100%; height:auto; }

          /* print look (applied just before printing, measured, then zoomed to one page) */
          .fiche-root.print-mode { background:#fff !important; padding:0 !important; max-width:none !important; margin:0 !important; }
          .print-mode #print-fiche-sheet-p { box-shadow:none !important; border:none !important; margin:0 !important; }
          .print-mode .letterhead { padding:2mm 4mm !important; border-bottom:1.5pt solid var(--green) !important; }
          .print-mode .letterhead h1 { font-size:16px !important; margin:0 !important; }
          .print-mode .meta-strip { break-inside:avoid; }
          .print-mode .meta-item { padding:1.5mm 4mm !important; }
          .print-mode .meta-label { font-size:10px !important; }
          .print-mode .meta-value { font-size:13px !important; }
          .print-mode .objective-box { margin:1.5mm 4mm !important; padding:1.5mm 3mm !important; font-size:11px !important; }
          .print-mode .table-wrap { margin-top:1.5mm !important; overflow:visible !important; }
          .print-mode table.phases { width:100% !important; table-layout:fixed !important; font-size:11px !important; }
          .print-mode table.phases col:nth-child(1) { width:8% !important; }
          .print-mode table.phases col:nth-child(2) { width:20% !important; }
          .print-mode table.phases col:nth-child(3) { width:47% !important; }
          .print-mode table.phases col:nth-child(4) { width:5% !important; }
          .print-mode table.phases col:nth-child(5) { width:20% !important; }
          .print-mode table.phases th { padding:1.5mm 2mm !important; font-size:10.5px !important; }
          .print-mode table.phases td { padding:2mm !important; vertical-align:top !important; word-break:break-word !important; }
          .print-mode table.phases tr { break-inside:avoid !important; page-break-inside:avoid !important; }
          .print-mode .phase-label { white-space:normal !important; font-size:12px !important; }
          .print-mode .multi div + div { margin-top:3px; padding-top:3px; }

          @media print {
            @page { size: A4 landscape; margin: 6mm; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
            .toolbar { display: none !important; }
          }
      `}</style>

      {page === 1 && (
        <>
          <FicheTechConfigP level={level} setLevel={setLevel} pick={pick} setPick={setPick} onNext={handleNext} />

          <div className="panel" style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 className="panel-title" style={{ margin: 0 }}>📁 البطاقات المحفوظة</h3>
              {ficheId && <button className="btn btn-ghost" onClick={handleNew}>+ بطاقة جديدة</button>}
            </div>
            {listLoading ? (
              <p style={{ fontSize: 13, color: "#7A8471" }}>⏳ جاري التحميل...</p>
            ) : list.length === 0 ? (
              <p style={{ fontSize: 13, color: "#7A8471" }}>لا توجد بطاقات محفوظة بعد. أنشئ بطاقة واضغط «حفظ».</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                {list.map((f) => (
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
                      <div style={{ fontSize: 11, color: "#7A8471" }}>آخر تعديل: {new Date(f.updatedAt).toLocaleDateString("ar-DZ")}</div>
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
        <FicheTechSheetP
          key={sheetKey}
          level={level}
          pick={pick}
          onBack={handleNew}
          onPrint={handlePrint}
          savedFields={savedFields}
          onSave={preview ? undefined : handleSave}
          onShare={preview ? undefined : handleShare}
          readOnly={!!preview}
        />
      )}
    </div>
  );
}
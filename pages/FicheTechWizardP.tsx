"use client";

import { useState, useCallback } from "react";
import FicheTechConfigP from "@/components/FicheTechConfigP";
import FicheTechSheetP from "@/components/FicheTechSheetP";
import { EMPTY_PICK_P, type SessionPickState } from "@/src/config/fichePrimaireData";

export default function FicheTechWizardP() {
  const [page, setPage] = useState<1 | 2>(1);
  const [level, setLevel] = useState("level1");
  const [pick, setPick] = useState<SessionPickState>(EMPTY_PICK_P);

  const handlePrint = useCallback(() => window.print(), []);

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

          @media print {
            @page {
              size: A4 landscape;
              margin: 4mm;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            .toolbar { display: none !important; }

            .fiche-root {
              background: #fff !important;
              padding: 0 !important;
              max-width: 100% !important;
              margin: 0 !important;
            }

            #print-fiche-sheet {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              font-size: 11px !important;
              page-break-after: avoid !important;
            }

            .letterhead { padding: 3mm 4mm !important; border-bottom: 1.5pt solid var(--green) !important; }
            .letterhead h1 { font-size: 13px !important; margin: 0 !important; }

            .meta-strip { break-inside: avoid; }
            .meta-item { padding: 2mm 4mm !important; }
            .meta-label { font-size: 8px !important; }
            .meta-value { font-size: 10.5px !important; }

            .objective-box { margin: 2mm 4mm !important; padding: 2mm 4mm !important; font-size: 9.5px !important; }

            .table-wrap { margin-top: 3mm !important; overflow: visible !important; }

            table.phases {
              width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
              font-size: 9.5px !important;
            }

            table.phases col:nth-child(1) { width: 8% !important; }
            table.phases col:nth-child(2) { width: 19% !important; }
            table.phases col:nth-child(3) { width: 32% !important; }
            table.phases col:nth-child(4) { width: 6% !important; }
            table.phases col:nth-child(5) { width: 17% !important; }
            table.phases col:nth-child(6) { width: 18% !important; }

            table.phases th { padding: 2mm 3mm !important; font-size: 9px !important; }
            table.phases td { padding: 3mm !important; vertical-align: top !important; word-break: break-word !important; }

            /* fixed mm heights per row — fills the page regardless of content amount */
            table.phases tbody tr:nth-child(1) td { height: 32mm !important; }
            table.phases tbody tr:nth-child(2) td { height: 80mm !important; }
            table.phases tbody tr:nth-child(3) td { height: 28mm !important; }

            table.phases tr { break-inside: avoid !important; page-break-inside: avoid !important; }
          }
      `}</style>

      {page === 1 && (
        <FicheTechConfigP level={level} setLevel={setLevel} pick={pick} setPick={setPick} onNext={() => setPage(2)} />
      )}

      {page === 2 && (
        <FicheTechSheetP level={level} pick={pick} onBack={() => setPage(1)} onPrint={handlePrint} />
      )}
    </div>
  );
}
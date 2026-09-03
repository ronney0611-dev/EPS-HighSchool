"use client";

import { useState, useCallback } from "react";
import FicheTechConfig from "@/components/FicheTechConfig";
import FicheTechSheet from "@/components/FicheTechSheet";
import { EMPTY_PICK, type SportPickState } from "@/src/config/ficheTechData";

export default function FicheTechWizard() {
  const [page, setPage] = useState<1 | 2>(1);
  const [level, setLevel] = useState("level1");
  const [sessionNumber, setSessionNumber] = useState(1);
  const [individual, setIndividual] = useState<SportPickState>(EMPTY_PICK);
  const [collective, setCollective] = useState<SportPickState>(EMPTY_PICK);

  const canProceed =
    !!individual.sport && individual.indicatorId !== null && individual.chosenKeys.every(Boolean) && individual.chosenKeys.length > 0 &&
    !!collective.sport && collective.indicatorId !== null && collective.chosenKeys.every(Boolean) && collective.chosenKeys.length > 0;

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

            .fiche-root {
              background: #fff !important;
              padding: 0 !important;
              max-width: 100% !important;
              margin: 0 !important;
            }

            #print-fiche-sheet {
              display: flex !important;
              flex-direction: column !important;
              width: 100% !important;
              max-width: 100% !important;
              height: 202mm !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              border: none !important;
              font-size: 11px !important;
            }

            .letterhead {
              padding: 4px 8px !important;
              border-bottom: 2px solid var(--green) !important;
            }
            .letterhead h1 {
              font-size: 15px !important;
              margin: 0 !important;
            }
            .letterhead .eyebrow {
              display: none !important;
            }

            .meta-strip {
              display: grid !important;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .meta-item {
              padding: 3px 10px !important;
            }
            .meta-label {
              font-size: 8.5px !important;
            }
            .meta-value {
              font-size: 11px !important;
            }

            .objective-box {
              margin: 4px 8px !important;
              padding: 3px 10px !important;
              font-size: 10px !important;
            }

            .table-wrap {
              flex: 1 !important;
              height: 100% !important;
              overflow: visible !important;
              margin-top: 6px !important;
            }

            table.phases {
              width: 100% !important;
              height: 100% !important;
              font-size: 10.5px !important;
            }
            table.phases th,
            table.phases td {
              padding: 6px 8px !important;
            }
            table.phases tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
      `}</style>

      {page === 1 ? (
        <FicheTechConfig
          level={level} setLevel={setLevel}
          sessionNumber={sessionNumber} setSessionNumber={setSessionNumber}
          individual={individual} setIndividual={setIndividual}
          collective={collective} setCollective={setCollective}
          canProceed={canProceed}
          onNext={() => setPage(2)}
        />
      ) : (
        <FicheTechSheet
          level={level} sessionNumber={sessionNumber}
          individual={individual} collective={collective}
          onBack={() => setPage(1)}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}
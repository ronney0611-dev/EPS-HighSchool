// components/FicheTechSheetP.tsx
"use client";

import { Printer, ChevronRight } from "lucide-react";
import { LEVEL_DATA_P, getExercisePool, type SessionPickState } from "@/src/config/fichePrimaireData";
import { useTeacher } from "@/hooks/useTeacher";

export default function FicheTechSheetP({
  level,
  pick,
  onBack,
  onPrint,
}: {
  level: string;
  pick: SessionPickState;
  onBack: () => void;
  onPrint: () => void;
}) {
  const levelData = LEVEL_DATA_P.find((l) => l.key === level)!;
  const maidanData = levelData.maidans.find((m) => m.key === pick.maidan)!;
  const session = maidanData.curriculum.sessions.find((s) => s.unit_name === pick.unitName)!;

  const pool = getExercisePool(level, pick.maidan, pick.unitName);
  const exercises = (pick.chosenIds.filter(Boolean) as string[]).map((id) => pool.find((e) => e.id === id)!);

  const { teacher } = useTeacher();

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-ghost" onClick={onBack}>
          <ChevronRight size={16} /> رجوع للتعديل
        </button>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={onPrint}>
            <Printer size={16} /> طباعة
          </button>
        </div>
      </div>

      <div className="sheet" id="print-fiche-sheet-p">
        <div className="letterhead">
          <h1>الوحدة التعلمية</h1>
        </div>

        <div className="meta-strip">
          <div className="meta-item">
            <span className="meta-label">الأستاذ(ة)</span>
            <span className="meta-value" contentEditable suppressContentEditableWarning>{teacher.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">المؤسسة</span>
            <span className="meta-value" contentEditable suppressContentEditableWarning>{teacher.school}</span>
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
            <span className="meta-value" contentEditable suppressContentEditableWarning></span>
          </div>
        </div>

        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الكفاءة المستهدفة: </strong>
          <span contentEditable suppressContentEditableWarning>{session.kafa_components}</span>
        </div>

        <div className="table-wrap overflow-x-auto ">
          <table className="phases">
            <colgroup>
              <col /><col /><col /><col /><col /><col />
            </colgroup>
            <thead>
              <tr>
                <th>المراحل</th>
                <th>محتوى التعلم</th>
                <th>محتوى الإنجاز</th>
                <th>المدة</th>
                <th>التشكيلات</th>
                <th>التوجيهات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="phase-label">المرحلة التحضيرية</td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi"> تهيئة الجسم بالجري بوتيرة منخفضة.</div>
                </td>
                <td contentEditable suppressContentEditableWarning>
                  التشكيلة, المناداة, مراقبة اللباس, نزع الاشياء الخطيرة, مراقبة الحالة الصحية, شرح هدف الحصة, التحية
                  الاحماء. جري خفيف حول الميدان مع تمارين احماء الاطراف العلوية والسفلية.
                </td>
                <td contentEditable suppressContentEditableWarning>10د</td>
                <td contentEditable suppressContentEditableWarning></td>
                <td contentEditable suppressContentEditableWarning>الانتشار الجيد في الميدان <br /> تفادي الكلام والتزام الهدوء <br /> التنفس المنتظم شهيق زفير
                </td>
              </tr>

              <tr>
                <td className="phase-label">المرحلة التعليمية</td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi">{exercises.map((ex, i) => <div key={i}>{ex.mohtawaTaalum}</div>)}</div>
                </td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi">{exercises.map((ex, i) => <div key={i}><strong>{ex.title}: </strong>{ex.mohtawaInjaz}</div>)}</div>
                  <br />
                </td>
                <td contentEditable suppressContentEditableWarning>{exercises.reduce((sum, ex) => sum + ex.duration, 0)}د</td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi">{exercises.map((ex, i) => <div key={i}>{ex.tachkilat}</div>)}</div>
                </td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi">{exercises.map((ex, i) => <div key={i}>{ex.tawjihat}</div>)}</div>
                </td>
              </tr>

              <tr>
                <td className="phase-label">المرحلة الختامية</td>
                <td contentEditable suppressContentEditableWarning>العودة بالجسم الى الحالة الطبيعية (الاسترخاء)</td>
                <td contentEditable suppressContentEditableWarning>حركات الاسترخاء, جمع الوسائل الرياضية, الاصطفاف وتحية ثم انصراف</td>
                <td contentEditable suppressContentEditableWarning>5د</td>
                <td contentEditable suppressContentEditableWarning></td>
                <td contentEditable suppressContentEditableWarning>الحفاظ على الهدوء والانضباط والاصغاء لتعليمات الأستاذ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
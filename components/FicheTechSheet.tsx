"use client";

import { Printer, ChevronRight } from "lucide-react";
import { LEVEL_DATA, poolExercises, type SportPickState } from "@/src/config/ficheTechData";
import { useTeacher } from "@/hooks/useTeacher";

export default function FicheTechSheet({
  level,
  sessionNumber,
  individual,
  collective,
  onBack,
  onPrint,
}: {
  level: string;
  sessionNumber: number;
  individual: SportPickState;
  collective: SportPickState;
  onBack: () => void;
  onPrint: () => void;
}) {
  const levelData = LEVEL_DATA[level];

  const individualExercises = (individual.chosenKeys.filter(Boolean) as string[]).map(
    (key) => poolExercises(levelData.banks[individual.sport], individual.indicatorId).find((e) => e.key === key)!
  );
  const collectiveExercises = (collective.chosenKeys.filter(Boolean) as string[]).map(
    (key) => poolExercises(levelData.banks[collective.sport], collective.indicatorId).find((e) => e.key === key)!
  );

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

      <div className="sheet" id="print-fiche-sheet">
        <div className="letterhead">
          <h1>بطاقة الوحدة التعليمية </h1>
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
            <span className="meta-label">النشاط الفردي</span>
            <span className="meta-value">{levelData.curriculum.sports[individual.sport]?.activity}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">النشاط الجماعي</span>
            <span className="meta-value">{levelData.curriculum.sports[collective.sport]?.activity}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">رقم الحصة التعليمية</span>
            <span className="meta-value">{sessionNumber}</span>
          </div>
        </div>

        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الهدف (النشاط الفردي): </strong>
          <span contentEditable suppressContentEditableWarning></span>
        </div>
        <div className="objective-box">
          <strong style={{ fontSize: 12 }}>الهدف (النشاط الجماعي): </strong>
          <span contentEditable suppressContentEditableWarning></span>
        </div>

        <table className="phases overflow-x-auto">
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
              <td className="phase-label">المرحلة التحضيرية</td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
            </tr>
            <tr>
              <td className="phase-label">المرحلة الرئيسية — النشاط الفردي</td>
              <td><div className="multi">{individualExercises.map((ex, i) => <div key={i}>{ex.but}</div>)}</div></td>
              <td><div className="multi">{individualExercises.map((ex, i) => <div key={i}>{ex.description}</div>)}</div></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td><div className="multi">{individualExercises.map((ex, i) => <div key={i}>{ex.najah}</div>)}</div></td>
            </tr>
            <tr>
              <td className="phase-label">المرحلة الرئيسية — النشاط الجماعي</td>
              <td><div className="multi">{collectiveExercises.map((ex, i) => <div key={i}>{ex.but}</div>)}</div></td>
              <td><div className="multi">{collectiveExercises.map((ex, i) => <div key={i}>{ex.description}</div>)}</div></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td><div className="multi">{collectiveExercises.map((ex, i) => <div key={i}>{ex.najah}</div>)}</div></td>
            </tr>
            <tr>
              <td className="phase-label">المرحلة الختامية</td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
              <td contentEditable suppressContentEditableWarning></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
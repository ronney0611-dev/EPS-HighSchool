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
          <div className="meta-item border-b border-gray-300">
            <span className="meta-label">النشاط الجماعي</span>
            <span className="meta-value">{levelData.curriculum.sports[collective.sport]?.activity}</span>
          </div>
          <div className="meta-item border-b border-gray-300">
            <span className="meta-label ">رقم الحصة التعليمية</span>
            <span className="meta-value">{sessionNumber}</span>
          </div>
          <div className="meta-item border-t border-l border-gray-300 w-full">
            <span className="meta-label">الوسائل </span>
            <span className="meta-value" ></span>
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
                <td className="phase-label">المرحلة التحضيرية</td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi">التحضير النفسي. <br /> التحضير البدني العام ثم الخاص</div>
                </td>
                <td contentEditable suppressContentEditableWarning>الاصطفاف, مراقبة اللباس, المنادات, شرح هدف الحصة ثم تحية,
                  احماء عام: جري خفيف حول الملعب لمدة قصيرة ثم القيام بحركات الاحماء العام.
                  احماء خاص.
                </td>
                <td contentEditable suppressContentEditableWarning>15د</td>
                <td contentEditable suppressContentEditableWarning></td>
                <td contentEditable suppressContentEditableWarning>الالتزام بالاصطفاف, اللباس الرياضي, الانضباط, الانتباه, التركيز, الاحترام, التعاون</td>
              </tr>
              <tr>
                <td className="phase-label">المرحلة الرئيسية — النشاط الفردي</td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi">{individualExercises.map((ex, i) => <div key={i}>{ex.but}</div>)}</div>
                </td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi">{individualExercises.map((ex, i) => <div key={i}>{ex.description}</div>)}</div>
                  <br />
                  <div className=" border-t border-gray-300 border-dashed">تقويم تكويني: شبه منافسة</div>
                </td>
                <td contentEditable suppressContentEditableWarning>40د</td>
                <td contentEditable suppressContentEditableWarning></td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="multi">{individualExercises.map((ex, i) => <div key={i}>{ex.najah}</div>)}</div>
                </td>
              </tr>
              <tr>
                <td className="phase-label">المرحلة الرئيسية — النشاط الجماعي</td>
                <td contentEditable suppressContentEditableWarning><div className="multi">{collectiveExercises.map((ex, i) => <div key={i}>{ex.but}</div>)}</div></td>
                <td contentEditable suppressContentEditableWarning>
                  <div className="border-b pb-2 border-gray-300 border-dashed">احماء خاص:</div><br />
                  <div className="multi">{collectiveExercises.map((ex, i) => <div key={i}>{ex.description}</div>)}</div>
                  <br />
                  <div className=" border-t border-gray-300 border-dashed">تقويم تكويني: شبه منافسة</div>
                </td>
                <td contentEditable suppressContentEditableWarning>50د</td>
                <td contentEditable suppressContentEditableWarning></td>
                <td contentEditable suppressContentEditableWarning><div className="multi">{collectiveExercises.map((ex, i) => <div key={i}>{ex.najah}</div>)}</div></td>
              </tr>
              <tr>
                <td className="phase-label">المرحلة الختامية</td>
                <td contentEditable suppressContentEditableWarning>العودة بالجسم الى الحالة الطبيعية (الاسترخاء)</td>
                <td contentEditable suppressContentEditableWarning>جري خفيف حول الملعب, اصطفاف ( تمديدات ) , ومناقشة الحصة ثم تحية و انصراف.</td>
                <td contentEditable suppressContentEditableWarning>5د</td>
                <td contentEditable suppressContentEditableWarning></td>
                <td contentEditable suppressContentEditableWarning>العمل على استرخاء عضلات الجسم</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
'use client'

import { useClasses } from "@/hooks/useClasses"
import { useTeacher } from "@/hooks/useTeacher";
import { useGroupe } from '@/hooks/useGroupe';
import { useMostamir } from '@/hooks/useTakwimMostamir';
import { useAttendance } from '@/hooks/useMostamir';
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { type Activity, buildSessionWeeks, levelKeyOfClass } from "@/src/config/takwiniWeeks";

// attendance page: 3 trimesters x 12 weeks
const TRIMESTERS = [
  { label: 'الفصل الأول', startIndex: 0 },
  { label: 'الفصل الثاني', startIndex: 12 },
  { label: 'الفصل الثالث', startIndex: 24 },
];
// default trimester from today's date (sep-nov / dec-feb / mar-may)
const currentTrimester = () => {
  const m = new Date().getMonth() + 1;
  return m >= 9 && m <= 11 ? 0 : (m === 12 || m <= 2) ? 1 : 2;
};
// default individual activity of each trimester (same order as المخطط السنوي)
const ACTIVITY_OF_TRIMESTER: Activity[] = ['sprint', 'throw', 'longjump'];
const LEVEL_POINTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };
const avgToNote = (pts: number[]) => Math.max(0, Math.min(5, Math.round(pts.reduce((a, b) => a + b, 0) / pts.length)));

type TakwiniDoc = {
  students?: { studentId: string; performances?: string[]; levels?: string[] }[]
  groupLevels?: Record<string, string>
}

const TaqwimMostamir = () => {

  const [classSelect, setClassSelect] = useState('');
  const { classes, studentsByClass, fetchStudents } = useClasses();
  const selectedClassData = classes.find(c => c.name === classSelect);
  const classStudents = selectedClassData ? (studentsByClass[selectedClassData._id] || []) : [];
  const { teacher } = useTeacher();
  const { mostamir, fetchMostamir, saveMostamir } = useMostamir();
  const { groupe, fetchGroupes } = useGroupe();
  const groupLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const [scores, setScores] = useState<number[][]>([]);
  const { attendance, fetcheAttendance } = useAttendance();
  const [trimester, setTrimester] = useState(currentTrimester);
  const [activity, setActivity] = useState<Activity>(ACTIVITY_OF_TRIMESTER[currentTrimester()]);
  const [filling, setFilling] = useState(false);

  const getStudentGroup = (studentId: string) => {
    if (!groupe || groupe.length === 0) return '—';
    const groupIndex = groupe.findIndex(g =>
      g.students.some(s => s.id === studentId || s._id?.toString() === studentId)
    );
    return groupIndex !== -1 ? groupLabels[groupIndex] : '—';
  };

  const handleClassSelect = (className: string) => {
    setClassSelect(className);
    const found = classes.find(c => c.name === className);
    if (found) {
      fetchStudents(found._id);
      fetchGroupes(found._id);
      fetchMostamir(found._id);
      fetcheAttendance(found._id);
    }
  };

  const getGroupIndex = (studentId: string) =>
    (groupe ?? []).findIndex(g => g.students.some(s => s.id === studentId || s._id?.toString() === studentId));

  // ⚡ fills المواظبة (attendance), المشاركة (collective takwini), ج معرفي (individual takwini). ج وجداني stays manual.
  const autoFill = async () => {
    if (!selectedClassData) return toast("اختر القسم أولا", { type: "error" });
    setFilling(true);
    try {
      const [tkRes, wkRes] = await Promise.all([
        axios.get(`/api/takwini/${selectedClassData._id}`, { params: { activity } }).catch(() => null),
        axios.get(`/api/takwini-weeks`, { params: { activity } }).catch(() => null),
      ]);
      const doc: TakwiniDoc | null = tkRes?.data?.data ?? null;
      const savedWeeks: number[] = Array.isArray(wkRes?.data?.weeks) ? wkRes!.data.weeks : [];

      // 6 or 9 sessions, like the takwini page
      const used = [
        ...(doc?.students ?? []).flatMap(s => [...(s.levels ?? []), ...(s.performances ?? [])].map((v, i) => (v ? i : -1))),
        ...Object.keys(doc?.groupLevels ?? {}).map(k => Number(k.split('-').pop())),
      ];
      const sessions = used.some(i => i >= 6) ? 9 : 6;
      const sessionWeeks = buildSessionWeeks(savedWeeks, sessions, levelKeyOfClass(selectedClassData.name), activity);
      const start = TRIMESTERS[trimester].startIndex;

      const next = classStudents.map((st, i) => {
        const row = [...(scores[i] ?? [5, 5, 5, 5])];
        if (st.status === 'malade') return row;
        const att = attendance.find(a => String(a.studentId) === st._id)?.sessions ?? [];

        // المواظبة: 5 - 1 per absence (A) - 1 per no uniform (ST) in the trimester
        const cells = att.slice(start, start + 12);
        const minus = cells.filter(v => v === 'A' || v === '0').length;
        row[0] = Math.max(0, 5 - minus);

        if (doc) {
          // المشاركة: his group's collective levels, only where he was present
          const gIdx = getGroupIndex(st._id);
          const groupPts: number[] = [];
          for (let gi = 0; gi < sessions; gi++) {
            const a = att[sessionWeeks[gi]];
            if (a === 'A' || a === 'M') continue;
            const key = gIdx !== -1 ? `${gIdx}-${gi}` : `nogroup-${st._id}-${gi}`;
            const p = LEVEL_POINTS[doc.groupLevels?.[key] ?? ''];
            if (p) groupPts.push(p);
          }
          if (groupPts.length) row[1] = avgToNote(groupPts);

          // ج معرفي: his own الأداء levels (individual sport)
          const own = (doc.students?.find(s => String(s.studentId) === st._id)?.levels ?? [])
            .map(l => LEVEL_POINTS[l]).filter(Boolean);
          if (own.length) row[2] = avgToNote(own);
        }
        return row;
      });

      setScores(next);
      toast(doc
        ? "تم الملء التلقائي، راجع العلامات ثم اضغط حفظ"
        : "تم ملء المواظبة فقط: لا توجد بيانات تقويم تكويني لهذا النشاط", { type: doc ? "success" : "warning" });
    } catch (err) {
      console.error(err);
      toast("حدث خطأ أثناء الملء التلقائي", { type: "error" });
    } finally {
      setFilling(false);
    }
  };

  useEffect(() => {
    if (!classSelect) return;
    const found = classes.find(c => c.name === classSelect);
    if (!found) return;
    const foundStudents = studentsByClass[found._id] || [];
    if (foundStudents.length === 0) return;

    setTimeout(() => {
      if (mostamir.length > 0) {
        const saved = mostamir as unknown as { studentId?: string; scores: number[] }[];
        const hasIds = saved.some(s => s.studentId);
        setScores(foundStudents.map((st, i) =>
          (hasIds ? saved.find(s => String(s.studentId) === st._id)?.scores : saved[i]?.scores) ?? [5, 5, 5, 5]));
      } else {
        setScores(foundStudents.map(() => [5, 5, 5, 5]));
      }
    }, 0);
  }, [mostamir, studentsByClass, classSelect]);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;

    const rowsHTML = classStudents.map((student, index) => {
      const isMalade = student.status === 'malade';
      const total = scores[index]?.reduce((a, b) => a + b, 0) ?? 20;
      const rowColor = isMalade ? '#fca5a5' : student.status === 'special' ? '#fde68a' : student.gender === 'female' ? '#fbcfe8' : '#bfdbfe';
      return `
        <tr style="background: ${rowColor};">
          <td style="border:1px solid black; padding:4px; text-align:center;">${index + 1}</td>
          <td style="border:1px solid black; padding:4px; text-align:right;">${student.name}</td>
          <td style="border:1px solid black; padding:4px; text-align:center;">${getStudentGroup(student._id)}</td>
          ${isMalade
          ? `<td colspan="5" style="border:1px solid black; padding:4px; text-align:center; color:#dc2626; font-weight:bold;">اعفاء</td>`
          : `
              <td style="border:1px solid black; padding:4px; text-align:center;">${scores[index]?.[0] ?? 5}</td>
              <td style="border:1px solid black; padding:4px; text-align:center;">${scores[index]?.[1] ?? 5}</td>
              <td style="border:1px solid black; padding:4px; text-align:center;">${scores[index]?.[2] ?? 5}</td>
              <td style="border:1px solid black; padding:4px; text-align:center;">${scores[index]?.[3] ?? 5}</td>
              <td style="border:1px solid black; padding:4px; text-align:center; font-weight:bold;">${total}</td>
            `
        }
        </tr>
      `;
    }).join('');

    win.document.write(`
      <html>
      <head>
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 2mm; font-family: sans-serif; direction: rtl; background: white; color: black; font-size: 12px; }
          @page { size: A4 portrait; margin: 2mm; }
          table { width: 100%; border-collapse: collapse; }
          th { border: 1px solid black; padding: 4px; text-align: center; background: #bfdbfe; font-size: 9px; }
        </style>
      </head>
      <body>
        <div style="text-align:center; border-bottom: 2px solid #9ca3af; padding-bottom: 8px; margin-bottom: 8px;">
          <h1 style="font-size:16px; font-weight:bold; margin:0;">علامة المراقبة المستمرة</h1>
        </div>
        <table style="margin-bottom:8px; border-collapse:collapse;">
          <tr>
            <td style="border:1px solid #9ca3af; padding:4px;">المؤسسة : ${teacher.school || '—'}</td>
            <td style="border:1px solid #9ca3af; padding:4px;"> السنة الدراسية : 2026/2027</td>
          </tr>
          <tr>
            <td style="border:1px solid #9ca3af; padding:4px;">الأستاذ : ${teacher.name || '—'}</td>
            <td style="border:1px solid #9ca3af; padding:4px;">القسم : ${classSelect || '—'}</td>
          </tr>
        </table>
        <table>
          <thead>
            <tr>
              <th rowspan="3">#</th>
              <th rowspan="3">اسماء التلاميذ</th>
              <th rowspan="3">الفوج</th>
              <th colspan="5">علامة المراقبة المستمرة</th>
            </tr>
            <tr>
              <th>المواظبة/ح/ل</th>
              <th>المشاركة/مب</th>
              <th>ج معرفي</th>
              <th>ج وجداني</th>
              <th>ن ت مستمر</th>
            </tr>
            <tr>
              <th>5/5</th>
              <th>5/5</th>
              <th>5/5</th>
              <th>5/5</th>
              <th>20/20</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const cell = 'border border-black px-1 py-1 text-center text-xs';
  const th = 'border border-black px-1 py-1 text-center text-xs bg-blue-200';

  return (
    <div dir='rtl' className="mx-2 lg:mx-20 my-6 flex flex-col gap-4">

      <div className='print:hidden flex flex-wrap gap-4 items-center border border-gray-300 rounded-xl p-4'>
        <div className='flex gap-2 items-center'>
          <label className='font-semibold text-sm'>اختر القسم</label>
          <select
            className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
            onChange={e => handleClassSelect(e.target.value)}>
            <option value="">— اختر —</option>
            {classes.map((c, i) => (
              <option key={i} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className='flex gap-2 items-center'>
          <label className='font-semibold text-sm'>الفصل</label>
          <select
            className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
            value={trimester}
            onChange={e => {
              const t = Number(e.target.value);
              setTrimester(t);
              setActivity(ACTIVITY_OF_TRIMESTER[t]);
            }}>
            {TRIMESTERS.map((t, i) => <option key={i} value={i}>{t.label}</option>)}
          </select>
        </div>
        <div className='flex gap-2 items-center'>
          <label className='font-semibold text-sm'>النشاط الفردي</label>
          <select
            className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
            value={activity}
            onChange={e => setActivity(e.target.value as Activity)}>
            <option value="sprint">عدو 60م</option>
            <option value="longjump">الوثب الطويل</option>
            <option value="throw">دفع الجلة</option>
          </select>
        </div>
        <button
          onClick={autoFill}
          disabled={filling}
          className='bg-emerald-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-xl text-sm font-bold cursor-pointer'>
          {filling ? '⏳ ...' : '⚡ ملء تلقائي'}
        </button>
        <p className='w-full text-xs text-gray-500'>
          المواظبة: 5 − (غياب + بدون بدلة) · المشاركة: مستوى الفوج في النشاط الجماعي · ج معرفي: مستوى الأداء في النشاط الفردي · ج وجداني: يدوي
        </p>
      </div>

      <div id="a4-tkm" className="bg-white text-black p-4 lg:p-8 border border-gray-300 shadow-md flex flex-col gap-4">
        <div className="text-center border-b-2 border-gray-400 pb-3">
          <h1 className="text-lg font-bold">علامة المراقبة المستمرة</h1>
        </div>

        <div className="grid grid-cols-2 border border-gray-400 text-sm">
          <div className="border-l border-gray-400 p-2">المؤسسة : {teacher.school || '—'}</div>
          <div className="p-2">
            السنة الدراسية : 2026/2027
          </div>
          <div className="border-t border-l border-gray-400 p-2">الأستاذ : {teacher.name || '—'}</div>
          <div className="border-t border-gray-400 p-2">القسم : {classSelect || '—'}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr>
                <th className={th} rowSpan={3}>#</th>
                <th className={th} rowSpan={3}>اسماء التلاميذ</th>
                <th className={th} rowSpan={3}>الفوج</th>
                <th className={th} colSpan={5}>علامة المراقبة المستمرة</th>
              </tr>
              <tr>
                {['المواظبة/ح/ل', 'المشاركة/مب', 'ج معرفي', 'ج وجداني', 'ن ت مستمر'].map((item, i) => (
                  <th key={i} className={th}>{item}</th>
                ))}
              </tr>
              <tr>
                {['5/5', '5/5', '5/5', '5/5', '20/20'].map((item, i) => (
                  <th key={i} className={th}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, index) => {
                const isMalade = student.status === 'malade';
                const rowColor = isMalade ? 'bg-red-200' : student.status === 'special' ? 'bg-yellow-200' : student.gender === 'female' ? 'bg-pink-200' : 'bg-blue-100';
                const total = scores[index]?.reduce((a, b) => a + b, 0) ?? 20;

                return (
                  <tr key={index} className={rowColor}>
                    <td className={cell}>{index + 1}</td>
                    <td className={`${cell} text-right whitespace-nowrap px-2`}>{student.name}</td>
                    <td className={cell}>{getStudentGroup(student._id)}</td>
                    {isMalade ? (
                      <td className={`${cell} text-red-600 font-bold`} colSpan={5}>اعفاء</td>
                    ) : (
                      <>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <td key={i} className={cell}>
                            <select
                              value={scores[index]?.[i] ?? 5}
                              className="bg-transparent border-none outline-none text-center text-xs w-full appearance-none"
                              onChange={e => {
                                const updated = scores.map((s, si) =>
                                  si === index ? s.map((v, vi) => vi === i ? Number(e.target.value) : v) : s
                                );
                                setScores(updated);
                              }}>
                              {[5, 4, 3, 2, 1, 0].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                        <td className={`${cell} font-bold`}>{total}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!selectedClassData && (
          <div className="text-center text-gray-400 my-6">اختر القسم لعرض التلاميذ</div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={async () => {
            if (!selectedClassData) return;
            try {
              const res: unknown = await saveMostamir(selectedClassData._id, classStudents.map((s, i) => ({
                studentId: s._id,
                name: s.name,
                scores: scores[i] ?? [5, 5, 5, 5],
                total: scores[i]?.reduce((a, b) => a + b, 0) ?? 20,
              })));
              if (res === false) throw new Error('save failed');
              toast("تم حفظ المعلومات بنجاح !", { type: "success" });
            } catch {
              toast("فشل الحفظ، حاول مرة أخرى", { type: "error" });
            }
          }}
          className='bg-blue-700 text-white px-6 py-2 rounded-xl text-sm cursor-pointer'>
          💾 حفظ
        </button>
        <button
          onClick={handlePrint}
          className='bg-blue-700 text-white px-6 py-2 rounded-xl text-sm cursor-pointer'>
          🖨️ طباعة
        </button>
        <ToastContainer />
      </div>

    </div>
  );
};

export default TaqwimMostamir;
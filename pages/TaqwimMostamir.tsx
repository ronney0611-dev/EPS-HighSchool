'use client'

import { useClasses } from "@/hooks/useClasses"
import { useTeacher } from "@/hooks/useTeacher";
import { loadGroups, Group } from '@/hooks/useGroups'
import { useState } from "react";
import { saveMostamir, loadMostamir } from '@/hooks/useMostamir'

const TaqwimMostamir = () => {

  const [classSelect, setClassSelect] = useState('');
  const { classes } = useClasses();
  const selectedClassData = classes.find(c => c.name === classSelect);
  const { teacher } = useTeacher();

  const groups = loadGroups(classSelect) || [];
  const groupLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getStudentGroup = (studentId: string) => {
    if (!groups) return '—';
    const groupIndex = (groups as Group[]).findIndex(g => g.students.some(s => s.id === studentId));
    return groupIndex !== -1 ? groupLabels[groupIndex] : '—';
  };

  const [scores, setScores] = useState<number[][]>([])

  const handleClassSelect = (className: string) => {
    setClassSelect(className)
    const found = classes.find(c => c.name === className)
    if (found) setScores(found.students.map(() => [5, 5, 5, 5]));
    const saved = loadMostamir(className)
    if (found) setScores(saved ?? found.students.map(() => [5, 5, 5, 5]))
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return

    const rowsHTML = selectedClassData?.students.map((student, index) => {
      const isMalade = student.status === 'malade'
      const total = scores[index]?.reduce((a, b) => a + b, 0) ?? 20
      const rowColor = isMalade ? '#fca5a5' : student.status === 'special' ? '#fde68a' : student.gender === 'female' ? '#fbcfe8' : '#bfdbfe'
      return `
        <tr style="background: ${rowColor};">
          <td style="border:1px solid black; padding:4px; text-align:center;">${index + 1}</td>
          <td style="border:1px solid black; padding:4px; text-align:right;">${student.name}</td>
          <td style="border:1px solid black; padding:4px; text-align:center;">${getStudentGroup(student.id)}</td>
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
      `
    }).join('')

    win.document.write(`
      <html>
      <head>
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 8mm; font-family: sans-serif; direction: rtl; background: white; color: black; font-size: 12px; }
          @page { size: A4 portrait; margin: 8mm; }
          table { width: 100%; border-collapse: collapse; }
          th { border: 1px solid black; padding: 4px; text-align: center; background: #bfdbfe; font-size: 11px; }
        </style>
      </head>
      <body>
        <div style="text-align:center; border-bottom: 2px solid #9ca3af; padding-bottom: 8px; margin-bottom: 12px;">
          <h1 style="font-size:16px; font-weight:bold; margin:0;">علامة المراقبة المستمرة</h1>
        </div>
        <table style="margin-bottom:12px; border-collapse:collapse;">
          <tr>
            <td style="border:1px solid #9ca3af; padding:6px;">المؤسسة : ${teacher.school || '—'}</td>
            <td style="border:1px solid #9ca3af; padding:6px;">المستوى : ${selectedClassData?.level || '—'}</td>
          </tr>
          <tr>
            <td style="border:1px solid #9ca3af; padding:6px;">الأستاذ : ${teacher.name || '—'}</td>
            <td style="border:1px solid #9ca3af; padding:6px;">القسم : ${classSelect || '—'}</td>
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
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const cell = 'border border-black px-1 py-1 text-center text-xs'
  const th = 'border border-black px-1 py-1 text-center text-xs bg-blue-200'

  return (
    <div dir='rtl' className="mx-2 lg:mx-20 my-6 flex flex-col gap-4">

      {/* Controls */}
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

      </div>

      {/* Document */}
      <div id="a4-card" className="bg-white text-black p-4 lg:p-8 border border-gray-300 shadow-md flex flex-col gap-4">

        {/* Header */}
        <div className="text-center border-b-2 border-gray-400 pb-3">
          <h1 className="text-lg font-bold">علامة المراقبة المستمرة</h1>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 border border-gray-400 text-sm">
          <div className="border-l border-gray-400 p-2">المؤسسة : {teacher.school || '—'}</div>
          <div className="p-2">المستوى : {selectedClassData?.level || '—'}</div>
          <div className="border-t border-l border-gray-400 p-2">الأستاذ : {teacher.name || '—'}</div>
          <div className="border-t border-gray-400 p-2">القسم : {classSelect || '—'}</div>
        </div>

        {/* Table */}
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
              {selectedClassData?.students.map((student, index) => {
                const isMalade = student.status === 'malade'
                const rowColor = isMalade ? 'bg-red-200' : student.status === 'special' ? 'bg-yellow-200' : student.gender === 'female' ? 'bg-pink-200' : 'bg-blue-100'
                const total = scores[index]?.reduce((a, b) => a + b, 0) ?? 20

                return (
                  <tr key={index} className={rowColor}>
                    <td className={cell}>{index + 1}</td>
                    <td className={`${cell} text-right whitespace-nowrap px-2`}>{student.name}</td>
                    <td className={cell}>{getStudentGroup(student.id)}</td>
                    {isMalade ? (
                      <td className={`${cell} text-red-600 font-bold`} colSpan={5}>اعفاء</td>
                    ) : (
                      <>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <td key={i} className={cell}>
                            <select
                              defaultValue="5"
                              className="bg-transparent border-none outline-none text-center text-xs w-full appearance-none"
                              onChange={e => {
                                const updated = scores.map((s, si) =>
                                  si === index ? s.map((v, vi) => vi === i ? Number(e.target.value) : v) : s
                                )
                                setScores(updated)
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
                )
              })}
            </tbody>
          </table>
        </div>

        {!selectedClassData && (
          <div className="text-center text-gray-400 my-6">اختر القسم لعرض التلاميذ</div>
        )}
      </div>
      <div className="flex justify-center gap-4" >
        <button
          onClick={() => saveMostamir(classSelect, scores)}
          className='bg-blue-700 text-white px-6 py-2 rounded-xl text-sm cursor-pointer'>
          💾 حفظ
        </button>
        <button
          onClick={handlePrint}
          className='bg-blue-700 text-white px-6 py-2 rounded-xl text-sm cursor-pointer'>
          🖨️ طباعة
        </button>
      </div>

    </div>
  )
}

export default TaqwimMostamir
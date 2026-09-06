'use client'
import { useClasses } from '@/hooks/useClasses'
import { useGroupe } from '@/hooks/useGroupe';
import { Sessions, useAttendance } from '@/hooks/useMostamir';
import { useTeacher } from '@/hooks/useTeacher';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify'

const TRIMESTERS = [
  { label: 'الفصل الأول', months: ['سبتمبر', 'أكتوبر', 'نوفمبر'], startIndex: 0 },
  { label: 'الفصل الثاني', months: ['ديسمبر', 'جانفي', 'فيفري'], startIndex: 12 },
  { label: 'الفصل الثالث', months: ['مارس', 'أفريل', 'ماي'], startIndex: 24 },
];

const Mostamir = () => {
  const { classes, studentsByClass, fetchStudents } = useClasses();
  const [classSelect, setClassSelect] = useState('');
  const { attendance, fetcheAttendance, updateAttendance } = useAttendance();
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [trimesterIndex, setTrimesterIndex] = useState(0);
  const { teacher } = useTeacher();
  const selectedClassData = classes.find(c => c.name === classSelect);
  const classStudents = selectedClassData ? (studentsByClass[selectedClassData._id] || []) : [];
  const groupLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const activeTrimester = TRIMESTERS[trimesterIndex];

  const studentColor = (status: string, gender: string) => {
    if (status === 'malade') return 'bg-red-300 print:bg-red-600'
    if (status === 'special') return 'bg-yellow-200 print:bg-yellow-200'
    if (gender === 'female') return 'bg-pink-200 print:bg-pink-200'
    return 'bg-blue-100 print:bg-blue-100'
  }

  const toFlat = (data: Sessions[]) => {
    const flat: Record<string, string> = {}
    data.forEach(row => {
      row.sessions.forEach((val, j) => {
        flat[`${row.studentId}-${j}`] = val
      })
    })
    return flat
  }

  const toSessions = (flat: Record<string, string>): Sessions[] => {
    return classStudents.map(s => ({
      studentId: s._id,
      sessions: Array.from({ length: 36 }, (_, j) => flat[`${s._id}-${j}`] || '')
    }))
  }

  const [prevAttendance, setPrevAttendance] = useState(attendance);
  if (attendance !== prevAttendance) {
    setPrevAttendance(attendance);
    if (attendance.length > 0) {
      setGrid(toFlat(attendance));
    }
  }

  const { groupe, fetchGroupes } = useGroupe();
  const getStudentGroup = (studentId: string) => {
    if (!groupe || groupe.length === 0) return '—';
    const groupIndex = groupe.findIndex(g =>
      g.students.some(s => s.id === studentId)
    );
    return groupIndex !== -1 ? groupLabels[groupIndex] : '—';
  };

  return (
    <div dir='rtl' className='w-full min-h-screen bg-black text-white p-2 sm:p-4 font-["Noto_Kufi_Arabic","Cairo",sans-serif] space-y-6'>

      {/* controls */}
      <div className='print:hidden border border-neutral-800 bg-neutral-900/80 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 max-w-6xl mx-auto'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
          <div className='flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 flex-1 max-w-md'>
            <label className='font-bold text-xs sm:text-sm text-neutral-300 shrink-0'>اختر القسم:</label>
            <select
              className='w-full bg-transparent text-white text-xs sm:text-sm focus:outline-none cursor-pointer border-none'
              onChange={e => {
                setClassSelect(e.target.value);
                setGrid({});
                const found = classes.find(c => c.name === e.target.value)
                if (found) {
                  fetchStudents(found._id);
                  fetchGroupes(found._id);
                  fetcheAttendance(found._id);
                }
              }} >
              <option value="" className='bg-neutral-900 text-neutral-400'>— اختر القسم —</option>
              {classes.map((c, i) => (
                <option key={i} value={c.name} className='bg-neutral-900 text-white'>{c.name}</option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs text-neutral-200'>
            <span className='text-neutral-400 font-medium ml-1'>الدليل:</span>
            <span className='bg-blue-100 text-blue-950 font-bold px-2.5 py-1 rounded-lg shrink-0 border border-blue-200/50'>ذكر</span>
            <span className='bg-pink-200 text-pink-950 font-bold px-2.5 py-1 rounded-lg shrink-0 border border-pink-300/50'>أنثى</span>
            <span className='bg-red-300 text-red-950 font-bold px-2.5 py-1 rounded-lg shrink-0 border border-red-400/50'>معفى</span>
            <span className='bg-yellow-200 text-yellow-950 font-bold px-2.5 py-1 rounded-lg shrink-0 border border-yellow-300/50'>حالة شاذة</span>
          </div>
        </div>

        {/* trimester tabs */}
        <div className='flex gap-2'>
          {TRIMESTERS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTrimesterIndex(i)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${trimesterIndex === i
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* document card printable */}
      <div id="mostamir-card" className='bg-white text-black p-2 sm:p-4 rounded-2xl shadow-2xl max-w-7xl mx-auto overflow-hidden'>

        {/* header */}
        <table className='border border-black w-full text-center text-xs border-collapse '>
          <thead className='bg-blue-200 print:bg-blue-200'>
            <tr>
              <th className='border border-black py-1.5 font-bold text-sm' colSpan={3}>
                بطاقة الحضور والمتابعة — {activeTrimester.label}
              </th>
            </tr>
            <tr>
              <th className='border text-xs border-black px-1 py-1 font-semibold'>

              </th>
              <th className='border text-xs border-black px-1 py-1 font-semibold' colSpan={2}>
                القسم: <span className='font-medium'>{classSelect || '—'}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border border-black px-1 text-xs py-1 font-semibold'>
                المؤسسة: <span className='font-medium'>{teacher.school || '—'}</span>
              </td>
              <td className='border border-black px-1 text-xs py-1 font-semibold'>
                الأستاذ: <span className='font-medium'>{teacher.name || '—'}</span>
              </td>
              <td className='border border-black px-1 text-xs py-1 font-semibold'>
                السنة الدراسية: 2026/2027
              </td>
            </tr>
          </tbody>
        </table>

        {/* attendance table — only this trimester's 12 columns */}
        <div className='overflow-x-auto'>
           <table className='border border-black w-full mt-2 text-center' style={{ fontSize: '7px' }}>
            <thead>
              <tr>
                <th className='border px-2 border-black' rowSpan={3} style={{ width: '18px' }}>#</th>
                <th className='border border-black text-xs font-bold' rowSpan={3} style={{ width: '90px' }}>الاسم واللقب</th>
                <th className='border border-black text-xs font-bold' rowSpan={3} style={{ width: '22px' }}>الفوج</th>
                <th className='border border-black text-xs font-bold py-0.5' colSpan={12}>الشهر</th>
              </tr>
              <tr>
                {activeTrimester.months.map((month, i) => (
                  <th key={i} className='border border-black bg-amber-100 print:bg-amber-100 text-[9px] font-bold py-0.5' colSpan={4}>{month}</th>
                ))}
              </tr>
              <tr>
                {Array.from({ length: 12 }).map((_, i) => (
                  <th key={i} className='border border-black text-[8px]' style={{ width: '14px' }}>{(i % 4) + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s, i) => (
                <tr key={i} className='h-5'>
                  <td className={`border border-black font-semibold text-[9px] ${studentColor(s.status, s.gender)}`}>{i + 1}</td>
                  <td className={`border border-black text-right text-[10px] font-medium px-1 leading-tight whitespace-nowrap ${studentColor(s.status, s.gender)}`}>{s.name}</td>
                  <td className={`border px-1 border-black text-[9px] font-bold ${studentColor(s.status, s.gender)}`}>{getStudentGroup(s._id)}</td>
                  {Array.from({ length: 12 }).map((_, j) => {
                    const sessionIndex = activeTrimester.startIndex + j;
                    return (
                      <td key={j} className={`border border-black p-0 ${studentColor(s.status, s.gender)}`}>
                        <select
                          value={grid[`${s._id}-${sessionIndex}`] ?? ''}
                          onChange={e => setGrid(prev => ({ ...prev, [`${s._id}-${sessionIndex}`]: e.target.value }))}
                          className="border-none w-5 h-full text-center text-[9px] font-bold appearance-none bg-transparent cursor-pointer focus:outline-none"
                        >
                          <option value=""></option>
                          <option value="P">P</option>
                          <option value="A">A</option>
                          <option value="0">ST</option>
                          <option value="M">M</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* legend */}
        <table className='border border-black mt-2 text-lg mx-auto text-center bg-amber-100 print:bg-amber-100 border-collapse' style={{ fontSize: '9px' }}>
          <thead >
            <tr>
              <th className='border border-black px-2 py-0.5 font-medium'>الحضور = P</th>
              <th className='border border-black px-2 py-0.5 font-medium'>الغياب = A</th>
              <th className='border border-black px-2 py-0.5 font-medium'>بدون بدلة = ST</th>
              <th className='border border-black px-2 py-0.5 font-medium'>مرض = M</th>
            </tr>
          </thead>
        </table>

      </div>

      {/* action buttons */}
      <div className='print:hidden flex items-center justify-center gap-3 pt-2 pb-6'>
        <button onClick={() => {
          if (selectedClassData) updateAttendance(selectedClassData._id, toSessions(grid));
          toast("تم حفظ المعلومات بنجاح !", { type: "success" });
        }} className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-8 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-950/40 transition-all text-sm">
          حفظ التغييرات
        </button>
        <button
          onClick={() => window.print()}
          className='bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold px-8 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-red-950/40 transition-all text-sm flex items-center gap-2'>
          <span>طباعة</span>
          <span>🖨️</span>
        </button>
        <ToastContainer />
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 2mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background-color: white !important;
          }

          #mostamir-card {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            width: auto !important;
            max-width: auto !important;
          }

          #mostamir-card, #mostamir-card * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          thead {
            display: table-header-group;
          }

          select {
            -webkit-appearance: none;
            appearance: none;
            border: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Mostamir
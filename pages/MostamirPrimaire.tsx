'use client'
import { useClasses } from '@/hooks/useClasses'
import { useGroupe } from '@/hooks/useGroupe';
import { Sessions, useAttendance } from '@/hooks/useMostamir';
import { useTeacher } from '@/hooks/useTeacher';
import { useEffect, useState } from 'react';

const TRIMESTRE_MONTHS: Record<number, string[]> = {
  1: ['سبتمبر', 'أكتوبر', 'نوفمبر'],
  2: ['ديسمبر', 'جانفي', 'فيفري'],
  3: ['مارس', 'أفريل', 'ماي'],
};

const TRIMESTRE_OFFSET: Record<number, number> = { 1: 0, 2: 24, 3: 48 };

const MostamirPrimaire = () => {
  const { classes, studentsByClass, fetchStudents } = useClasses();
  const [classSelect, setClassSelect] = useState('');
  const [trimestre, setTrimestre] = useState<1 | 2 | 3>(1);
  const { attendance, fetcheAttendance, updateAttendance } = useAttendance();
  const [grid, setGrid] = useState<Record<string, string>>({});
  const { teacher } = useTeacher();
  const { groupe, fetchGroupes } = useGroupe();

  const selectedClassData = classes.find(c => c.name === classSelect);
  const classStudents = selectedClassData ? (studentsByClass[selectedClassData._id] || []) : [];
  const groupLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const offset = TRIMESTRE_OFFSET[trimestre];
  const months = TRIMESTRE_MONTHS[trimestre];

  const studentColor = (status: string, gender: string) => {
    if (status === 'malade') return 'bg-red-300 print:bg-red-300'
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
      sessions: Array.from({ length: 72 }, (_, j) => flat[`${s._id}-${j}`] || '')
    }))
  }

  useEffect(() => {
    if (attendance.length > 0) {
      setTimeout(() => setGrid(toFlat(attendance)), 0)
    }
  }, [attendance])

  const getStudentGroup = (studentId: string) => {
    if (!groupe || groupe.length === 0) return '—';
    const groupIndex = groupe.findIndex(g =>
      g.students.some(s => s.id === studentId || s._id?.toString() === studentId)
    );
    return groupIndex !== -1 ? groupLabels[groupIndex] : '—';
  };

  const th = 'border border-black px-1 py-1 text-center text-xs bg-blue-200 print:bg-blue-200';

  return (
    <div dir='rtl' className='mx-2 bg-white text-black my-4'>

      {/* controls */}
      <div className='print:hidden mb-6 flex flex-wrap gap-4 items-center m-4 rounded-xl p-4'>
        <div className='flex gap-2 items-center'>
          <label className='font-semibold text-sm'>القسم</label>
          <select
            className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
            onChange={e => {
              setClassSelect(e.target.value);
              const found = classes.find(c => c.name === e.target.value);
              if (found) {
                fetchStudents(found._id);
                fetchGroupes(found._id);
                fetcheAttendance(found._id);
              }
            }}
          >
            <option value="">— اختر —</option>
            {classes.map((c, i) => (
              <option key={i} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className='flex gap-2 items-center'>
          <label className='font-semibold text-sm'>الفصل</label>
          <div className='flex gap-1'>
            {([1, 2, 3] as const).map(t => (
              <button
                key={t}
                onClick={() => setTrimestre(t)}
                className={`px-4 py-1 rounded text-sm font-bold border transition ${
                  trimestre === t
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                الفصل {t === 1 ? 'الأول' : t === 2 ? 'الثاني' : 'الثالث'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* legend */}
      <div className='print:hidden mb-4 flex flex-wrap gap-2 text-sm px-8'>
        <span className='bg-blue-100 px-2 py-1 rounded'>ذكر</span>
        <span className='bg-pink-200 px-2 py-1 rounded'>أنثى</span>
        <span className='bg-red-300 px-2 py-1 rounded'>معفى</span>
        <span className='bg-yellow-200 px-2 py-1 rounded'>حالة شاذة</span>
      </div>

      {/* document */}
      <div id="a4-card" className='bg-white text-black p-2 md:p-4'>

        {/* header */}
        <table className='border border-black w-full text-center text-xs mb-1'>
          <thead className='bg-blue-200 print:bg-blue-200'>
            <tr>
              <th className='border border-black py-2 font-bold text-sm' colSpan={3}>
                بطاقة الحضور والمتابعة — الفصل {trimestre === 1 ? 'الأول' : trimestre === 2 ? 'الثاني' : 'الثالث'}
              </th>
            </tr>
            <tr>
              <th className='border text-sm border-black px-1 py-1 font-semibold'>
                المستوى: <span className='font-medium'>{selectedClassData?.level || '—'}</span>
              </th>
              <th className='border text-sm border-black px-1 py-1 font-semibold' colSpan={2}>
                القسم: <span className='font-medium'>{classSelect || '—'}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border border-black px-1 text-sm py-1 font-semibold'>
                المؤسسة: <span className='font-medium'>{teacher.school || '—'}</span>
              </td>
              <td className='border border-black px-1 py-1 font-semibold'>
                الأستاذ: <span className='font-medium'>{teacher.name || '—'}</span>
              </td>
              <td className='border border-black px-1 py-1 font-semibold'>
                السنة الدراسية: 2025/2026
              </td>
            </tr>
          </tbody>
        </table>

        {/* attendance table */}
        <div className='overflow-x-auto'>
          <table className='border border-black w-full text-center' style={{ fontSize: '7px' }}>
            <thead>
              <tr>
                <th className={th} rowSpan={3} style={{ width: '20px' }}>#</th>
                <th className={th} rowSpan={3} style={{ width: '90px' }}>الاسم واللقب</th>
                <th className={th} rowSpan={3} style={{ width: '20px' }}>الفوج</th>
                <th className={th} colSpan={24}>الشهر</th>
              </tr>
              <tr>
                {months.map((month, i) => (
                  <th key={i} className='border border-black bg-amber-100 print:bg-amber-100 text-xs' colSpan={8}>
                    {month}
                  </th>
                ))}
              </tr>
              <tr>
                {Array.from({ length: 12 }).map((_, i) => (
                  <th key={i} colSpan={2} className='border border-black' style={{ width: '16px' }}>
                    {(i % 4) + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s, i) => (
                <tr key={i}>
                  <td className={`border border-black font-semibold text-xs ${studentColor(s.status, s.gender)}`}>{i + 1}</td>
                  <td className={`border border-black text-right text-xs px-1 ${studentColor(s.status, s.gender)}`}>{s.name}</td>
                  <td className={`border border-black text-xs ${studentColor(s.status, s.gender)}`}>{getStudentGroup(s._id)}</td>
                  {Array.from({ length: 24 }).map((_, j) => {
                    const globalIdx = offset + j;
                    return (
                      <td key={j} className={`border border-black ${studentColor(s.status, s.gender)}`}>
                        <select
                          value={grid[`${s._id}-${globalIdx}`] ?? ''}
                          onChange={e => setGrid(prev => ({
                            ...prev,
                            [`${s._id}-${globalIdx}`]: e.target.value
                          }))}
                          className="border-none w-5 outline-none appearance-none bg-transparent text-center text-xs"
                        >
                          <option value=""></option>
                          <option value="P">P</option>
                          <option value="A">A</option>
                          <option value="0">0</option>
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
        <table className='border border-black mt-2 mx-auto text-center bg-amber-100 print:bg-amber-100' style={{ fontSize: '8px' }}>
          <thead>
            <tr>
              <th className='border text-xs border-black px-2 py-1'>الحضور = P</th>
              <th className='border text-xs border-black px-2 py-1'>الغياب = A</th>
              <th className='border text-xs border-black px-2 py-1'>بدون بدلة = 0</th>
              <th className='border text-xs border-black px-2 py-1'>مرض = M</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* actions */}
      <div className='flex justify-center my-4 gap-4 print:hidden'>
        <button
          onClick={() => {
            if (selectedClassData) updateAttendance(selectedClassData._id, toSessions(grid));
          }}
          className="bg-green-700 text-white px-6 py-2 rounded-xl text-sm cursor-pointer"
        >
          💾 حفظ
        </button>
        <button
          onClick={() => window.print()}
          className='bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold text-sm'
        >
          🖨️ طباعة
        </button>
      </div>

    </div>
  );
};

export default MostamirPrimaire;
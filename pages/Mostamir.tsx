'use client'
import { useClasses } from '@/hooks/useClasses'
import { useTeacher } from '@/hooks/useTeacher';
import { useState } from 'react';
import { loadGroups, Group } from '@/hooks/useGroups'

const Mostamir = () => {
  const { classes, studentsByClass, fetchStudents } = useClasses();
  const [classSelect, setClassSelect] = useState('');
  const [todaystate, setTodayState] = useState({
    present: 'P',
    absent: 'A',
    noUniform: '0',
    malade: 'M'
  });
  const { teacher } = useTeacher();
  const selectedClassData = classes.find(c => c.name === classSelect);
  const classStudents = selectedClassData ? (studentsByClass[selectedClassData._id] || []) : [];
  const groupLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const studentColor = (status: string, gender: string) => {
    if (status === 'malade') return 'bg-red-300 print:bg-red-600'
    if (status === 'special') return 'bg-yellow-200 print:bg-yellow-200'
    if (gender === 'female') return 'bg-pink-200 print:bg-pink-200'
    return 'bg-blue-100 print:bg-blue-100'
  }

  const groups = loadGroups(classSelect) || [];
  const getStudentGroup = (studentId: string) => {
    if (!groups) return '—';
    const groupIndex = (groups as Group[]).findIndex(g => g.students.some(s => s.id === studentId));
    return groupIndex !== -1 ? groupLabels[groupIndex] : '—';
  };
  return (
    <div dir='rtl' className='mx-2 bg-white text-black my-4'>

      {/* controls */}
      <div className='print:hidden mb-6 flex  m-4 flex-wrap gap-4 items-center rounded-xl p-4 py-6'>
        <div className='flex gap-2 items-center px-4'>
          <label className='font-semibold text-sm'>اختر القسم</label>
          <select
            className='border border-gray-300 rounded px-3 py-1 bg-white text-black text-sm'
            onChange={e => {
              setClassSelect(e.target.value)
              const found = classes.find(c => c.name === e.target.value)
              if (found) fetchStudents(found._id)
            }} >
            <option value="">— اختر —</option>
          {classes.map((c, i) => (
            <option key={i} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <hr className='border border-gray-200  w-full my-4' />
    </div>

      {/* legend */ }
  <div className='print:hidden mb-4 flex text-black flex-wrap gap-2 text-sm px-8'>
    <span className='bg-blue-100 px-2 py-1 rounded'>ذكر</span>
    <span className='bg-pink-200 px-2 py-1 rounded'>أنثى</span>
    <span className='bg-red-300 px-2 py-1 rounded'>معفى</span>
    <span className='bg-yellow-200 px-2 py-1 rounded'>حالة شاذة</span>
  </div>

  {/* document */ }
      <div id="a4-card" className='bg-white text-black p-2 md:p-6 '>

        {/* header */}
        <table className='border border-black w-full text-center text-xs '>
          <thead className='bg-blue-200 print:bg-blue-200'>
            <tr>
              <th className='border border-black py-2 font-bold text-sm' colSpan={3}>
                بطاقة الحضور والمتابعة
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
        <div className='overflow-x-auto '>
          <table className='border border-black w-full text-center' style={{ fontSize: '7px' }}>
            <thead>
              <tr>
                <th className='border border-black' rowSpan={3} style={{ width: '20px' }}>#</th>
                <th className='border text-sm border-black' rowSpan={3} style={{ width: '80px' }}>الاسم واللقب</th>
                <th className='border text-sm border-black' rowSpan={3} style={{ width: '20px' }}>الفوج</th>
                <th className='border border-black text-sm' colSpan={36}>الشهر</th>
              </tr>
              <tr>
                {['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي'].map((month, i) => (
                  <th key={i} className='border text-sm border-black bg-amber-100 print:bg-amber-100' colSpan={4}>{month}</th>
                ))}
              </tr>
              <tr>
                {Array.from({ length: 36 }).map((_, i) => (
                  <th key={i} className='border border-black' style={{ width: '14px' }}>{(i % 4) + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s, i) => (
                <tr key={i}>
                  <td className={`border border-black font-semibold ${studentColor(s.status, s.gender)}`}>{i + 1}</td>
                  <td className={`border border-black text-right text-sm px-1 ${studentColor(s.status, s.gender)}`}>{s.name}</td>
                  <td className={`border border-black text-sm ${studentColor(s.status, s.gender)}`}>{getStudentGroup(s._id)}</td>
                  {Array.from({ length: 36 }).map((_, j) => (
                    <td key={j} className={`border border-black ${studentColor(s.status, s.gender)}`}>
                      <select 
                        onChange={e => setTodayState({...todaystate, [`${i}-${j}`]: e.target.value})}
                        className="border-none w-6 outline-none appearance-none bg-transparent text-center text-sm" 
                        name="" id="">
                        <option value=""></option>
                        <option value="P">P</option>
                        <option value="A">A</option>
                        <option value="0">0</option>
                        <option value="M">M</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* legend */}
        <table className='border border-black mt-2 mx-auto text-center bg-amber-100 print:bg-amber-100' style={{ fontSize: '8px' }}>
          <thead>
            <tr>
              <th className='border  text-sm border-black px-2 py-1'>الحضور = P</th>
              <th className='border text-sm border-black px-2 py-1'>الغياب = A</th>
              <th className='border text-sm border-black px-2 py-1'>بدون بدلة = 0</th>
              <th className='border text-sm border-black px-2 py-1'>مرض = M</th>
            </tr>
          </thead>
        </table>

      </div>
      <div className='flex justify-center my-4'>
        <button
          onClick={() => window.print()}
          className='bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold text-sm my-4'>
          طباعة 🖨️
        </button>
      </div>
    </div >
  )
}

export default Mostamir
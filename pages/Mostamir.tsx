'use client'
import { useClasses } from '@/hooks/useClasses'
import { useState } from 'react';

const Mostamir = () => {
  const { classes, setClasses } = useClasses();
  const [classSlecet, setClassSelect] = useState('');
  const [info, setInfo] = useState({
    teacher: '',
    school: '',
    level:'',
    class:'',
  });
  const selectedClassData = classes.find(c => c.name === classSlecet);

  return (
    <div dir='rtl' className='mx-2'>
      <div className='mx-6 my-10 flex flex-col gap-2 border border-gray-50 p-4'>
        {/* info input */}
        <div className='flex flex-col gap-2'> 
          <div className='flex gap-2'>
            <label htmlFor="">المستوى </label>
            <input type="text" placeholder=' ادخل المستوى' className='px-2' onChange={e => setInfo({ ...info, level: e.target.value })} />
          </div>
          <div className='flex gap-2'>
            <label htmlFor="">القسم</label>
            <input type="text" placeholder='اسم القسم' className='px-2' onChange={e => setInfo({ ...info, class: e.target.value })} />
          </div>
          <div className='flex gap-2'>
            <label htmlFor="">الاستاذ</label>
            <input type="text" placeholder='اسم الاستاذ' className='px-2' onChange={e => setInfo({ ...info, teacher: e.target.value })} />
          </div>
          <div className='flex gap-2'>
            <label htmlFor="">المؤسسة</label>
            <input type="text" placeholder=' اسم المؤسسة ' className='px-2' onChange={e => setInfo({ ...info, school: e.target.value })} />
          </div>
        </div>
        {/* class select */}
        <div className='flex gap-2'>
          <label htmlFor="">اختر القسم</label>
          <select className='text-center py-1 px-4 bg-black' name="" id="" onChange={e => setClassSelect(e.target.value)}>
            {
              classes.map((c, i) => {
                return (
                  <option key={i} value={c.name}> {c.name} </option>
                )
              })}
          </select>
        </div>
      </div>
      <main className='overflow-x-auto mx-6 p-6 bg-white text-black my-10'>
        {/* notsheet */}
        <header>
          <table className='border border-black w-full bg-blue-200 text-center min-w-150 mx-4'>
          <thead className='border border-black text-center'>
            <tr className='border border-black text-center'>
              <th className='text-center py-1 font-semibold' colSpan={2}>بطاقة الحظور والمتابعة</th>
            </tr>
            <tr className='border border-black'>
              <th className='border font-semibold border-black'>المستوى : <span className='font-medium'>{info.level}</span></th>
              <th className='border font-semibold border-black' colSpan={2}>القسم : <span className='font-medium'>{info.class}</span></th>
            </tr>
            
          </thead>
          <tbody className='border border-black'>
            <tr className='border border-black'>
              <td className='border  font-semibold border-black'>المؤسسة : <span className='font-medium'>{info.school}</span></td>
              <td className='border  font-semibold border-black'>الاسم : <span className='font-medium'>{info.teacher}</span></td>
              <td className='border w-100 font-semibold border-black'>السنة الدراسية: 2026/2027</td>
            </tr>
          </tbody>
          </table>
        </header>
        <table className='border border-black w-full min-w-150 mx-4 text-center'>
          <thead className='border border-black'>
            <tr className='border border-black'>
              <th className='border border-black'></th>
              <th className='border border-black w-40'></th>
              <th className='' colSpan={9}>الشهر</th>
            </tr>
            <tr className='border border-black'>
              <th className='border border-black'></th>
              <th className=''>الاسم واللقب</th>
              {['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي'].map((month, i) => (
                <th key={i} className='border border-black bg-amber-200' colSpan={4}>{month}</th>
              ))}
            </tr>
          </thead>
          <tbody className='border border-black'>
            {selectedClassData?.students.map((s, i) => (
              <tr key={i}>
                <td className='border bg-blue-200 border-black'>{i + 1}</td>
                <td className='border bg-amber-200 border-black'>{s}</td>
                {Array.from({ length: 36 }).map((_, j) => (
                  <td key={j} className='border border-black'></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className='flex justify-center items-center text-center my-2 lg:mx-20 '>
          <table  className='border border-black w-full bg-amber-200'>
          <thead className='border border-black'>
            <tr className='border border-black'>
              <th className='border border-black'>الحضور = 1</th>
              <th className='border border-black'> الغياب = غ</th>
            </tr>
            <tr className='border border-black'>
              <th className='border border-black'>بدون بدلة = 0</th>
              <th className='border border-black'>مرض = م</th>
            </tr>
          </thead>
        </table>
        </div>
      </main>
    </div>
  )
}

export default Mostamir
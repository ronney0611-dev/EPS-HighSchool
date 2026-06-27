'use client'

import { useState } from "react"
import { primaireMokhatatatConfig } from "@/src/config/primairDoc"

const levelLabels: Record<string, string> = {
  s1: 'السنة الأولى ابتدائي',
  s2: 'السنة الثانية ابتدائي',
  s3: 'السنة الثالثة ابتدائي',
  s4: 'السنة الرابعة ابتدائي',
  s5: 'السنة الخامسة ابتدائي',
}

const Mokhatat = () => {
  // نجعل السنة الأولى ابتدائي (s1) هي الاختيار الافتراضي عند فتح الصفحة
  const [selectedLevel, setSelectedLevel] = useState<'s1' | 's2' | 's3' | 's4' | 's5'>('s1')

  const data = primaireMokhatatatConfig[selectedLevel]
  
  // تنسيقات الخلايا الموحدة للطباعة والوضوح
  const th = 'border border-black p-2 text-center font-bold text-xs bg-blue-100'
  const labelTd = 'border border-black p-2 text-center font-bold text-xs bg-gray-50 w-[15%]'
  const td = 'border border-black p-2 text-right text-[11px] leading-relaxed align-top w-[28%]'

  // دالة مساعدة لتحويل النص المفصول بنجمات إلى قائمة مرتبة
  const formatList = (text: string) => {
    if (!text) return null;
    const items = text.split('*').map(item => item.trim()).filter(Boolean);
    return (
      <ul className="list-none p-0 m-0 space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="relative pr-3 before:content-['•'] before:absolute before:right-0 before:text-blue-600 font-medium">
            {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div dir="rtl" className="bg-white text-black p-6 max-w-5xl mx-auto my-4 rounded-md shadow-sm print:shadow-none print:p-0">
      
      {/* 🔘 أداة اختيار مستوى السنة - تختفي تلقائياً عند الطباعة print:hidden */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-center gap-4 print:hidden">
        <label htmlFor="level-select" className="font-bold text-gray-700 text-sm">
          اختر مستوى السنة الدراسية لعرض المخطط السنوي:
        </label>
        <select
          id="level-select"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as 's1' | 's2' | 's3' | 's4' | 's5')}
          className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-50"
        >
          {Object.entries(levelLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* عنوان المخطط الرئيسي */}
      <h1 className="text-center font-bold text-lg mb-4 border-b-2 border-black pb-2">
        المخطط السنوي لبناء التعلمات — <span className="text-blue-600 print:text-black">{levelLabels[selectedLevel]}</span>
      </h1>

      {/* إذا لم توجد بيانات (احتياطاً) */}
      {!data ? (
        <p className="text-red-500 text-center font-medium my-10">البيانات غير متوفرة لهذا المستوى</p>
      ) : (
        <table className="w-full border-collapse border border-black table-fixed">
          <thead>
            {/* الكفاءة الشاملة */}
            <tr>
              <th className={labelTd}>الكفاءة الشاملة</th>
              <th className="border border-black p-3 text-right text-xs font-medium bg-blue-50/50" colSpan={3}>
                {data.kafaaShamelaTitle}
              </th>
            </tr>
            {/* العناوين والميادين */}
            <tr>
              <th className={labelTd}>الميدان</th>
              {data.maidans.map((m, i) => (
                <th key={i} className={`${th} bg-blue-200 text-sm`}>{m.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* الكفاءة الختامية */}
            <tr>
              <td className={labelTd}>الكفاءة الختامية</td>
              {data.maidans.map((m, i) => (
                <td key={i} className={`${td} font-medium text-center bg-gray-50/30`}>{m.kafaaKhitamiya}</td>
              ))}
            </tr>
            {/* مركبات الكفاءة */}
            <tr>
              <td className={labelTd}>مركبات الكفاءة</td>
              {data.maidans.map((m, i) => (
                <td key={i} className={td}>{m.merkabatKafaa}</td>
              ))}
            </tr>
            {/* الموارد المعرفية */}
            <tr>
              <td className={labelTd}>الموارد المعرفية</td>
              {data.maidans.map((m, i) => (
                <td key={i} className={td}>{formatList(m.mouraddMaarifa)}</td>
              ))}
            </tr>
            {/* الموارد العرضية */}
            <tr>
              <td className={labelTd}>الموارد العرضية / الأفقية</td>
              {data.maidans.map((m, i) => (
                <td key={i} className={td}>{formatList(m.mouraddAardiya)}</td>
              ))}
            </tr>
            {/* معايير ومؤشرات التقويم */}
            <tr>
              <td className={labelTd}>معايير ومؤشرات التقويم</td>
              {data.maidans.map((_, i) => (
                <td key={i} className={td}></td>
              ))}
            </tr>
            {/* الحجم الزمني */}
            <tr>
              <td className={labelTd}>الزمن الإجمالي</td>
              {data.maidans.map((_, i) => (
                <td key={i} className={`${td} text-center text-gray-400 italic`}>ساعات الممارسة المقررة</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Mokhatat
'use client';

import { planOfYearConfig } from '@/src/config/highPlan';
import React, { useState } from 'react';
import { useTeacher } from "@/hooks/useTeacher"

const AVAILABLE_LEVELS = [
  { id: 's1', name: 'السنة الأولى ثانوي' },
  { id: 's2', name: 'السنة الثانية ثانوي' },
  { id: 's3', name: 'السنة الثالثة ثانوي' },
];

const SPORT_NAMES: Record<string, string> = {
  sprint: 'الجري السريع',
  basketball: 'كرة السلة',
  longJump: 'القفز الطويل',
  vollyball: 'كرة الطائرة',
  throw: 'دفع الجلة',
  handball: 'كرة اليد',
};

const ALL_SPORT_KEYS = Object.keys(SPORT_NAMES);

// الألوان لكل كفاءة قاعدية
const KAFAA_COLORS = [
  { header: 'bg-cyan-700', badge: 'bg-cyan-50 border-cyan-200 text-cyan-900', mouashirat: 'bg-cyan-50/60', goal: 'bg-cyan-600' },
  { header: 'bg-emerald-700', badge: 'bg-emerald-50 border-emerald-200 text-emerald-900', mouashirat: 'bg-emerald-50/60', goal: 'bg-emerald-600' },
  { header: 'bg-violet-700', badge: 'bg-violet-50 border-violet-200 text-violet-900', mouashirat: 'bg-violet-50/60', goal: 'bg-violet-600' },
];

type ContentMap = Record<string, string>; // key: `${kafaaIdx}-${sportKey}` → text

function buildDefaultContents(levelId: string): ContentMap {
  const data = planOfYearConfig[levelId];
  const map: ContentMap = {};
  data.kafaatQaaidiya.forEach((kafaa, ki) => {
    const sports = kafaa.sports as Record<string, { mayaeer: string[] }>;
    Object.entries(sports).forEach(([sportKey, sportData]) => {
      map[`${ki}-${sportKey}`] = sportData.mayaeer.join('\n');
    });
  });
  return map;
}

function buildDefaultSports(levelId: string): Record<string, string> {
  const data = planOfYearConfig[levelId];
  const map: Record<string, string> = {};
  data.kafaatQaaidiya.forEach((kafaa, ki) => {
    const sportKeys = Object.keys(kafaa.sports as Record<string, unknown>);
    sportKeys.forEach((key, si) => {
      map[`${ki}-${si}`] = key;
    });
  });
  return map;
}

export default function PlanOfYear() {

  const { teacher } = useTeacher();

  const [selectedLevel, setSelectedLevel] = useState('s1');
  const [contents, setContents] = useState<ContentMap>(() => buildDefaultContents('s1'));
  const [selectedSports, setSelectedSports] = useState<Record<string, string>>(() => buildDefaultSports('s1'));

  const data = planOfYearConfig[selectedLevel];

  const handleLevelChange = (newLevel: string) => {
    setSelectedLevel(newLevel);
    setSelectedSports(buildDefaultSports(newLevel));
    setContents(buildDefaultContents(newLevel));
  };

  const handleSportChange = (kafaaIdx: number, slotIdx: number, newSportKey: string) => {
    const slotKey = `${kafaaIdx}-${slotIdx}`;
    setSelectedSports(prev => ({ ...prev, [slotKey]: newSportKey }));
    // prefill content from config if not yet customized
    const contentKey = `${kafaaIdx}-${newSportKey}`;
    const sports = data.kafaatQaaidiya[kafaaIdx].sports as Record<string, { mayaeer: string[] }>;
    if (sports[newSportKey]) {
      setContents(prev => ({
        ...prev,
        [contentKey]: sports[newSportKey].mayaeer.join('\n'),
      }));
    }
  };

  const getContent = (kafaaIdx: number, slotIdx: number): string => {
    const sportKey = selectedSports[`${kafaaIdx}-${slotIdx}`];
    return contents[`${kafaaIdx}-${sportKey}`] || '';
  };

  const setContent = (kafaaIdx: number, slotIdx: number, text: string) => {
    const sportKey = selectedSports[`${kafaaIdx}-${slotIdx}`];
    setContents(prev => ({ ...prev, [`${kafaaIdx}-${sportKey}`]: text }));
  };

  const getAvailableSports = (kafaaIdx: number) => {
    const sports = data.kafaatQaaidiya[kafaaIdx].sports as Record<string, unknown>;
    return Object.keys(sports);
  };

  const goalNumbers = [[1, 2], [3, 4], [5, 6]];

  return (
    <div className="plan-of-year-wrapper">
      <div className="min-h-screen bg-gray-100 p-2 md:p-6 text-right" dir="rtl">

        {/* شريط التحكم */}
        <div className="w-full md:max-w-[210mm] mx-auto mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-700">المستوى الدراسي:</label>
            <select
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="p-1.5 border border-gray-300 rounded bg-gray-50 text-sm text-black font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              {AVAILABLE_LEVELS.map(lvl => (
                <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-1.5 rounded text-sm font-medium transition shadow-sm"
          >
            🖨️ طباعة (A4)
          </button>
        </div>

        {/* صفحة A4 — full width + fluid on mobile, exact A4 size on desktop/print */}
        <div
          id="plan-of-year-page"
          className="w-full md:w-[210mm] min-h-0 md:min-h-[297mm] mx-auto bg-white border border-gray-300 shadow-xl rounded print:shadow-none print:border-none print:rounded-none print:w-[210mm] print:min-h-[297mm] print:m-0 print:p-0 flex flex-col justify-between overflow-hidden"
        >

          <div className="flex flex-col flex-1">
            {/* ترويسة */}
            <div className="bg-gray-800 text-white text-center py-2 px-4 print:rounded-none">
              <h1 className="text-sm font-bold tracking-wide">البرمجة السنوية — {AVAILABLE_LEVELS.find(l => l.id === selectedLevel)?.name}</h1>
            </div>

            <div className="flex flex-col my-2 px-2">
              <p className='text-sm font-bold text-blue-800'>الاستاذ: <span className='font-medium text-black mx-2'>{teacher.name || '—'}</span></p>
              <p className='text-sm font-bold text-blue-800'>المؤسسة: <span className='font-medium text-black mx-2'>{teacher.school || '—'}</span></p>
            </div>

            {/* الكفاءة الختامية */}
            <div className="text-center border-b border-gray-200 bg-gray-50 p-2">
              <span className="text-sm font-bold text-blue-800">الكفاءة الختامية: </span>
              <span className="text-sm font-bold text-gray-800">{data.kafaaKhitamiya}</span>
            </div>

            {/* الجدول الرئيسي — stacked on mobile, 3 columns from md up and always on print */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 border-t border-gray-300 flex-1 items-stretch">
              {data.kafaatQaaidiya.map((kafaa, ki) => {
                const colors = KAFAA_COLORS[ki];
                const availableSports = getAvailableSports(ki);

                return (
                  <div
                    key={ki}
                    className="flex flex-col border-b md:border-b-0 md:border-l print:border-b-0 print:border-l last:border-b-0 md:last:border-l-0 print:last:border-l-0 border-gray-300"
                  >

                    {/* عنوان الكفاءة */}
                    <div className={`${colors.header} flex p-2 items-center justify-center min-h-14 md:h-20 print:h-20 border-b border-gray-300 text-center`}>
                      <p className="text-sm font-bold text-white leading-snug">{kafaa.title}</p>
                    </div>

                    {/* المؤشرات */}
                    <div className={`${colors.mouashirat} border-b border-gray-300 px-2 py-2 min-h-32 md:h-54 print:h-54`}>
                      <p className="text-sm font-bold text-blue-900 border-b border-gray-200 pb-1 mb-1 text-center">المؤشـرات</p>
                      <ul className="space-y-1 p-1">
                        {kafaa.mouashirat.map((m, i) => (
                          <li key={i} className="text-[11px] md:text-xs text-gray-800 ">• {m}</li>
                        ))}
                      </ul>
                    </div>

                    {/* الأهداف التعلمية */}
                    <div className="border-b border-gray-300 px-2 py-2 bg-amber-50 min-h-24 md:h-34 print:h-34">
                      <h1 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-1 mb-1 text-center">الأهداف التعلمية</h1>
                      <div className="flex flex-col md:flex-row gap-2 justify-between print:flex-row">
                        {kafaa.ahdafTaalamuiya.map((a, i) => (
                          <p key={i} className="text-[11px] md:text-xs text-gray-800 p-1">• {a}</p>
                        ))}
                      </div>
                    </div>

                    {/* الأنشطة — عمودين، تحت بعض على الجوال الصغير جدا، جنب بعض من sm فما فوق ودائما بالطباعة */}
                    <div className="flex flex-col sm:flex-row print:flex-row flex-1 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse print:divide-y-0 print:divide-x print:divide-x-reverse divide-gray-300">
                      {[0, 1].map((slotIdx) => {
                        const currentSport = selectedSports[`${ki}-${slotIdx}`] || availableSports[slotIdx];
                        const goalNum = goalNumbers[ki][slotIdx];

                        return (
                          <div key={slotIdx} className="flex flex-col flex-1 min-w-0 ">

                            {/* رقم الهدف */}
                            <div className={`${colors.goal} text-white text-center py-1.5 border-b border-gray-300`}>
                              <p className="text-xs font-bold">الهدف: {String(goalNum).padStart(2, '0')}</p>
                            </div>

                            {/* اختيار الرياضة */}
                            <div className="border-b border-gray-200 bg-white p-1.5 print:hidden">
                              <select
                                value={currentSport}
                                onChange={(e) => handleSportChange(ki, slotIdx, e.target.value)}
                                className="w-full text-xs p-1 border border-gray-300 rounded bg-gray-50 font-bold text-gray-800 text-center outline-none focus:ring-1 focus:ring-cyan-400"
                              >
                                {availableSports.map(sk => (
                                  <option key={sk} value={sk}>{SPORT_NAMES[sk] || sk}</option>
                                ))}
                              </select>
                            </div>

                            {/* اسم الرياضة للطباعة */}
                            <div className="hidden print:block border-b border-gray-300 bg-sky-50 py-1 text-center">
                              <span className="text-xs font-bold text-sky-900">{SPORT_NAMES[currentSport] || currentSport}</span>
                            </div>

                            {/* المعايير */}
                            <div className="flex-1 p-1">
                              <ul className="space-y-1 list-none p-1">
                                {getContent(ki, slotIdx).split('\n').filter(l => l.trim()).map((line, lineIdx) => (
                                  <li
                                    key={lineIdx}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const lines = getContent(ki, slotIdx).split('\n').filter(l => l.trim());
                                      lines[lineIdx] = e.currentTarget.innerText;
                                      setContent(ki, slotIdx, lines.join('\n'));
                                    }}
                                    className="text-[11px] md:text-xs text-gray-800 leading-relaxed outline-none px-1 py-0.5 rounded hover:bg-gray-100 focus:bg-blue-50 before:content-['•'] before:ml-1 before:text-gray-400"
                                  >
                                    {line}
                                  </li>
                                ))}
                              </ul>

                            </div>
                            <hr className='border border-gray-300' />

                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
          <div className="my-6 font-semibold flex justify-between text-black mx-10">
            <div>الاستاذ</div>
            <div>المدير</div>
            <div>المفتش(ة)</div>
          </div>
        </div>
      </div>

      {/* print-only CSS: forces exactly one A4 page, hides everything else */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background: white !important;
          }

          body *:not(#plan-of-year-page):not(#plan-of-year-page *) {
            visibility: hidden !important;
          }

          #plan-of-year-page, #plan-of-year-page * {
            visibility: visible !important;
          }

          #plan-of-year-page {
            position: fixed !important;
            top: 0;
            left: 0;
            width: 194mm;
            max-width: 194mm;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          #plan-of-year-page .grid > div {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
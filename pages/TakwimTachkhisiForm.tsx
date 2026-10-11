'use client'

import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import TakwimTshTable from '@/components/TakwimTshTable'
import TakwimGroupe from '@/components/TakwimGroupe'
import FieldTest from './FieldTest'

type Tab = 'individual' | 'group' | 'field'

const TakwimTachkhisiForm = () => {
  const [activeTab, setActiveTab] = useState<Tab>('individual')
  // bumped after a field test save → remounts the table so it refetches
  const [tshKey, setTshKey] = useState(0)

  const tabClass = (tab: Tab) =>
    `flex-1 sm:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === tab
      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
    }`

  return (
    <div dir="rtl" className="w-full flex flex-col gap-6 p-4 md:p-6 dir-rtl">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl backdrop-blur-md print:hidden">

        {/* Segmented Control Tabs */}
        <div className="inline-flex p-1 bg-black/60 rounded-xl border border-zinc-800/80 w-full sm:w-auto">
          <button type="button" onClick={() => setActiveTab('individual')} className={tabClass('individual')}>
            <span>النشاط الفردي</span>
          </button>
          <button type="button" onClick={() => setActiveTab('group')} className={tabClass('group')}>
            <span>النشاط الجماعي</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('field')}
          className={`relative w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 border ${activeTab === 'field'
            ? 'bg-linear-to-l from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/30'
            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-white'
            }`}
        >
          <span className="text-base">⏱️</span>
          <span>الاختبار الميداني</span>

          {/* NEW badge */}
          <span className="absolute -top-2 -left-2 flex items-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 animate-ping" />
            <span className="relative inline-flex items-center rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-black shadow-md">
              جديد
            </span>
          </span>
        </button>
      </div>

      {/* Main Content Area - Rendered using CSS hiding to preserve input state */}
      <div className="w-full transition-all duration-200">
        <div className={activeTab === 'individual' ? 'block' : 'hidden'}>
          <TakwimTshTable key={tshKey} />
        </div>

        <div className={activeTab === 'group' ? 'block' : 'hidden'}>
          <TakwimGroupe />
        </div>

        <div className={activeTab === 'field' ? 'block' : 'hidden'}>
          <FieldTest onSaved={() => setTshKey(k => k + 1)} />
        </div>
      </div>

      {/* Toast Provider */}
      <ToastContainer
        position="bottom-left"
        rtl
        autoClose={3000}
        theme="dark"
        toastClassName="bg-zinc-900 border border-zinc-800 text-white font-sans rounded-xl"
      />
    </div>
  )
}

export default TakwimTachkhisiForm
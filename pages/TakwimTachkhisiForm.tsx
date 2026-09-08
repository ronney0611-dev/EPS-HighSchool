'use client'

import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import TakwimTshTable from '@/components/TakwimTshTable'
import TakwimGroupe from '@/components/TakwimGroupe'

const TakwimTachkhisiForm = () => {
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual')

  return (
    <div dir="rtl" className="w-full flex flex-col gap-6 p-4 md:p-6 dir-rtl">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl backdrop-blur-md print:hidden">

        {/* Segmented Control Tabs */}
        <div className="inline-flex p-1 bg-black/60 rounded-xl border border-zinc-800/80 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'individual'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
          >
            <span>النشاط الفردي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'group'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
          >
            <span>النشاط الجماعي</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Rendered using CSS hiding to preserve input state */}
      <div className="w-full transition-all duration-200">
        <div className={activeTab === 'individual' ? 'block' : 'hidden'}>
          <TakwimTshTable />
        </div>

        <div className={activeTab === 'group' ? 'block' : 'hidden'}>
          <TakwimGroupe />
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
'use client'

import { useMemo, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useClasses } from '@/hooks/useClasses'
import { useTeacher } from '@/hooks/useTeacher'
import { useTimetable } from '@/hooks/useTimetable'
import { useDailyLogLycee } from '@/hooks/useDailyLogLycee'
import { getLevelKeyFromClass } from '@/src/config/lyceeCurriculumRegistry'
import { countPendingHours, type Level } from '@/src/lib/daftarUtils'
import BarnamajUsbu3i from '@/pages/BarnamajUsbu3i'
import DaftarPending from '@/components/DaftarPending'
import DaftarSheet from '@/components/DaftarSheet'

type Tab = 'pending' | 'sheet'

export default function DaftarYawmiDaki() {
    const [view, setView] = useState<'daftar' | 'timetable'>('daftar')
    const [mainKey, setMainKey] = useState(0)

    return (
        <>
            {view === 'timetable' ? (
                <div>
                    <div className="max-w-3xl mx-auto px-3 pt-4 print:hidden">
                        <button
                            onClick={() => { setView('daftar'); setMainKey(k => k + 1) }}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold"
                        >
                            → رجوع إلى الدفتر اليومي
                        </button>
                    </div>
                    <BarnamajUsbu3i />
                </div>
            ) : (
                <DaftarMain key={mainKey} onEditTimetable={() => setView('timetable')} />
            )}
            <ToastContainer position="bottom-left" rtl autoClose={3000} />
        </>
    )
}

function DaftarMain({ onEditTimetable }: { onEditTimetable: () => void }) {
    const { classes } = useClasses()
    const { teacher } = useTeacher()
    const { slots, loaded } = useTimetable()
    const { entries, loading, addEntry, deleteEntry } = useDailyLogLycee()

    const [tab, setTab] = useState<Tab | null>(null)

    const classById = useMemo(() => new Map(classes.map(c => [String(c._id), c])), [classes])
    const levelOf = (classId: string, className?: string): Level => {
        const c = classById.get(classId)
        return getLevelKeyFromClass(c?.name ?? className, c?.level)
    }

    const pendingCount = useMemo(() => countPendingHours(slots, entries), [slots, entries])
    // opens on "pending" if there's something to confirm, otherwise on the daftar
    const activeTab: Tab = tab ?? (pendingCount > 0 ? 'pending' : 'sheet')

    const handleDelete = async (id: string) => {
        if (!confirm('حذف هذا السطر من الدفتر؟')) return
        if (await deleteEntry(id)) toast.success('تم الحذف')
    }

    if (!loaded || loading) {
        return <div className="text-center my-20 text-slate-500">⏳ جاري التحميل...</div>
    }

    return (
        <div dir="rtl" className="p-3 md:p-6 max-w-5xl mx-auto space-y-4 text-right">
            {/* header */}
            <div className="print:hidden rounded-2xl bg-linear-to-br from-slate-900 to-blue-900 text-white p-4 shadow flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-black">📖 الدفتر اليومي</h1>
                    <p className="text-xs text-slate-300 mt-0.5">أكد حصصك بضغطة، والدفتر يمتلئ تلقائيا</p>
                </div>
            </div>

            {/* tabs */}
            <div className="print:hidden flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                    onClick={() => setTab('pending')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                    🔔 للتأكيد
                    {pendingCount > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setTab('sheet')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${activeTab === 'sheet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                    📖 الدفتر
                </button>
            </div>

            {activeTab === 'pending' ? (
                <DaftarPending
                    slots={slots}
                    entries={entries}
                    classes={classes}
                    school={teacher?.school || ''}
                    addEntry={addEntry}
                    onEditTimetable={onEditTimetable}
                    onGoToSheet={() => setTab('sheet')}
                />
            ) : (
                <DaftarSheet
                    entries={entries}
                    teacherName={teacher?.name || ''}
                    school={teacher?.school || ''}
                    levelOf={levelOf}
                    onDelete={handleDelete}
                />
            )}
        </div>
    )
}
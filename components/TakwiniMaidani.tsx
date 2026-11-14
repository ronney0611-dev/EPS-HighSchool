'use client'

import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useChrono } from '@/hooks/useChrono'

export type MaidaniResult = { studentId: string; perf: string; level: string }

type Status = 'done' | 'absent' | 'exempt'
type WakeLock = { release: () => Promise<void> }
type Activity = 'sprint' | 'longjump' | 'throw'

type Saved = {
    gi: number
    group: number
    queue: string[]
    pos: number
    results: Record<string, { perf: string; level: string }>
    statuses: Record<string, Status>
}

const SPORTS: Record<Activity, { label: string; input: 'chrono' | 'tries'; unit: string }> = {
    sprint: { label: 'عدو 60م', input: 'chrono', unit: 'ثا' },
    longjump: { label: 'الوثب الطويل', input: 'tries', unit: 'م' },
    throw: { label: 'دفع الجلة', input: 'tries', unit: 'م' },
}
const LEVELS = ['A', 'B', 'C', 'D', 'E']
const NO_GROUP = -1

const speak = (text: string) => {
    try {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'ar-SA'
        u.rate = 0.9
        window.speechSynthesis.speak(u)
    } catch { /* not supported */ }
}
const buzz = () => { try { navigator.vibrate?.(30) } catch { /* not supported */ } }

const readSaved = (key: string): Saved | null => {
    try {
        const raw = window.localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as Saved) : null
    } catch { return null }
}
const writeSaved = (key: string, data: Saved) => {
    try { window.localStorage.setItem(key, JSON.stringify(data)) } catch { /* storage full / blocked */ }
}
const clearSaved = (key: string) => {
    try { window.localStorage.removeItem(key) } catch { /* blocked */ }
}

type Props = {
    classId: string
    activity: Activity
    sessions: number
    weekLabels: string[]
    students: { _id: string; name: string; gender?: string; status?: string }[]
    groups: { label: string; index: number }[]
    groupOf: (studentId: string) => number
    attendanceOf: (studentId: string, gi: number) => string
    onApply: (gi: number, results: MaidaniResult[]) => void
    onClose: () => void
}

export default function TakwiniMaidani({
    classId, activity, sessions, weekLabels, students, groups, groupOf, attendanceOf, onApply, onClose,
}: Props) {
    const chrono = useChrono()
    const storageKey = `takwini-maidani-${classId}-${activity}`
    const sport = SPORTS[activity]

    const [resume, setResume] = useState<Saved | null>(() => readSaved(storageKey))
    const [mode, setMode] = useState<'setup' | 'test' | 'done'>('setup')
    const [gi, setGi] = useState(0)
    const [group, setGroup] = useState<number>(groups[0]?.index ?? NO_GROUP)
    const [queue, setQueue] = useState<string[]>([])
    const [pos, setPos] = useState(0)
    const [results, setResults] = useState<Saved['results']>({})
    const [statuses, setStatuses] = useState<Saved['statuses']>({})

    // current student inputs
    const [value, setValue] = useState<number | null>(null)
    const [tries, setTries] = useState<string[]>(['', '', ''])
    const [level, setLevel] = useState('')
    const wakeRef = useRef<WakeLock | null>(null)

    const hasNoGroup = students.some(s => groupOf(s._id) === -1)
    const nameOf = (id: string) => students.find(s => s._id === id)?.name ?? ''
    const curId = queue[pos]
    const bestTry = (() => {
        const nums = tries.map(t => parseFloat(t.replace(',', '.'))).filter(n => Number.isFinite(n) && n > 0)
        return nums.length ? Math.max(...nums) : null
    })()

    // students of the chosen فوج, split: to test / skipped (معفى, absent or مريض in the attendance)
    const groupStudents = students.filter(s => groupOf(s._id) === group)
    const skipReason = (s: Props['students'][number]): string | null => {
        if (s.status === 'malade') return 'معفى'
        const a = attendanceOf(s._id, gi)
        if (a === 'A') return 'غائب'
        if (a === 'M') return 'مريض'
        return null
    }
    const toTest = groupStudents.filter(s => !skipReason(s))
    const skipped = groupStudents.filter(s => skipReason(s))

    const persist = (patch: Partial<Saved>) => {
        writeSaved(storageKey, { gi, group, queue, pos, results, statuses, ...patch })
    }

    const resetCurrent = () => {
        setValue(null)
        setTries(['', '', ''])
        setLevel('')
        chrono.reset()
    }

    const lockScreen = async () => {
        try {
            const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLock> } }
            wakeRef.current = (await nav.wakeLock?.request('screen')) ?? null
        } catch { /* not supported */ }
    }
    const unlockScreen = () => {
        wakeRef.current?.release().catch(() => { })
        wakeRef.current = null
    }

    const startTest = () => {
        if (!toTest.length) return toast.error('لا يوجد تلاميذ حاضرون في هذا الفوج لهذه الحصة')
        const q = toTest.map(s => s._id)
        setQueue(q)
        setPos(0)
        setResults({})
        setStatuses({})
        resetCurrent()
        setMode('test')
        writeSaved(storageKey, { gi, group, queue: q, pos: 0, results: {}, statuses: {} })
        speak(nameOf(q[0]))
        lockScreen()
    }

    const resumeTest = () => {
        if (!resume) return
        const q = resume.queue.filter(id => students.some(s => s._id === id))
        setGi(resume.gi)
        setGroup(resume.group)
        setQueue(q)
        setPos(resume.pos)
        setResults(resume.results ?? {})
        setStatuses(resume.statuses ?? {})
        resetCurrent()
        setResume(null)
        if (resume.pos >= q.length) { setMode('done'); return }
        setMode('test')
        speak(nameOf(q[resume.pos]))
        lockScreen()
    }

    const endTest = () => {
        setMode('done')
        unlockScreen()
    }

    const goNext = (nextResults: Saved['results'], nextStatuses: Saved['statuses']) => {
        buzz()
        resetCurrent()
        const nextPos = pos + 1
        setPos(nextPos)
        persist({ pos: nextPos, results: nextResults, statuses: nextStatuses })
        if (nextPos >= queue.length) return endTest()
        speak(nameOf(queue[nextPos]))
    }

    const commit = (status: Status) => {
        if (!curId) return
        let nextResults = results
        if (status === 'done') {
            if (chrono.running) return toast.error('أوقف الميقاتي أولا')
            const v = sport.input === 'chrono' ? value : bestTry
            const perf = v == null ? '' : sport.input === 'chrono' ? v.toFixed(2) : String(v)
            if (!perf && !level) return toast.error('سجل النتيجة أو اختر الأداء أولا')
            nextResults = { ...results, [curId]: { perf, level } }
            setResults(nextResults)
        }
        const nextStatuses = { ...statuses, [curId]: status }
        setStatuses(nextStatuses)
        goNext(nextResults, nextStatuses)
    }

    const postpone = () => {
        if (queue.length - pos <= 1) return
        const q = [...queue.slice(0, pos), ...queue.slice(pos + 1), queue[pos]]
        setQueue(q)
        resetCurrent()
        persist({ queue: q })
        speak(nameOf(q[pos]))
    }

    const handleStop = () => {
        const s = chrono.stop()
        setValue(s)
        buzz()
    }

    const apply = () => {
        const list: MaidaniResult[] = Object.entries(results)
            .filter(([id]) => statuses[id] === 'done')
            .map(([studentId, r]) => ({ studentId, perf: r.perf, level: r.level }))
        if (!list.length) return toast.error('لا توجد نتائج لإضافتها')
        onApply(gi, list)
        clearSaved(storageKey)
        onClose()
    }

    const close = () => {
        unlockScreen()
        chrono.reset()
        onClose()
    }

    const done = Object.values(statuses).filter(s => s === 'done').length
    const absent = Object.values(statuses).filter(s => s === 'absent').length
    const exempt = Object.values(statuses).filter(s => s === 'exempt').length
    const groupName = (g: number) => g === NO_GROUP ? 'بدون فوج' : `الفوج ${groups.find(x => x.index === g)?.label ?? ''}`

    return (
        <div dir="rtl" className="print:hidden fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
            <div className="mt-20 max-w-md mx-auto p-3 space-y-3 select-none">
                <div className="flex justify-between items-center">
                    <p className="text-white font-black">⏱️ اختبار ميداني · {sport.label}</p>
                    <button onClick={close} className="text-white border bg-red-500 border-red-500 px-3 py-1 rounded-xl text-sm cursor-pointer">✕ إغلاق</button>
                </div>

                {mode === 'setup' && (
                    <>
                        {resume && (
                            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 space-y-2">
                                <p className="text-sm font-bold text-amber-900">
                                    يوجد اختبار غير مكتمل: ح{resume.gi + 1} · {groupName(resume.group)} ({Math.min(resume.pos, resume.queue.length)}/{resume.queue.length})
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={resumeTest} className="py-2 rounded-xl bg-amber-500 text-white font-black cursor-pointer">متابعة ▶</button>
                                    <button onClick={() => { clearSaved(storageKey); setResume(null) }} className="py-2 rounded-xl bg-white text-amber-800 border border-amber-300 font-bold cursor-pointer">حذف</button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-500">الحصة</label>
                                <select
                                    value={gi}
                                    onChange={e => setGi(Number(e.target.value))}
                                    className="px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                                >
                                    {Array.from({ length: sessions }).map((_, i) => (
                                        <option key={i} value={i}> ح {i + 1} ({weekLabels[i] ? ` ${weekLabels[i]}` : ''})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-500">الفوج</label>
                                <select
                                    value={group}
                                    onChange={e => setGroup(Number(e.target.value))}
                                    className="px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                                >
                                    {groups.map(g => <option key={g.index} value={g.index}>الفوج {g.label}</option>)}
                                    {hasNoGroup && <option value={NO_GROUP}>بدون فوج</option>}
                                </select>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 space-y-1">
                            <p className="text-sm font-bold text-blue-800">سيتم اختبار: {toTest.length} تلميذ</p>
                            {skipped.length > 0 && (
                                <div className="pt-1">
                                    <p className="text-xs font-bold text-slate-500">لن يتم مناداتهم (من صفحة الحضور):</p>
                                    {skipped.map(s => (
                                        <p key={s._id} className="text-xs text-slate-700">• {s.name} — <span className="text-rose-600 font-bold">{skipReason(s)}</span></p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={startTest}
                            className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-lg font-black shadow cursor-pointer"
                        >
                            ابدأ الاختبار ▶
                        </button>
                    </>
                )}

                {mode === 'test' && (
                    <>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                            <span>{Math.min(pos + 1, queue.length)} / {queue.length}</span>
                            <span>ح{gi + 1} · {groupName(group)}</span>
                            <button onClick={endTest} className="text-rose-500 border border-rose-500 px-2 rounded-2xl cursor-pointer">إنهاء</button>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(pos / Math.max(queue.length, 1)) * 100}%` }} />
                        </div>

                        <button
                            onClick={() => curId && speak(nameOf(curId))}
                            className="w-full bg-slate-800 text-white rounded-2xl py-5 px-4 text-center shadow cursor-pointer"
                        >
                            <p className="text-2xl font-black leading-tight">{nameOf(curId)}</p>
                            <p className="text-xs text-slate-300 mt-1">🔊 اضغط لإعادة النداء</p>
                        </button>

                        <p className="text-center text-xs font-bold text-slate-300">النتيجة</p>
                        {sport.input === 'chrono' ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center space-y-3">
                                <p className="font-mono text-5xl font-black text-slate-900 tabular-nums" dir="ltr">
                                    {(chrono.running ? chrono.seconds : value ?? 0).toFixed(2)}
                                    <span className="text-xl text-slate-400 mr-1">{sport.unit}</span>
                                </p>
                                {chrono.running ? (
                                    <button onClick={handleStop} className="w-full bg-rose-600 text-white cursor-pointer py-6 rounded-2xl text-2xl font-black active:scale-95 transition">
                                        توقف ■
                                    </button>
                                ) : (
                                    <button onClick={() => { chrono.start(); buzz() }} className="w-full cursor-pointer bg-emerald-600 text-white py-6 rounded-2xl text-2xl font-black active:scale-95 transition">
                                        {value == null ? 'انطلاق ▶' : 'إعادة ↺'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                                <div className="grid grid-cols-3 gap-2 text-black">
                                    {tries.map((t, i) => (
                                        <input
                                            key={i}
                                            inputMode="decimal"
                                            placeholder={`م${i + 1}`}
                                            value={t}
                                            onChange={e => setTries(prev => prev.map((x, j) => (j === i ? e.target.value : x)))}
                                            className="text-center text-2xl font-black font-mono py-3 border border-slate-300 rounded-xl bg-slate-50"
                                            dir="ltr"
                                        />
                                    ))}
                                </div>
                                <p className="text-center text-sm font-bold text-slate-600">
                                    أفضل محاولة: <span className="font-mono text-slate-900">{bestTry ?? '—'} {sport.unit}</span>
                                </p>
                            </div>
                        )}

                        <p className="text-center text-xs font-bold text-slate-300">الأداء</p>
                        <div className="grid grid-cols-5 gap-2">
                            {LEVELS.map(l => (
                                <button
                                    key={l}
                                    onClick={() => { setLevel(prev => (prev === l ? '' : l)); buzz() }}
                                    className={`py-4 rounded-xl text-2xl font-black border cursor-pointer active:scale-95 transition ${level === l ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-800 border-slate-300'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                            <button onClick={() => commit('absent')} className="py-3 rounded-xl cursor-pointer bg-rose-100 text-rose-800 font-bold">غائب</button>
                            <button onClick={() => commit('exempt')} className="py-3 rounded-xl cursor-pointer bg-amber-100 text-amber-800 font-bold">معفى</button>
                            <button onClick={postpone} className="py-3 rounded-xl cursor-pointer bg-slate-100 text-slate-700 font-bold">تأجيل</button>
                        </div>
                        <button
                            onClick={() => commit('done')}
                            className="cursor-pointer w-full bg-emerald-600 text-white py-4 rounded-2xl text-xl font-black shadow active:scale-95 transition"
                        >
                            التالي ←
                        </button>
                    </>
                )}

                {mode === 'done' && (
                    <>
                        <h2 className="text-xl font-black text-white">✅ انتهى الاختبار · ح{gi + 1} · {groupName(group)}</h2>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3"><p className="text-2xl font-black text-emerald-700">{done}</p><p className="text-xs font-bold text-emerald-800">مختبَر</p></div>
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3"><p className="text-2xl font-black text-rose-700">{absent}</p><p className="text-xs font-bold text-rose-800">غائب</p></div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-2xl font-black text-amber-700">{exempt}</p><p className="text-xs font-bold text-amber-800">معفى</p></div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
                            {queue.map(id => (
                                <div key={id} className="flex justify-between items-center px-3 py-2 text-sm">
                                    <span className="font-bold text-slate-800">{nameOf(id)}</span>
                                    <span className="font-mono text-slate-600">
                                        {statuses[id] === 'done'
                                            ? `${results[id]?.perf ? `${results[id].perf} ${sport.unit}` : '—'} · ${results[id]?.level || '—'}`
                                            : statuses[id] === 'absent' ? 'غائب' : statuses[id] === 'exempt' ? 'معفى' : '—'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button onClick={apply} className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-lg font-black shadow cursor-pointer">
                            إضافة إلى الجدول ✅
                        </button>
                        <button onClick={() => { setResume(readSaved(storageKey)); setMode('setup') }} className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold cursor-pointer">
                            رجوع
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
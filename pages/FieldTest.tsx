'use client'

import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useClasses } from '@/hooks/useClasses'
import { useTachkhisi } from '@/hooks/useTachkhisi'
import { useChrono } from '@/hooks/useChrono'
import { FIELD_TEST_SPORTS, type FieldSportKey } from '@/src/config/fieldTestConfig'
import { curriculumRegistry, getLevelKeyFromClass, getAllIndicatorIds } from '@/src/config/lyceeCurriculumRegistry'

type Attempt = 't1' | 't2'
type Score = { t1: number; t2: number }
interface Row { name: string; score: Score[]; result: Score }
type Status = 'done' | 'absent' | 'exempt'
type WakeLock = { release: () => Promise<void> }

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

const buzz = () => {
    try { navigator.vibrate?.(30) } catch { /* not supported */ }
}

export default function FieldTest({ onSaved }: { onSaved?: () => void }) {
    const { classes, fetchStudents, studentsByClass } = useClasses()
    const { fetchTachkhisi, saveTachkhisi, loading } = useTachkhisi()
    const chrono = useChrono()

    // setup
    const [classId, setClassId] = useState('')
    const [sport, setSport] = useState<FieldSportKey>('sprint')
    const [attempt, setAttempt] = useState<Attempt>('t1')
    const [mochirCount, setMochirCount] = useState(0)
    const [indicatorIds, setIndicatorIds] = useState<number[]>([])
    const [saved, setSaved] = useState<Row[]>([])
    const [fetching, setFetching] = useState(false)
    const requestRef = useRef(0)

    // session
    const [mode, setMode] = useState<'setup' | 'test' | 'done'>('setup')
    const [rows, setRows] = useState<Row[]>([])
    const [queue, setQueue] = useState<number[]>([])
    const [pos, setPos] = useState(0)
    const [statuses, setStatuses] = useState<Record<string, Status>>({})
    const [marks, setMarks] = useState<number[]>([])
    const [value, setValue] = useState<number | null>(null)
    const [tries, setTries] = useState<string[]>(['', '', ''])
    const wakeRef = useRef<WakeLock | null>(null)

    const cls = classes.find(c => c._id === classId)
    const levelKey = getLevelKeyFromClass(cls?.name, cls?.level)
    const sportCfg = curriculumRegistry[levelKey]?.sports?.[sport]
    const sportInfo = FIELD_TEST_SPORTS[sport]
    const roster = classId ? studentsByClass[classId] : undefined
    const indicatorText = (id: number) => sportCfg?.indicators.find(i => i.id === id)?.text ?? '—'

    const curIdx = queue[pos]
    const cur = curIdx !== undefined ? rows[curIdx] : undefined
    const bestTry = (() => {
        const nums = tries.map(t => parseFloat(t.replace(',', '.'))).filter(n => Number.isFinite(n) && n > 0)
        return nums.length ? Math.max(...nums) : null
    })()

    // ---------- loading ----------
    const load = async (cid: string, sp: FieldSportKey) => {
        const found = classes.find(c => c._id === cid)
        if (!found) return
        const req = ++requestRef.current
        setFetching(true)
        setSaved([])
        fetchStudents(found._id)

        const data = await fetchTachkhisi(found._id, sp, 'fardi')
        if (req !== requestRef.current) return

        const lk = getLevelKeyFromClass(found.name, found.level)
        const all = getAllIndicatorIds(lk, sp)
        const defaults = all.slice(0, 4)

        if (data?.students?.length) {
            const valid = (data.selectedIndicatorIds || []).filter((id: number) => all.includes(id))
            const count = Math.min(data.mochirCount ?? defaults.length, valid.length || defaults.length)
            setMochirCount(count)
            setIndicatorIds((valid.length ? valid : defaults).slice(0, count))
            setSaved(data.students.map((s: { name: string; score: Score[]; result?: Score }) => ({
                name: s.name,
                score: s.score,
                result: s.result || { t1: 0, t2: 0 },
            })))
        } else {
            setMochirCount(defaults.length)
            setIndicatorIds(defaults)
        }
        setFetching(false)
    }

    // ---------- session ----------
    const resetCurrent = () => {
        setMarks(Array(mochirCount).fill(0))
        setValue(null)
        setTries(['', '', ''])
        chrono.reset()
    }

    const startTest = async () => {
        if (!roster?.length) return toast.error('لا يوجد تلاميذ في هذا القسم')
        if (!indicatorIds.length) return toast.error('لا توجد مؤشرات لهذا النشاط')

        const built: Row[] = roster.map(s => {
            const sv = saved.find(x => x.name === s.name)
            return {
                name: s.name,
                score: Array.from({ length: mochirCount }, (_, i) => sv?.score[i] ?? { t1: 0, t2: 0 }),
                result: sv?.result ?? { t1: 0, t2: 0 },
            }
        })

        setRows(built)
        setQueue(built.map((_, i) => i))
        setPos(0)
        setStatuses({})
        resetCurrent()
        setMode('test')
        speak(built[0].name)

        try {
            const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLock> } }
            wakeRef.current = (await nav.wakeLock?.request('screen')) ?? null
        } catch { /* not supported */ }
    }

    const endTest = () => {
        setMode('done')
        wakeRef.current?.release().catch(() => { })
        wakeRef.current = null
    }

    const goNext = () => {
        buzz()
        resetCurrent()
        const nextPos = pos + 1
        setPos(nextPos)
        if (nextPos >= queue.length) return endTest()
        speak(rows[queue[nextPos]].name)
    }

    const commit = (status: Status) => {
        if (!cur || curIdx === undefined) return
        if (status === 'done') {
            if (chrono.running) return toast.error('أوقف الميقاتي أولا')
            const v = sportInfo.input === 'chrono' ? value : bestTry
            if (v == null) return toast.error('سجل النتيجة أولا')
            setRows(prev => prev.map((r, i) => i !== curIdx ? r : {
                ...r,
                result: { ...r.result, [attempt]: v },
                score: r.score.map((sc, k) => ({ ...sc, [attempt]: marks[k] ?? 0 })),
            }))
        }
        setStatuses(p => ({ ...p, [cur.name]: status }))
        goNext()
    }

    const postpone = () => {
        if (queue.length - pos <= 1) return
        setQueue(q => [...q.slice(0, pos), ...q.slice(pos + 1), q[pos]])
        resetCurrent()
        speak(rows[queue[pos + 1]].name)
    }

    const handleStop = () => {
        const s = chrono.stop()
        setValue(s)
        buzz()
    }

    // ---------- save (into the existing card) ----------
    const handleSave = async () => {
        if (!cls) return
        const n = mochirCount
        const avg = (a: Attempt) => Array.from({ length: n }, (_, i) =>
            rows.length ? rows.reduce((acc, s) => acc + (s.score[i]?.[a] ?? 0), 0) / rows.length : 0)
        const t1 = avg('t1')
        const t2 = avg('t2')

        const ok = await saveTachkhisi(
            cls._id,
            sport,
            'fardi',
            n,
            indicatorIds,
            rows.map(s => ({
                name: s.name,
                score: s.score,
                result: s.result,
                percentaget1: (s.score.reduce((a, b) => a + b.t1, 0) / n) * 100,
                percentaget2: (s.score.reduce((a, b) => a + b.t2, 0) / n) * 100,
                tatawaor: s.result.t2 - s.result.t1,
            })),
            t2.map((v, i) => ({ t1: t1[i], t2: v }))
        )

        if (ok) {
            toast.success('تم حفظ النتائج في بطاقة التقويم التشخيصي')
            onSaved?.()
        } else {
            toast.error('فشل الحفظ، حاول مرة أخرى')
        }
    }

    const done = Object.values(statuses).filter(s => s === 'done').length
    const absent = Object.values(statuses).filter(s => s === 'absent').length
    const exempt = Object.values(statuses).filter(s => s === 'exempt').length

    // ---------- UI ----------
    if (mode === 'setup') {
        return (
            <div dir="rtl" className="max-w-md mx-auto p-4 space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white p-5 shadow-lg">
                    <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-black text-black shadow">
                        جديد
                    </span>

                    <h1 className="text-2xl font-black">⏱️ الاختبار الميداني</h1>
                    <p className="mt-1 text-sm font-semibold text-emerald-50">
                        لا ورق، لا قلم، لا جدول. أنت تراقب التلميذ ونحن نتكفل بالباقي.
                    </p>

                    <div className="mt-4 space-y-2.5">
                        {[
                            { icon: '✅', title: 'كل شيء يملأ تلقائيا', text: 'النتائج والنسب تحفظ مباشرة في بطاقة التقويم التشخيصي' },
                        ].map(s => (
                            <div key={s.title} className="flex items-start gap-3 rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                                <span className="text-xl leading-none">{s.icon}</span>
                                <div>
                                    <p className="text-sm font-black">{s.title}</p>
                                    <p className="text-xs text-emerald-50/90">{s.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500">القسم</label>
                        <select
                            value={classId}
                            onChange={e => { setClassId(e.target.value); load(e.target.value, sport) }}
                            className="px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                        >
                            <option value="">— اختر القسم —</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500">النشاط</label>
                        <select
                            value={sport}
                            onChange={e => {
                                const sp = e.target.value as FieldSportKey
                                setSport(sp)
                                if (classId) load(classId, sp)
                            }}
                            className="px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                        >
                            {Object.entries(FIELD_TEST_SPORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500">التقويم</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['t1', 't2'] as Attempt[]).map(a => (
                                <button
                                    key={a}
                                    onClick={() => setAttempt(a)}
                                    className={`py-2.5 rounded-xl font-black border ${attempt === a ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-300'}`}
                                >
                                    {a === 't1' ? 'تقويم تشخيصي' : 'تقويم تحصيلي'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {classId && (
                    <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 space-y-2">
                        <p className="text-xs font-bold text-blue-700">المؤشرات (من بطاقة التشخيص):</p>
                        {fetching ? (
                            <p className="text-sm text-slate-500">⏳ جاري التحميل...</p>
                        ) : indicatorIds.length ? (
                            indicatorIds.map((id, i) => (
                                <p key={i} className="text-sm text-slate-800">• {indicatorText(id)}</p>
                            ))
                        ) : (
                            <p className="text-sm text-rose-700 font-bold">لا توجد مؤشرات لهذا النشاط</p>
                        )}
                        <p className="text-xs text-slate-500 pt-1">عدد التلاميذ: {roster?.length ?? 0}</p>
                    </div>
                )}

                <button
                    onClick={startTest}
                    disabled={!classId || fetching}
                    className="w-full bg-emerald-600 disabled:opacity-40 text-white py-4 rounded-2xl text-lg font-black shadow"
                >
                    ابدأ الاختبار ▶
                </button>
            </div>
        )
    }

    if (mode === 'done') {
        return (
            <div dir="rtl" className="max-w-md mx-auto p-4 space-y-4">
                <h1 className="text-xl font-black text-white">✅ انتهى الاختبار</h1>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3"><p className="text-2xl font-black text-emerald-700">{done}</p><p className="text-xs font-bold text-emerald-800">مختبَر</p></div>
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3"><p className="text-2xl font-black text-rose-700">{absent}</p><p className="text-xs font-bold text-rose-800">غائب</p></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-2xl font-black text-amber-700">{exempt}</p><p className="text-xs font-bold text-amber-800">معفى</p></div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
                    {rows.map(r => (
                        <div key={r.name} className="flex justify-between items-center px-3 py-2 text-sm">
                            <span className="font-bold text-slate-800">{r.name}</span>
                            <span className="font-mono text-slate-600">
                                {statuses[r.name] === 'done'
                                    ? `${r.result[attempt]} ${sportInfo.unit} · ${r.score.reduce((a, b) => a + b[attempt], 0)}/${mochirCount}`
                                    : statuses[r.name] === 'absent' ? 'غائب' : statuses[r.name] === 'exempt' ? 'معفى' : '—'}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-emerald-600 disabled:opacity-40 text-white py-4 rounded-2xl text-lg font-black shadow"
                >
                    {loading ? '⏳ ...' : 'حفظ في بطاقة التشخيص ✅'}
                </button>
                <button onClick={() => setMode('setup')} className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold">
                    رجوع
                </button>
            </div>
        )
    }

    // mode === 'test'
    return (
        <div dir="rtl" className="max-w-md mx-auto p-3 space-y-3 select-none">
            {/* progress */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{Math.min(pos + 1, queue.length)} / {queue.length}</span>
                <span>{sportInfo.label} · {attempt === 't1' ? 'ت1' : 'ت2'}</span>
                <button onClick={endTest} className="text-rose-600 border border-rose-600 px-2 rounded-2xl cursor-pointer">إنهاء</button>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(pos / Math.max(queue.length, 1)) * 100}%` }} />
            </div>

            {/* student */}
            <button
                onClick={() => cur && speak(cur.name)}
                className="w-full bg-slate-900 text-white rounded-2xl py-5 px-4 text-center shadow"
            >
                <p className="text-2xl font-black leading-tight">{cur?.name}</p>
                <p className="text-xs text-slate-300 mt-1">🔊 اضغط لإعادة النداء</p>
            </button>

            {/* measure */}
            {sportInfo.input === 'chrono' ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center space-y-3">
                    <p className="font-mono text-5xl font-black text-slate-900 tabular-nums " dir="ltr">
                        {(chrono.running ? chrono.seconds : value ?? 0).toFixed(2)}
                        <span className="text-xl text-slate-400 mr-1">{sportInfo.unit}</span>
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
                        أفضل محاولة: <span className="font-mono text-slate-900">{bestTry ?? '—'} {sportInfo.unit}</span>
                    </p>
                </div>
            )}
            <p className="text-center text-xs font-bold text-white">
                👆 اضغط على المؤشر الذي حققه التلميذ
            </p>
            {/* indicators */}
            <div className="space-y-2">
                {indicatorIds.map((id, k) => {
                    const on = marks[k] === 1
                    return (
                        <button
                            key={k}
                            onClick={() => { setMarks(prev => prev.map((m, j) => (j === k ? (m ? 0 : 1) : m))); buzz() }}
                            className={`cursor-pointer w-full flex items-center gap-3 p-3 rounded-xl border text-right transition active:scale-[0.98] ${on ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}
                        >
                            <span className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl font-black text-white ${on ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                                {on ? 1 : 0}
                            </span>
                            <span className="text-sm font-bold text-slate-800 leading-snug">{indicatorText(id)}</span>
                        </button>
                    )
                })}
            </div>

            {/* actions */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                <button onClick={() => commit('absent')} className="py-3 rounded-xl cursor-pointer bg-rose-100 text-rose-800 font-bold">غائب</button>
                <button onClick={() => commit('exempt')} className="py-3 rounded-xl cursor-pointer bg-amber-100 text-amber-800 font-bold">معفى</button>
                <button onClick={postpone} className="py-3 rounded-xl cursor-pointer bg-slate-100 text-slate-700 font-bold">تأجيل</button>
            </div>
            <button
                onClick={() => commit('done')}
                className="cursor-pointer w-full bg-slate-900 text-white py-4 rounded-2xl text-xl font-black shadow active:scale-95 transition"
            >
                التالي ←
            </button>
        </div>
    )
}
'use client'

import React, { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import type { TimetableSlot } from '@/hooks/useTimetable'
import type { DailyLogEntryLycee } from '@/hooks/useDailyLogLycee'
import type { ISession } from '@/app/models/WahdaDoc'
import { useWahdaSessions } from '@/hooks/useWahdaSessions'
import { getLevelKeyFromClass } from '@/src/config/lyceeCurriculumRegistry'
import {
    type Level, type SportType,
    DAYS, REASONS, SUGGESTIONS, PERIOD_STARTS, LUNCH, DAY_END, LOOKBACK_DAYS,
    SPORTS_BY_TYPE, TYPE_LABEL, sportLabel, typeOfSport,
    fmt, hourTime, isoLocal, shortDate, trimesterOf, isHourLogged,
} from '@/src/lib/daftarUtils'

type ClassLite = { _id: string; name: string; level?: string | number }
type NewEntry = Omit<DailyLogEntryLycee, '_id'>

type Part = { key: string; time: string; type: SportType; logged: boolean }
type Card = {
    key: string
    date: string
    classId: string
    className: string
    level: Level
    timeRange: string
    parts: Part[]
}
type DayGroup = { date: string; label: string; isToday: boolean; cards: Card[] }

type SessionInfo =
    | { status: 'nosport' }
    | { status: 'loading' }
    | { status: 'none' }
    | { status: 'finished'; n: number }
    | { status: 'ok'; n: number; session: ISession }

export default function DaftarPending({
    slots,
    entries,
    classes,
    school,
    addEntry,
    onEditTimetable,
    onGoToSheet,
}: {
    slots: TimetableSlot[]
    entries: DailyLogEntryLycee[]
    classes: ClassLite[]
    school: string
    addEntry: (data: NewEntry) => Promise<DailyLogEntryLycee | null>
    onEditTimetable: () => void
    onGoToSheet: () => void
}) {
    const classById = useMemo(() => new Map(classes.map(c => [String(c._id), c])), [classes])

    const [sportChoice, setSportChoice] = useState<Record<string, string>>({})
    const [swapped, setSwapped] = useState<Record<string, boolean>>({})
    const [notDoneOpen, setNotDoneOpen] = useState<string | null>(null)
    const [reason, setReason] = useState('')
    const [suggestion, setSuggestion] = useState('')
    const [busy, setBusy] = useState<Record<string, boolean>>({})

    // manual add
    const [manualOpen, setManualOpen] = useState(false)
    const [mClass, setMClass] = useState('')
    const [mDate, setMDate] = useState(isoLocal(new Date()))
    const [mStart, setMStart] = useState(480)
    const [mHours, setMHours] = useState(2)

    const lastSport = useMemo(() => {
        const map: Record<string, Partial<Record<SportType, string>>> = {}
        entries.forEach(e => {
            if (!e.sport) return
            const id = String(e.classId)
            map[id] = { ...map[id], [typeOfSport(e.sport)]: e.sport }
        })
        return map
    }, [entries])

    const buildCard = (slot: TimetableSlot, date: string, keyPrefix: string): Card => {
        const cls = classById.get(slot.classId)
        const cardKey = `${keyPrefix}-${slot.classId}-${slot.start}`
        const collectiveFirst = !!swapped[cardKey]
        const parts: Part[] = []
        for (let t = slot.start, i = 0; t < slot.end; t += 60, i++) {
            const time = hourTime(t)
            const type: SportType = (i % 2 === 0) !== collectiveFirst ? 'fardi' : 'jama3i'
            parts.push({ key: `${cardKey}-${t}`, time, type, logged: isHourLogged(entries, slot.classId, date, time) })
        }
        return {
            key: cardKey,
            date,
            classId: slot.classId,
            className: cls?.name ?? '—',
            level: getLevelKeyFromClass(cls?.name, cls?.level),
            timeRange: `${fmt(slot.start)} - ${fmt(slot.end)}`,
            parts,
        }
    }

    const groups: DayGroup[] = useMemo(() => {
        const out: DayGroup[] = []
        const today = new Date()
        for (let offset = 0; offset <= LOOKBACK_DAYS; offset++) {
            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
            const dow = d.getDay()
            if (dow > 4) continue
            const date = isoLocal(d)
            const cards = slots
                .filter(s => s.day === dow)
                .sort((a, b) => a.start - b.start)
                .map(s => buildCard(s, date, date))
                .filter(c => c.parts.some(p => !p.logged))
            if (cards.length) out.push({ date, label: `${DAYS[dow]} ${shortDate(d)}`, isToday: offset === 0, cards })
        }
        return out
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slots, entries, classById, swapped])

    const manualCard: Card | null = useMemo(() => {
        const classId = mClass || (classes[0]?._id ? String(classes[0]._id) : '')
        if (!classId || !mDate) return null
        return buildCard({ day: 0, start: mStart, end: mStart + mHours * 60, classId }, mDate, 'manual')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mClass, mDate, mStart, mHours, classes, classById, swapped, entries])

    const sportFor = (card: Card, part: Part) =>
        sportChoice[part.key] ?? lastSport[card.classId]?.[part.type] ?? ''

    const neededKeys = useMemo(() => {
        const set = new Set<string>()
        const cards = groups.flatMap(g => g.cards)
        if (manualOpen && manualCard) cards.push(manualCard)
        cards.forEach(c => c.parts.forEach(p => {
            if (p.logged) return
            const sp = sportFor(c, p)
            if (sp) set.add(`${c.level}|${sp}|${trimesterOf(c.date)}`)
        }))
        return [...set].sort().join(',')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groups, manualOpen, manualCard, sportChoice, lastSport])

    const wahdas = useWahdaSessions(neededKeys)

    const sessionFor = (card: Card, part: Part, offset = 0): SessionInfo => {
        const sport = sportFor(card, part)
        if (!sport) return { status: 'nosport' }
        const tri = trimesterOf(card.date)
        const sessions = wahdas[`${card.level}|${sport}|${tri}`]
        if (sessions === undefined) return { status: 'loading' }
        if (sessions.length === 0) return { status: 'none' }
        const done = entries.filter(e =>
            String(e.classId) === card.classId &&
            e.sport === sport &&
            e.done &&
            trimesterOf(e.date) === tri &&
            (e.date < card.date || (e.date === card.date && e.time < part.time))
        ).length
        const n = done + 1 + offset
        const session = sessions.find(s => s.sessionNumber === n)
        return session ? { status: 'ok', n, session } : { status: 'finished', n }
    }

    const submitCard = async (card: Card, done: boolean, why = '', next = '', offsets: Record<string, number> = {}) => {
        const pending = card.parts.filter(p => !p.logged)
        const noSport = pending.filter(p => !sportFor(card, p))
        if (noSport.length) {
            toast.error(`اختر النشاط ${noSport.map(p => TYPE_LABEL[p.type]).join(' و')} لقسم ${card.className}`)
            return 0
        }
        setBusy(b => ({ ...b, [card.key]: true }))
        let ok = 0
        try {
            for (const part of pending) {
                const sport = sportFor(card, part)
                const offKey = `${card.classId}|${sport}`
                const info = done ? sessionFor(card, part, offsets[offKey] ?? 0) : null
                const session = info?.status === 'ok' ? info.session : null
                const res = await addEntry({
                    classId: card.classId,
                    className: card.className,
                    institution: school,
                    date: card.date,
                    time: part.time,
                    sport,
                    done,
                    reason: done ? '' : why,
                    nextTime: done ? '' : next,
                    indicator: session?.indicatorText ?? '',
                    goal: session ? session.goal : '',
                })
                if (res) {
                    ok++
                    if (done) offsets[offKey] = (offsets[offKey] ?? 0) + 1
                } else {
                    toast.error('فشل الحفظ، حاول مرة أخرى')
                }
            }
        } finally {
            setBusy(b => ({ ...b, [card.key]: false }))
        }
        return ok
    }

    const acceptAll = async (group: DayGroup) => {
        const offsets: Record<string, number> = {}
        let ok = 0
        for (const card of group.cards) ok += await submitCard(card, true, '', '', offsets)
        if (ok) toast.success(`تم تسجيل ${ok} ساعة`)
    }

    const confirmNotDone = async (card: Card) => {
        if (!reason.trim()) return toast.error('اختر أو اكتب السبب')
        const ok = await submitCard(card, false, reason.trim(), suggestion.trim())
        if (ok) {
            setNotDoneOpen(null)
            setReason('')
            setSuggestion('')
            toast.success('تم التسجيل')
            if (card.key.startsWith('manual')) setManualOpen(false)
        }
    }

    const manualMaxHours = (start: number) => (start < LUNCH ? (LUNCH - start) / 60 : (DAY_END - start) / 60)

    /* ---------- card ---------- */
    const renderCard = (card: Card) => {
        const anyLogged = card.parts.some(p => p.logged)
        return (
            <div key={card.key} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-black text-slate-900">
                        {card.className}
                        <span className="text-[10px] font-bold text-slate-400 mr-2">مستوى {card.level}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500" dir="ltr">{card.timeRange}</span>
                        {!anyLogged && (
                            <button
                                onClick={() => setSwapped(s => ({ ...s, [card.key]: !s[card.key] }))}
                                title="تبديل الترتيب"
                                className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600"
                            >
                                ⇅
                            </button>
                        )}
                    </div>
                </div>

                {card.parts.map(part => {
                    const sport = sportFor(card, part)
                    const info = part.logged ? null : sessionFor(card, part)
                    return (
                        <div key={part.key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500" dir="ltr">{part.time}</span>
                                <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${part.type === 'fardi' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>
                                    {TYPE_LABEL[part.type]}
                                </span>
                            </div>

                            {part.logged ? (
                                <p className="text-sm font-bold text-emerald-700">✓ مسجلة</p>
                            ) : (
                                <>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SPORTS_BY_TYPE[part.type].map(k => (
                                            <button
                                                key={k}
                                                onClick={() => setSportChoice(p => ({ ...p, [part.key]: k }))}
                                                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${sport === k
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-600 border-slate-200'
                                                    }`}
                                            >
                                                {sportLabel(k)}
                                            </button>
                                        ))}
                                    </div>
                                    {info?.status === 'ok' && (
                                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                                            <p className="text-[10px] font-black text-blue-700">الحصة {info.n}</p>
                                            <p className="text-xs font-bold text-slate-800 leading-snug">{info.session.goal}</p>
                                        </div>
                                    )}
                                    {info?.status === 'loading' && <p className="text-[11px] text-slate-400">⏳ جاري تحميل الهدف...</p>}
                                    {info?.status === 'none' && <p className="text-[11px] font-bold text-amber-700">⚠️ لا توجد وحدة تعلمية محفوظة لهذا النشاط</p>}
                                    {info?.status === 'finished' && <p className="text-[11px] font-bold text-amber-700"> انتهت حصص الوحدة لهذا النشاط</p>}
                                </>
                            )}
                        </div>
                    )
                })}

                {notDoneOpen === card.key ? (
                    <div className="space-y-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                        <p className="text-xs font-black text-rose-800">السبب</p>
                        <div className="flex flex-wrap gap-1.5">
                            {REASONS.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setReason(r)}
                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${reason === r ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-800 border-rose-200'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <input
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="أو اكتب السبب..."
                            className="w-full text-sm px-3 py-2 rounded-lg border border-rose-200 bg-white text-black"
                        />
                        <p className="text-xs font-black text-rose-800 pt-1">المقترحات</p>
                        <div className="flex flex-wrap gap-1.5">
                            {SUGGESTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSuggestion(s)}
                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${suggestion === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <input
                            value={suggestion}
                            onChange={e => setSuggestion(e.target.value)}
                            placeholder="أو اكتب اقتراحك..."
                            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-black"
                        />
                        <div className="flex gap-2 pt-1">
                            <button onClick={() => setNotDoneOpen(null)} className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-bold">
                                إلغاء
                            </button>
                            <button
                                onClick={() => confirmNotDone(card)}
                                disabled={busy[card.key]}
                                className="flex-2 py-2 rounded-lg bg-rose-600 text-white text-sm font-black disabled:opacity-50"
                            >
                                تأكيد
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => { setNotDoneOpen(card.key); setReason(''); setSuggestion('') }}
                            className="py-2.5 rounded-xl bg-rose-100 text-rose-800 text-sm font-bold"
                        >
                            لم تنجز
                        </button>
                        <button
                            onClick={async () => {
                                const ok = await submitCard(card, true)
                                if (ok) {
                                    toast.success('تم التسجيل ')
                                    if (card.key.startsWith('manual')) setManualOpen(false)
                                }
                            }}
                            disabled={busy[card.key]}
                            className="col-span-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black active:scale-95 transition disabled:opacity-50"
                        >
                            {busy[card.key] ? '⏳ ...' : ' تمت الحصة'}
                        </button>
                    </div>
                )}
            </div>
        )
    }

    /* ---------- page ---------- */
    return (
        <div className="space-y-4">
            {slots.length === 0 && (
                <button onClick={onEditTimetable} className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-black">
                    📅 أدخل برنامجك الأسبوعي مرة واحدة، وسيقترح عليك التطبيق حصصك كل يوم
                </button>
            )}

            {slots.length > 0 && groups.length === 0 && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <p className="text-lg font-black text-emerald-800">✅ كل حصصك مسجلة</p>
                    <button onClick={onGoToSheet} className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">
                        📖 عرض الدفتر
                    </button>
                </div>
            )}

            {groups.map(group => (
                <div key={group.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-sm font-black ${group.isToday ? 'text-white' : 'text-rose-700'}`}>
                            {group.isToday ? `🔔 اليوم · ${group.label}` : `⚠️ لم تسجل · ${group.label}`}
                        </h2>
                        <button
                            onClick={() => acceptAll(group)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white active:scale-95 transition"
                        >
                            قبول الكل
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.cards.map(renderCard)}
                    </div>
                </div>
            ))}

            {/* manual add for exceptions */}
            <div className="rounded-2xl border border-dashed border-slate-300 p-3 space-y-3">
                <button onClick={() => setManualOpen(o => !o)} className="text-sm font-bold text-red-600">
                    {manualOpen ? '− إغلاق' : '+ حصة يدويا (استدراك، حصة إضافية...)'}
                </button>
                {manualOpen && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <select
                                value={mClass || (classes[0]?._id ? String(classes[0]._id) : '')}
                                onChange={e => setMClass(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-black text-sm font-bold"
                            >
                                {classes.map(c => <option key={c._id} value={String(c._id)}>{c.name}</option>)}
                            </select>
                            <input
                                type="date"
                                value={mDate}
                                onChange={e => setMDate(e.target.value)}
                                className="px-3 py-2 text-black rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold"
                            />
                            <select
                                value={mStart}
                                onChange={e => {
                                    const s = Number(e.target.value)
                                    setMStart(s)
                                    setMHours(h => Math.min(h, manualMaxHours(s)))
                                }}
                                className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-black text-sm font-bold"
                                dir="ltr"
                            >
                                {PERIOD_STARTS.map(s => <option key={s} value={s}>{fmt(s)}</option>)}
                            </select>
                            <select
                                value={mHours}
                                onChange={e => setMHours(Number(e.target.value))}
                                className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-black text-sm font-bold"
                            >
                                <option value={1}>ساعة واحدة</option>
                                {manualMaxHours(mStart) >= 2 && <option value={2}>ساعتان</option>}
                            </select>
                        </div>
                        {manualCard && <div className="max-w-md">{renderCard(manualCard)}</div>}
                    </>
                )}
            </div>
        </div>
    )
}
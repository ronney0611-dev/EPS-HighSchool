'use client'

import { useState, useMemo } from 'react'
import gamesData from '@/src/config/games.json'

type Game = {
    id: number
    title: string
    mohtawaInjaz: string
}

const games = gamesData as Game[]

export default function GamesLibraryPage() {
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return games
        return games.filter(
            g => g.title.toLowerCase().includes(q) || g.mohtawaInjaz.toLowerCase().includes(q)
        )
    }, [query])

    return (
        <div dir="rtl" className="p-6 max-w-4xl mx-auto space-y-6 text-right">
            <h1 className="text-2xl font-bold text-white">مكتبة الألعاب التربوية</h1>

            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن كلمة أو فكرة..."
                className="w-full border border-white/20 bg-black text-white p-3 rounded-xl"
            />

            <p className="text-sm text-gray-400">{filtered.length} لعبة</p>

            <div className="flex flex-col gap-3">
                {filtered.map((g, i) => (
                     <div key={i} className="bg-white text-black rounded-xl p-4">
                        <h2 className="font-bold text-lg mb-1">{g.title}</h2>
                        <p className="text-sm text-gray-700 select-text">{g.mohtawaInjaz}</p>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-center text-gray-500 py-8">لا توجد نتائج</p>
            )}
        </div>
    )
}
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Copy, ThumbsUp, MessageSquare, ArrowLeft } from "lucide-react";
import { useShared, type LibraryFilters, type SharedCard } from "@/hooks/useShared";

const LEVELS_LYCEE: Record<string, string> = { "1": "أولى ثانوي", "2": "ثانية ثانوي", "3": "ثالثة ثانوي" };
const LEVELS_PRIMAIRE: Record<string, string> = { "1": "أولى ابتدائي", "2": "ثانية ابتدائي", "3": "ثالثة ابتدائي", "4": "رابعة ابتدائي", "5": "خامسة ابتدائي" };
const SPORTS: Record<string, string> = {
    sprint: "السرعة", long_jump: "الوثب الطويل", shot_put: "دفع الجلة",
    basketball: "كرة السلة", handball: "كرة اليد", volleyball: "الكرة الطائرة",
};
const MAIDANS: Record<string, string> = { alwad3iyat: "الميدان 1", harakat: "الميدان 2", alhaykala: "الميدان 3" };
const STAGE_LABEL: Record<string, string> = { lycee: "ثانوي", primaire: "ابتدائي", cem: "متوسط" };
export const levelName = (stage: string | undefined, level: string) =>
    (stage === "primaire" ? LEVELS_PRIMAIRE : LEVELS_LYCEE)[level] ?? level;
const TYPE_LABEL: Record<string, string> = { wahda: "وحدة تعلمية", fiche: "مذكرة", ficheP: "مذكرة" };

const selectCls =
    "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 focus:border-red-600 focus:outline-none";

function Card({ item }: { item: SharedCard }) {
    const isWahda = item.type === "wahda";
    const stage = item.stage ?? "lycee";
    return (
        <article className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 text-right shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm text-neutral-500">
                    <span className={`font-bold ${isWahda ? "text-blue-600" : "text-red-600"}`}>
                        {TYPE_LABEL[item.type]} <span className="text-neutral-400 font-normal">({STAGE_LABEL[stage]})</span>
                    </span>
                    <span>{levelName(stage, item.level)} · {item.label}</span>
                </div>

                <h2 className="m-0 text-base font-bold text-neutral-900 leading-snug line-clamp-2">{item.title}</h2>

                <div className="flex items-center gap-2.5 py-1">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700 border border-neutral-200">
                        {item.authorName.trim().charAt(0) || "أ"}
                    </span>
                    <span className="text-sm font-semibold text-neutral-700">{item.authorName}</span>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-3">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5"><Copy size={13} aria-hidden="true" /> {item.copies} نسخة</span>
                    <span className="flex items-center gap-1.5"><ThumbsUp size={13} aria-hidden="true" /> {item.useful}</span>
                    <span className="flex items-center gap-1.5"><MessageSquare size={13} aria-hidden="true" /> {item.comments} تعليق</span>
                </div>

                <Link
                    href={`/library/${item._id}`}
                    className="flex h-9 items-center justify-center rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-500"
                >
                    معاينة
                </Link>
            </div>
        </article>
    );
}

export default function SharedLibrary() {
    const { items, hasMore, loading, error, fetchLibrary } = useShared();
    const [filters, setFilters] = useState<LibraryFilters>({ stage: "", type: "", level: "", sport: "", sort: "copies", q: "" });
    const [page, setPage] = useState(1);
    const [qInput, setQInput] = useState("");
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // search: wait 400ms after the last key
    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setPage(1);
            setFilters((f) => (f.q === qInput ? f : { ...f, q: qInput }));
        }, 400);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [qInput]);

    // page goes back to 1 where the filters change (handlers), not here
    useEffect(() => {
        fetchLibrary(filters, 1);
    }, [filters, fetchLibrary]);

    const set = <K extends keyof LibraryFilters>(k: K, v: LibraryFilters[K]) => {
        setPage(1);
        setFilters((f) => ({ ...f, [k]: v }));
    };

    // a new stage: its levels and activities are different -> reset them
    const setStage = (v: LibraryFilters["stage"]) => {
        setPage(1);
        setFilters((f) => ({ ...f, stage: v, level: "", sport: "", type: v === "primaire" && f.type === "wahda" ? "" : f.type }));
    };

    const levels = filters.stage === "primaire" ? LEVELS_PRIMAIRE : filters.stage === "lycee" ? LEVELS_LYCEE : null;
    const activities = filters.stage === "primaire" ? MAIDANS : filters.stage === "lycee" ? SPORTS : null;

    const stageBtn = (v: LibraryFilters["stage"], label: string) => (
        <button
            type="button"
            onClick={() => setStage(v)}
            className={`h-9 px-4 rounded-lg text-xs font-bold transition-colors ${filters.stage === v
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                }`}
        >
            {label}
        </button>
    );

    const typeBtn = (v: LibraryFilters["type"], label: string) => (
        <button
            type="button"
            onClick={() => set("type", v)}
            className={`h-9 w-full rounded-lg px-3 text-right text-xs font-semibold transition-colors ${filters.type === v
                    ? "bg-red-600 text-white"
                    : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                }`}
        >
            {label}
        </button>
    );

    return (
        <div dir="rtl" className="w-full min-h-screen bg-neutral-950 px-6 py-8 text-right text-neutral-100">
            {/* TOP HEADER & SEARCH BAR */}
            <header className="mb-8 border-b border-neutral-800 pb-8">
                <div className="flex flex-col gap-2 my-6 mb-10 items-center text-center">
                    <h1 className="m-0 text-2xl font-extrabold text-white sm:text-3xl">
                        انشر أعمالك، انسخ مذكرات زملائك، وتفاعل مع أفضل المحتويات التربوية بنقرة واحدة.
                    </h1>
                    <p className="m-0 text-sm text-neutral-400">
                        لاول مرة في الجزائر منصة رقمية مفتوحة لمشاركة الوثائق البيداغوجية بين الأساتذة، وشارك تجربتك مع زملائك.
                    </p>
                </div>

                {/* SEARCH INPUT */}
                <label className="flex h-12 w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 focus-within:border-neutral-700">
                    <Search size={18} className="text-neutral-400 shrink-0" aria-hidden="true" />
                    <span className="sr-only">بحث</span>
                    <input
                        type="search"
                        value={qInput}
                        onChange={(e) => setQInput(e.target.value)}
                        placeholder="ابحث: كرة اليد، السرعة، اسم الأستاذ ..."
                        className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
                    />
                </label>
            </header>

            {/* MAIN CONTENT AREA WITH SIDEBAR */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                {/* SIDEBAR FILTERS */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-5">
                        {/* MY CONTRIBUTIONS LINK */}
                        <Link
                            href="/library/mine"
                            className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-xs font-bold text-neutral-200 hover:border-neutral-700"
                        >
                            <span>مشاركاتي</span>
                            <ArrowLeft size={14} className="text-red-500" />
                        </Link>

                        <hr className="border-neutral-800 my-0" />

                        {/* STAGE FILTER (الطور) */}
                        <div className="space-y-2 mt-2">
                            <span className="text-xs font-semibold text-neutral-400 block">الطور التعليمي</span>
                            <div className="flex flex-wrap gap-1.5">
                                {stageBtn("", "الكل")}
                                {stageBtn("primaire", "ابتدائي")}
                                {stageBtn("lycee", "ثانوي")}
                            </div>
                        </div>

                        {/* TYPE FILTER (نوع المحتوى) */}
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-neutral-400 block">نوع المحتوى</span>
                            <div className="flex flex-col gap-2">
                                {typeBtn("", "الكل")}
                                {filters.stage !== "primaire" && typeBtn("wahda", "الوحدات التعلمية")}
                                {(filters.stage === "primaire" ? typeBtn("ficheP", "المذكرات") : filters.stage === "lycee" ? typeBtn("fiche", "البطاقات التقنية") : typeBtn("fiche", "البطاقات التقنية"))}
                            </div>
                        </div>

                        {/* SELECT FILTERS */}
                        <div className="space-y-4 my-2">
                            {levels && (
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-400">
                                    المستوى
                                    <select className={selectCls} value={filters.level} onChange={(e) => set("level", e.target.value)}>
                                        <option value="">كل المستويات</option>
                                        {Object.entries(levels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </label>
                            )}

                            {activities && (
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-400">
                                    {filters.stage === "primaire" ? "الميدان" : "النشاط"}
                                    <select className={selectCls} value={filters.sport} onChange={(e) => set("sport", e.target.value)}>
                                        <option value="">الكل</option>
                                        {Object.entries(activities).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </label>
                            )}

                            <label className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-400">
                                الترتيب
                                <select className={selectCls} value={filters.sort} onChange={(e) => set("sort", e.target.value as LibraryFilters["sort"])}>
                                    <option value="copies">الأكثر نسخا</option>
                                    <option value="new">الأحدث</option>
                                    <option value="useful">الأكثر إفادة</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* RESULTS GRID */}
                <main className="lg:col-span-3">
                    {error && (
                        <p className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-xs text-red-300">
                            {error}
                        </p>
                    )}

                    {!error && !loading && items.length === 0 && (
                        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center text-xs text-neutral-400">
                            لا توجد نتائج. كن أول من يشارك وحدة أو بطاقة في هذا الاختيار!
                        </div>
                    )}

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="النتائج">
                        {items.map((it) => <Card key={it._id} item={it} />)}
                    </section>

                    {loading && (
                        <p className="mt-8 text-center text-xs text-neutral-400">
                            ⏳ جاري التحميل...
                        </p>
                    )}

                    {hasMore && !loading && (
                        <div className="mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={() => { const next = page + 1; setPage(next); fetchLibrary(filters, next); }}
                                className="h-10 rounded-lg border border-neutral-800 bg-neutral-900 px-6 text-xs font-bold text-white hover:border-neutral-700"
                            >
                                عرض المزيد
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
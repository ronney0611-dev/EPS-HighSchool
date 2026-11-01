"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, ThumbsUp, MessageSquare, CheckCircle2, ChevronRight } from "lucide-react";

import { levelName } from "@/components/SharedLibr";

type Mine = {
    _id: string; type: "fiche" | "wahda" | "ficheP"; stage?: string; level: string; label: string; title: string;
    copies: number; useful: number; tried: number; comments: number; published: boolean; hidden: boolean;
};

export default function MySharedItems() {
    const [items, setItems] = useState<Mine[] | null>(null);
    const [totals, setTotals] = useState({ copies: 0, useful: 0, comments: 0 });
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        fetch("/api/shared/mine")
            .then(async (r) => {
                const d = await r.json().catch(() => ({}));
                if (ignore) return;
                if (!r.ok) setError(d?.error || "خطأ في التحميل");
                else { setItems(d.items ?? []); setTotals(d.totals ?? { copies: 0, useful: 0, comments: 0 }); }
            })
            .catch(() => { if (!ignore) setError("تعذر الاتصال، تحقق من الإنترنت"); });
        return () => { ignore = true; };
    }, []);

    const toggle = async (it: Mine) => {
        const next = !it.published;
        if (!next && !confirm("إلغاء نشر هذه المشاركة؟ لن تظهر في المكتبة (يبقى ما نسخه الأساتذة عندهم).")) return;
        setBusy(it._id);
        const r = await fetch(`/api/shared/${it._id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: next }),
        }).catch(() => null);
        const d = await r?.json().catch(() => ({}));
        setBusy(null);
        if (!r?.ok) return alert(d?.error || "خطأ، حاول مرة أخرى");
        setItems((l) => (l ?? []).map((x) => (x._id === it._id ? { ...x, published: next } : x)));
    };

    if (error) return <p dir="rtl" className="mx-auto max-w-3xl p-10 text-center text-red-400">{error}</p>;
    if (!items) return <p dir="rtl" className="p-10 text-center text-neutral-400">⏳ جاري التحميل...</p>;

    const stat = (n: number, label: string) => (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-center">
            <div className="text-3xl font-black text-white">{n}</div>
            <div className="text-xs text-neutral-400">{label}</div>
        </div>
    );

    return (
        <div dir="rtl" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-right">
            <Link href="/library" className="inline-flex items-center gap-1 text-sm font-bold text-neutral-300 hover:text-white">
                <ChevronRight size={18} aria-hidden="true" /> رجوع إلى المكتبة
            </Link>
            <h1 className="m-0 text-2xl font-black text-white">مشاركاتي</h1>

            <div className="grid grid-cols-3 gap-3">
                {stat(totals.copies, "نسخة")}
                {stat(totals.useful, "مفيد")}
                {stat(totals.comments, "تعليق")}
            </div>

            {items.length === 0 && (
                <p className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-neutral-400">
                    لم تشارك شيئا بعد. افتح بطاقة تقنية أو وحدة تعلمية واضغط «مشاركة».
                </p>
            )}

            <div className="flex flex-col gap-3">
                {items.map((it) => (
                    <div key={it._id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${it.type === "wahda" ? "bg-blue-950 text-blue-300" : "bg-red-950 text-red-300"}`}>
                                    {it.type === "wahda" ? "وحدة تعلمية" : "بطاقة تقنية"}
                                </span>
                                <span className="text-xs text-neutral-400">{levelName(it.stage, it.level)} · {it.label}</span>
                                {it.hidden
                                    ? <span className="rounded-full bg-amber-950 px-2.5 py-0.5 text-xs font-bold text-amber-300">موقوفة من الإدارة</span>
                                    : !it.published && <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-bold text-neutral-300">غير منشورة</span>}
                            </div>
                            <Link href={`/library/${it._id}`} className="text-base font-extrabold text-white hover:text-red-300">{it.title}</Link>
                            <div className="flex flex-wrap gap-4 text-xs text-neutral-300">
                                <span className="flex items-center gap-1.5"><Copy size={14} aria-hidden="true" /> {it.copies} نسخة</span>
                                <span className="flex items-center gap-1.5"><ThumbsUp size={14} aria-hidden="true" /> {it.useful} مفيد</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} aria-hidden="true" /> {it.tried} جربها</span>
                                <span className="flex items-center gap-1.5"><MessageSquare size={14} aria-hidden="true" /> {it.comments} تعليق</span>
                            </div>
                        </div>
                        {!it.hidden && (
                            <button
                                type="button"
                                onClick={() => toggle(it)}
                                disabled={busy === it._id}
                                className={`h-10 rounded-xl border px-4 text-sm font-bold disabled:opacity-50 ${it.published ? "border-neutral-700 text-neutral-200 hover:border-neutral-500" : "border-green-800 text-green-300 hover:border-green-600"}`}
                            >
                                {it.published ? "إلغاء النشر" : "إعادة النشر"}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
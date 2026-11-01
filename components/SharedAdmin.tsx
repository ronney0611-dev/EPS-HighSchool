"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type It = { _id: string; authorId: string; authorName: string; type: string; title: string; reports: number; hidden: boolean };
type Co = { _id: string; itemId: string; userId: string; authorName: string; text: string; reports: number; hidden: boolean };
type Ban = { userId: string; name: string };

const btn = "h-9 rounded-lg border px-3 text-xs font-bold";

export default function SharedAdmin() {
  const [data, setData] = useState<{ items: It[]; comments: Co[]; banned: Ban[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/shared/admin").catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok) setError(d?.error || "خطأ في التحميل");
    else { setError(null); setData(d); }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/shared/admin")
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (ignore) return;
        if (!r.ok) setError(d?.error || "خطأ في التحميل");
        else setData(d);
      })
      .catch(() => { if (!ignore) setError("تعذر الاتصال"); });
    return () => { ignore = true; };
  }, []);

  const act = async (body: Record<string, string>, ask?: string) => {
    if (ask && !confirm(ask)) return;
    const r = await fetch("/api/shared/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (!r?.ok) { const d = await r?.json().catch(() => ({})); return alert(d?.error || "خطأ، حاول مرة أخرى"); }
    load();
  };

  if (error) return <p dir="rtl" className="mx-auto max-w-3xl p-10 text-center text-red-400">{error}</p>;
  if (!data) return <p dir="rtl" className="p-10 text-center text-neutral-400">⏳ جاري التحميل...</p>;

  const banned = new Set(data.banned.map((b) => b.userId));
  const status = (hidden: boolean, reports: number) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${hidden ? "bg-red-950 text-red-300" : "bg-amber-950 text-amber-300"}`}>
      {hidden ? "مخفي" : "ظاهر"} · {reports} إبلاغ
    </span>
  );
  const banBtn = (userId: string) => banned.has(userId)
    ? <button type="button" className={`${btn} border-neutral-700 text-neutral-200`} onClick={() => act({ action: "unban", userId })}>إلغاء الحظر</button>
    : <button type="button" className={`${btn} border-red-900 text-red-300`} onClick={() => act({ action: "ban", userId }, "حظر هذا الأستاذ من النشر والتعليق؟")}>حظر الأستاذ</button>;

  return (
    <div dir="rtl" className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 text-right text-white">
      <h1 className="m-0 text-2xl font-black">إدارة مكتبة الأساتذة</h1>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-lg font-extrabold">التعليقات المبلغ عنها ({data.comments.length})</h2>
        {data.comments.length === 0 && <p className="text-sm text-neutral-500">لا شيء.</p>}
        {data.comments.map((c) => (
          <div key={c._id} className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">{c.authorName}</span>
              {status(c.hidden, c.reports)}
              <Link href={`/library/${c.itemId}`} className="text-xs text-blue-300">فتح المشاركة</Link>
            </div>
            <p className="m-0 whitespace-pre-line text-sm text-neutral-200">{c.text}</p>
            <div className="flex flex-wrap gap-2">
              {c.hidden
                ? <button type="button" className={`${btn} border-green-800 text-green-300`} onClick={() => act({ action: "restore", type: "comment", id: c._id })}>إظهار</button>
                : <button type="button" className={`${btn} border-amber-800 text-amber-300`} onClick={() => act({ action: "hide", type: "comment", id: c._id })}>إخفاء</button>}
              <button type="button" className={`${btn} border-red-900 text-red-300`} onClick={() => act({ action: "delete", type: "comment", id: c._id }, "حذف التعليق نهائيا؟")}>حذف</button>
              {banBtn(c.userId)}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-lg font-extrabold">المشاركات المبلغ عنها ({data.items.length})</h2>
        {data.items.length === 0 && <p className="text-sm text-neutral-500">لا شيء.</p>}
        {data.items.map((i) => (
          <div key={i._id} className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/library/${i._id}`} className="text-sm font-bold text-white">{i.title}</Link>
              <span className="text-xs text-neutral-400">{i.authorName}</span>
              {status(i.hidden, i.reports)}
            </div>
            <div className="flex flex-wrap gap-2">
              {i.hidden
                ? <button type="button" className={`${btn} border-green-800 text-green-300`} onClick={() => act({ action: "restore", type: "item", id: i._id })}>إظهار</button>
                : <button type="button" className={`${btn} border-amber-800 text-amber-300`} onClick={() => act({ action: "hide", type: "item", id: i._id })}>إخفاء</button>}
              <button type="button" className={`${btn} border-red-900 text-red-300`} onClick={() => act({ action: "delete", type: "item", id: i._id }, "حذف المشاركة وكل تعليقاتها نهائيا؟")}>حذف</button>
              {banBtn(i.authorId)}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-lg font-extrabold">الأساتذة المحظورون ({data.banned.length})</h2>
        {data.banned.length === 0 && <p className="text-sm text-neutral-500">لا أحد.</p>}
        {data.banned.map((b) => (
          <div key={b.userId} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <span className="text-sm font-bold">{b.name}</span>
            {banBtn(b.userId)}
          </div>
        ))}
      </section>
    </div>
  );
}
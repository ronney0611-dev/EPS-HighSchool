"use client";

import { useEffect, useMemo, useState } from "react";

const MAX = 1500;

type C = {
  _id: string;
  authorName: string;
  text: string;
  parentId: string | null;
  createdAt: string;
  isAuthor: boolean;
  mine: boolean;
  canDelete: boolean;
};

const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "الآن";
  if (s < 3600) return `منذ ${Math.floor(s / 60)} د`;
  if (s < 86400) return `منذ ${Math.floor(s / 3600)} سا`;
  if (s < 86400 * 30) return `منذ ${Math.floor(s / 86400)} يوم`;
  return new Date(iso).toLocaleDateString("ar-DZ");
};

function Box({ onSend, placeholder, autoFocus }: { onSend: (t: string) => Promise<boolean>; placeholder: string; autoFocus?: boolean }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (busy || !text.trim()) return;
    setBusy(true);
    const ok = await onSend(text);
    setBusy(false);
    if (ok) setText("");
  };
  return (
    <div className="flex flex-col gap-2">
      <label className="sr-only">{placeholder}</label>
      <textarea
        rows={3}
        value={text}
        maxLength={MAX}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-white placeholder:text-neutral-500 focus:border-red-600 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">{text.length}/{MAX}</span>
        <button
          type="button"
          onClick={send}
          disabled={busy || !text.trim()}
          className="h-10 rounded-xl bg-red-600 px-5 text-sm font-extrabold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {busy ? "جاري النشر..." : "نشر"}
        </button>
      </div>
    </div>
  );
}

export default function SharedComments({ itemId, onCount }: { itemId: string; onCount?: (delta: number) => void }) {
  const [list, setList] = useState<C[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/shared/${itemId}/comments`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (ignore) return;
        if (!r.ok) setError(d?.error || "خطأ في تحميل التعليقات");
        else setList(d.comments ?? []);
      })
      .catch(() => { if (!ignore) setError("تعذر الاتصال، تحقق من الإنترنت"); });
    return () => { ignore = true; };
  }, [itemId]);

  // top-level newest first, replies oldest first under their comment
  const tree = useMemo(() => {
    const all = list ?? [];
    return all
      .filter((c) => !c.parentId)
      .map((c) => ({
        c,
        replies: all.filter((r) => r.parentId === c._id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      }));
  }, [list]);

  const send = async (text: string, parentId: string | null) => {
    try {
      const r = await fetch(`/api/shared/${itemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, parentId }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { alert(d?.error || "خطأ أثناء نشر التعليق"); return false; }
      setList((l) => [d.comment, ...(l ?? [])]);
      setReplyTo(null);
      onCount?.(1);
      return true;
    } catch {
      alert("تعذر الاتصال، تحقق من الإنترنت");
      return false;
    }
  };

  const remove = async (c: C) => {
    if (!confirm("حذف هذا التعليق؟")) return;
    const r = await fetch(`/api/shared/comments/${c._id}`, { method: "DELETE" }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (!r?.ok) return alert(d?.error || "خطأ أثناء الحذف");
    setList((l) => (l ?? []).filter((x) => x._id !== c._id && x.parentId !== c._id));
    onCount?.(-(d?.removed ?? 1));
  };

  const report = async (c: C) => {
    if (!confirm("الإبلاغ عن هذا التعليق؟")) return;
    const r = await fetch("/api/shared/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "comment", id: c._id }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    alert(r?.ok ? "شكرا، تم إرسال الإبلاغ" : d?.error || "خطأ، حاول مرة أخرى");
  };

  const one = (c: C, isReply: boolean) => (
    <article key={c._id} className={`flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 ${isReply ? "mr-10" : ""}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-extrabold text-blue-200">
        {c.authorName.trim().charAt(0) || "أ"}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-white">{c.authorName}</span>
          {c.isAuthor && <span className="rounded-full bg-blue-950 px-2 py-0.5 text-xs font-bold text-blue-300">صاحب المشاركة</span>}
          <span className="text-xs text-neutral-500">{ago(c.createdAt)}</span>
        </div>
        <p className="m-0 whitespace-pre-line break-words text-sm leading-7 text-neutral-200">{c.text}</p>
        <div className="flex gap-4">
          {!isReply && (
            <button type="button" onClick={() => setReplyTo(replyTo === c._id ? null : c._id)} className="py-1 text-xs font-bold text-neutral-300 hover:text-white">
              رد
            </button>
          )}
          {!c.mine && (
            <button type="button" onClick={() => report(c)} className="py-1 text-xs text-neutral-500 hover:text-amber-400">
              إبلاغ
            </button>
          )}
          {c.canDelete && (
            <button type="button" onClick={() => remove(c)} className="py-1 text-xs text-neutral-500 hover:text-red-400">
              حذف
            </button>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <section dir="rtl" className="mt-10 flex flex-col gap-4 text-right" aria-label="التعليقات">
      <h2 className="m-0 text-xl font-extrabold text-white">
        التعليقات {list && <span className="font-semibold text-neutral-400">({list.length})</span>}
      </h2>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <Box onSend={(t) => send(t, null)} placeholder="شارك تجربتك أو اطرح سؤالا..." />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!list && !error && <p className="text-sm text-neutral-400">⏳ جاري تحميل التعليقات...</p>}
      {list && list.length === 0 && <p className="text-sm text-neutral-500">لا توجد تعليقات بعد. كن أول من يعلق!</p>}

      {tree.map(({ c, replies }) => (
        <div key={c._id} className="flex flex-col gap-2">
          {one(c, false)}
          {replies.map((r) => one(r, true))}
          {replyTo === c._id && (
            <div className="mr-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
              <Box onSend={(t) => send(t, c._id)} placeholder={`الرد على ${c.authorName}...`} autoFocus />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
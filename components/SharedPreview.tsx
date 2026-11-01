"use client";

// components/SharedPreview.tsx — معاينة a shared fiche / وحدة + "نسخ إلى حسابي"
import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, ThumbsUp, MessageSquare, Download, ChevronRight, CheckCircle2 } from "lucide-react";
import FicheTechWizard, { type FichePreview } from "@/pages/FicheTechWizard";
import FicheTechWizardP, { type FichePPreview } from "@/pages/FicheTechWizardP";
import { useFicheTech } from "@/hooks/useFicheTech";
import { useFicheTechP } from "@/hooks/useFicheTechP";
import { levelName } from "@/components/SharedLibr";
import { useWahda } from "@/hooks/useWahda";
import type { ISession } from "@/app/models/WahdaDoc";
import SharedComments from "@/components/SharedComments";

type WahdaPayload = { sport: string; trimester: "1" | "2" | "3"; sessions: ISession[]; kaidiIndex?: number; ahdafIndex?: number };
type Item = {
  _id: string;
  authorName: string;
  type: "fiche" | "wahda" | "ficheP";
  stage?: string;
  level: string;
  label: string;
  title: string;
  payload: FichePreview | WahdaPayload | FichePPreview;
  copies: number;
  useful: number;
  tried: number;
  comments: number;
};

const sessionName = (s: ISession) =>
  s.sessionNumber === 0 ? "تقويم بيني" : s.isReminder ? "حصة تذكيرية" : `تعليمية ${String(s.sessionNumber).padStart(2, "0")}`;

function WahdaTable({ p }: { p: WahdaPayload }) {
  const rows = [
    { n: "تقويم تشخيصي", ind: "إجراء معاينة أولية للمكتسبات", goal: "إجراء منافسة مصغرة وتسجيل النتائج", eval: true },
    ...p.sessions.map((s) => ({ n: sessionName(s), ind: s.indicatorText, goal: s.goal, eval: s.sessionNumber === 0 })),
    { n: "تقويم تحصيلي", ind: "قياس مدى تحقق الأهداف البيداغوجية والمؤشرات", goal: "إجراء منافسة نهائية تطبيقية وتحصيل العلامات", eval: true },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full min-w-[560px] border-collapse text-xs">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-700">
            <th className="p-3 text-right font-bold">الحصة</th>
            <th className="p-3 text-right font-bold">المؤشر</th>
            <th className="p-3 text-right font-bold">هدف الحصة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-neutral-100 last:border-none">
              <td className={`whitespace-nowrap p-3 font-semibold ${r.eval ? "text-red-600" : "text-blue-600"}`}>{r.n}</td>
              <td className="p-3 text-neutral-800">{r.ind}</td>
              <td className="p-3 text-neutral-500">{r.goal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SharedPreview({ id }: { id: string }) {
  const [item, setItem] = useState<Item | null>(null);
  const [mine, setMine] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState({ useful: false, tried: false });
  const [liking, setLiking] = useState(false);
  const { save } = useFicheTech();
  const { saveWahda } = useWahda();
  const { save: saveP } = useFicheTechP();

  useEffect(() => {
    let ignore = false;
    fetch(`/api/shared/${id}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (ignore) return;
        if (!r.ok) setError(d?.error || "خطأ في تحميل المشاركة");
        else { setItem(d.item); setMine(!!d.mine); if (d.liked) setLiked(d.liked); }
      })
      .catch(() => { if (!ignore) setError("تعذر الاتصال، تحقق من الإنترنت"); });
    return () => { ignore = true; };
  }, [id]);

  const toggleLike = async (kind: "useful" | "tried") => {
    if (!item || liking) return;
    setLiking(true);
    try {
      const r = await fetch(`/api/shared/${item._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return alert(d?.error || "خطأ، حاول مرة أخرى");
      setLiked((l) => ({ ...l, [kind]: !!d.active }));
      setItem((it) => (it ? { ...it, useful: d.useful, tried: d.tried } : it));
    } catch {
      alert("تعذر الاتصال، تحقق من الإنترنت");
    } finally {
      setLiking(false);
    }
  };

  const reportItem = async () => {
    if (!item || !confirm("الإبلاغ عن هذه المشاركة (محتوى غير لائق أو منسوخ دون إذن)؟")) return;
    const r = await fetch("/api/shared/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "item", id: item._id }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    alert(r?.ok ? "شكرا، تم إرسال الإبلاغ" : d?.error || "خطأ، حاول مرة أخرى");
  };

  const handleCopy = async () => {
    if (!item || copying) return;
    setCopying(true);
    try {
      if (item.type === "ficheP") {
        const p = item.payload as FichePPreview;
        const doc = await saveP({ _id: null, title: item.title, level: p.level, pick: p.pick, fields: p.fields });
        if (!doc) throw new Error("فشل النسخ، حاول مرة أخرى");
      } else if (item.type === "fiche") {
        const p = item.payload as FichePreview;
        const doc = await save({ _id: null, title: item.title, level: p.level, sessionNumber: p.sessionNumber, individual: p.individual, collective: p.collective, fields: p.fields });
        if (!doc) throw new Error("فشل النسخ، حاول مرة أخرى");
      } else {
        const p = item.payload as WahdaPayload;
        const r = await fetch(`/api/wahda/${item.level}?sport=${encodeURIComponent(p.sport)}&trimester=${p.trimester}`);
        const existing = await r.json().catch(() => ({}));
        if (Array.isArray(existing?.sessions) && existing.sessions.length > 0 &&
          !confirm("لديك وحدة تعلمية لنفس المستوى والنشاط والفصل. استبدالها بهذه الوحدة؟")) return;
        const ok = await saveWahda(item.level, { sport: p.sport, trimester: p.trimester, sessions: p.sessions, kaidiIndex: p.kaidiIndex ?? 0, ahdafIndex: p.ahdafIndex ?? 0, dates: [] });
        if (!ok) throw new Error("فشل النسخ، حاول مرة أخرى");
      }
      const c = await fetch(`/api/shared/${item._id}/copy`, { method: "POST" }).then((r) => r.json()).catch(() => null);
      if (typeof c?.copies === "number") setItem((it) => (it ? { ...it, copies: c.copies } : it));
      setCopied(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "فشل النسخ، حاول مرة أخرى");
    } finally {
      setCopying(false);
    }
  };

  if (error) {
    return (
      <div dir="rtl" className="w-full min-h-screen bg-neutral-950 px-6 py-16 text-center text-neutral-100">
        <p className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-xs text-red-300">{error}</p>
        <Link href="/library" className="mt-6 inline-block text-xs font-bold text-red-400 hover:text-red-300">رجوع إلى المكتبة</Link>
      </div>
    );
  }
  if (!item) return <p dir="rtl" className="w-full min-h-screen bg-neutral-950 py-16 text-center text-xs text-neutral-400">جاري التحميل...</p>;

  const isWahda = item.type === "wahda";

  return (
    <div dir="rtl" className="w-full min-h-screen bg-neutral-950 px-6 py-6 text-right text-neutral-100">
      {/* BACK LINK */}
      <Link href="/library" className="mb-5 inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-white transition-colors">
        <ChevronRight size={14} aria-hidden="true" /> رجوع إلى المكتبة
      </Link>

      {/* HEADER CARD */}
      <div className="mb-6 flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        {/* CONTENT METADATA */}
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${isWahda ? "text-blue-600" : "text-red-600"}`}>
              {isWahda ? "وحدة تعلمية" : "مذكرة"}
            </span>
            <span className="text-neutral-500">{levelName(item.stage, item.level)} · {item.label}</span>
          </div>

          <h1 className="m-0 text-lg font-bold leading-snug text-neutral-900 sm:text-xl">{item.title}</h1>

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-bold text-neutral-700 border border-neutral-200">
              {item.authorName.trim().charAt(0) || "أ"}
            </span>
            <span className="text-xs font-medium text-neutral-700">{item.authorName}</span>
            {mine && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">مشاركتك</span>}
          </div>

          <div className="flex flex-wrap gap-4 border-t border-neutral-100 pt-2.5 text-xs text-neutral-500">
            <span className="flex items-center gap-1"><Copy size={13} aria-hidden="true" /> {item.copies} نسخة</span>
            <span className="flex items-center gap-1"><ThumbsUp size={13} aria-hidden="true" /> {item.useful} مفيد</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={13} aria-hidden="true" /> {item.tried} جربها</span>
            <span className="flex items-center gap-1"><MessageSquare size={13} aria-hidden="true" /> {item.comments} تعليق</span>
          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="flex w-full flex-col gap-2 sm:w-64 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            disabled={copying}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-60 transition-colors"
          >
            <Download size={14} aria-hidden="true" />
            {copying ? "جاري النسخ..." : copied ? "تم النسخ ✓" : "نسخ إلى حسابي"}
          </button>

          {!mine && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleLike("useful")}
                disabled={liking}
                aria-pressed={liked.useful}
                className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border text-xs font-semibold disabled:opacity-60 transition-colors ${liked.useful ? "border-blue-600 bg-blue-50 text-blue-700" : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"}`}
              >
                <ThumbsUp size={13} aria-hidden="true" /> مفيد
              </button>
              <button
                type="button"
                onClick={() => toggleLike("tried")}
                disabled={liking}
                aria-pressed={liked.tried}
                className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border text-xs font-semibold disabled:opacity-60 transition-colors ${liked.tried ? "border-green-600 bg-green-50 text-green-700" : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"}`}
              >
                <CheckCircle2 size={13} aria-hidden="true" /> جربتها
              </button>
            </div>
          )}

          {!mine && (
            <button type="button" onClick={reportItem} className="self-center py-0.5 text-[11px] text-neutral-400 hover:text-red-600 transition-colors">
              إبلاغ عن هذه المشاركة
            </button>
          )}

          {copied && (
            <p className="m-0 text-center text-[11px] text-neutral-500">
              {isWahda ? "تجدها في صفحة الوحدة التعلمية" : item.type === "ficheP" ? "تجدها في «البطاقات المحفوظة»" : "تجدها في «المذكرات المحفوظة»"}
            </p>
          )}
        </div>
      </div>

      {/* PREVIEW CONTENT */}
      <div className="space-y-6">
        {isWahda
          ? <WahdaTable p={item.payload as WahdaPayload} />
          : item.type === "ficheP"
            ? <FicheTechWizardP preview={item.payload as FichePPreview} />
            : <FicheTechWizard preview={item.payload as FichePreview} />}
      </div>

      {/* COMMENTS SECTION */}
      <div className="mt-8 border-t border-neutral-800 pt-6">
        <SharedComments
          itemId={item._id}
          onCount={(d) => setItem((it) => (it ? { ...it, comments: Math.max(0, it.comments + d) } : it))}
        />
      </div>
    </div>
  );
}
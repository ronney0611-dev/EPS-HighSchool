"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const HIDE_KEY = "epsdz-install-hidden-until";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// the real iPhone share icon (square with an arrow going up)
const ShareIcon = ({ size = 22, color = "#0A84FF" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M12 3v12" />
    <path d="M8 7l4-4 4 4" />
    <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
  </svg>
);

// the iPhone "add to home screen" icon (square with a plus)
const AddIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export default function PwaInstall() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [iosSafari, setIosSafari] = useState(true);
  const [show, setShow] = useState(false);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => { });
    }
    if (isStandalone()) return;
    try {
      const until = Number(localStorage.getItem(HIDE_KEY) || 0);
      if (until > Date.now()) return;
    } catch { /* private mode */ }

    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    // on iPhone only Safari can add to the home screen (Chrome iOS, Facebook... cannot)
    const safari = isIos && !/CriOS|FxiOS|EdgiOS|FBAN|FBAV|Instagram|Line\//i.test(ua);
    const t = setTimeout(() => {
      setIos(isIos);
      setIosSafari(safari);
      if (isIos) setShow(true);
    }, 0);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setShow(true);
    };
    const onInstalled = () => { setShow(false); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setShow(false);
      setDeferred(null);
      return;
    }
    if (ios) setGuide(true);
  };

  const later = () => {
    setShow(false);
    try { localStorage.setItem(HIDE_KEY, String(Date.now() + 7 * 24 * 3600 * 1000)); } catch { /* ignore */ }
  };

  if (!show) return null;

  return (
    <>
      <div dir="rtl" className="print:hidden fixed bottom-4 left-4 right-4 z-200 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-md sm:right-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold text-white">تطبيق EPSDZ</div>
          <div className="text-xs text-zinc-400">ثبّته على هاتفك وافتحه بضغطة واحدة</div>
        </div>
        <button
          type="button"
          onClick={install}
          className="h-11 shrink-0 rounded-xl bg-red-600 px-4 text-sm font-extrabold text-white hover:bg-red-500 active:scale-95"
        >
          📲 تثبيت التطبيق
        </button>
        <button type="button" onClick={later} aria-label="لاحقا" className="h-11 w-8 shrink-0 text-lg text-zinc-500 hover:text-white">
          ✕
        </button>
      </div>

      {guide && (
        <div dir="rtl" className="print:hidden fixed inset-0 z-210 flex items-end justify-center bg-black/70 p-4" onClick={() => setGuide(false)}>
          <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-5 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
              <div className="text-lg font-black">تثبيت EPS DZ على الآيفون</div>
            </div>

            {!iosSafari ? (
              <p className="m-0 mb-4 rounded-xl bg-amber-950/60 p-3 text-sm leading-7 text-amber-200">
                على الآيفون، التثبيت يكون فقط من متصفح <b>Safari</b>. انسخ الرابط <b>www.epsdz.com</b> وافتحه في Safari، ثم اضغط «تثبيت التطبيق» مرة أخرى.
              </p>
            ) : (
              <ol className="m-0 mb-4 flex list-none flex-col gap-3 p-0 text-sm leading-7">
                <li className="flex items-center gap-3 rounded-xl bg-zinc-800 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 font-black">1</span>
                  <span>اضغط على زر المشاركة <ShareIcon /> في أسفل الشاشة</span>
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-zinc-800 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 font-black">2</span>
                  <span>اختر <b>«إضافة إلى الشاشة الرئيسية»</b> <AddIcon /></span>
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-zinc-800 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 font-black">3</span>
                  <span>اضغط <b>«إضافة»</b>، وسيظهر التطبيق على شاشتك 🎉</span>
                </li>
              </ol>
            )}
            <button type="button" onClick={() => setGuide(false)} className="h-12 w-full rounded-xl bg-white text-sm font-extrabold text-black">
              فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
}
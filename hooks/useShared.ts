import { useCallback, useState } from "react";

export type SharedCard = {
  _id: string;
  authorName: string;
  type: "fiche" | "wahda" | "ficheP";
  stage?: "lycee" | "primaire" | "cem";
  level: string;
  sports: string[];
  label: string;
  title: string;
  copies: number;
  useful: number;
  tried: number;
  comments: number;
  createdAt: string;
};

export type LibraryFilters = { stage: "" | "lycee" | "primaire"; type: "" | "fiche" | "wahda" | "ficheP"; level: string; sport: string; sort: "copies" | "new" | "useful"; q: string };

export type PublishResult = { ok: true; updated: boolean } | { ok: false; error: string };

export function useShared() {
  const [publishing, setPublishing] = useState(false);

  const publish = useCallback(
    async (type: "fiche" | "wahda" | "ficheP", payload: Record<string, unknown>, sourceId?: string | null, title?: string): Promise<PublishResult> => {
      setPublishing(true);
      try {
        const res = await fetch("/api/shared", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, payload, sourceId: sourceId ?? null, title }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: data?.error || "خطأ أثناء النشر، حاول مرة أخرى" };
        return { ok: true, updated: !!data.updated };
      } catch {
        return { ok: false, error: "تعذر الاتصال، تحقق من الإنترنت" };
      } finally {
        setPublishing(false);
      }
    },
    []
  );

  const [items, setItems] = useState<SharedCard[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // page 1 replaces the list, next pages are added under it
  const fetchLibrary = useCallback(async (f: LibraryFilters, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ sort: f.sort, page: String(page) });
      if (f.stage) qs.set("stage", f.stage);
      if (f.type) qs.set("type", f.type);
      if (f.level) qs.set("level", f.level);
      if (f.sport) qs.set("sport", f.sport);
      if (f.q.trim()) qs.set("q", f.q.trim());
      const res = await fetch(`/api/shared?${qs}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "خطأ في تحميل المكتبة");
      setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
      setHasMore(!!data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ في تحميل المكتبة");
    } finally {
      setLoading(false);
    }
  }, []);

  return { publish, publishing, items, hasMore, loading, error, fetchLibrary };
}
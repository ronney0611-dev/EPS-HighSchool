import { useCallback, useState } from "react";
import type { SessionPickState } from "@/src/config/fichePrimaireData";

export type FichePListItem = { _id: string; title: string; level: string; updatedAt: string };
export type FicheP = { _id: string; title: string; level: string; pick: SessionPickState; fields: Record<string, string> };

export function useFicheTechP() {
    const [list, setList] = useState<FichePListItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch("/api/fiche-primaire");
            const d = await r.json().catch(() => ({}));
            if (r.ok) setList(d.list ?? []);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOne = useCallback(async (id: string): Promise<FicheP | null> => {
        const r = await fetch(`/api/fiche-primaire/${id}`).catch(() => null);
        if (!r?.ok) return null;
        const d = await r.json().catch(() => null);
        return d?.fiche ?? null;
    }, []);

    const save = useCallback(async (data: { _id: string | null; title: string; level: string; pick: SessionPickState; fields: Record<string, string> }) => {
        const r = await fetch("/api/fiche-primaire", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).catch(() => null);
        const d = await r?.json().catch(() => ({}));
        if (!r?.ok) {
            alert(d?.error || "فشل الحفظ، حاول مرة أخرى");
            return null;
        }
        return d.fiche as { _id: string; title: string };
    }, []);

    const remove = useCallback(async (id: string) => {
        const r = await fetch(`/api/fiche-primaire/${id}`, { method: "DELETE" }).catch(() => null);
        return !!r?.ok;
    }, []);

    return { list, loading, fetchList, fetchOne, save, remove };
}
"use client";

import { useCallback, useState } from "react";
import type { SportPickState } from "@/src/config/ficheTechData";
import type { UnitChoice } from "@/components/FicheTechConfig";

export interface FicheSummary {
  _id: string;
  title: string;
  level: string;
  sessionNumber: UnitChoice;
  updatedAt: string;
}

export interface FicheFull extends FicheSummary {
  individual: SportPickState;
  collective: SportPickState;
  fields: Record<string, string>;
}

export interface FichePayload {
  _id?: string | null;
  title: string;
  level: string;
  sessionNumber: UnitChoice;
  individual: SportPickState;
  collective: SportPickState;
  fields: Record<string, string>;
}

export function useFicheTech() {
  const [list, setList] = useState<FicheSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fiche-tech");
      if (res.ok) setList(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOne = useCallback(async (id: string): Promise<FicheFull | null> => {
    const res = await fetch(`/api/fiche-tech/${id}`);
    return res.ok ? res.json() : null;
  }, []);

  const save = useCallback(async (payload: FichePayload): Promise<FicheFull | null> => {
    const res = await fetch("/api/fiche-tech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok ? res.json() : null;
  }, []);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/fiche-tech/${id}`, { method: "DELETE" });
    if (res.ok) setList(prev => prev.filter(f => f._id !== id));
    return res.ok;
  }, []);

  return { list, loading, fetchList, fetchOne, save, remove };
}
// hooks/useSessionRefresh.ts
import { useCallback } from "react";
import axios from "axios";

export function useSessionRefresh() {
    const refresh = useCallback(async (): Promise<{
        isPaid: boolean;
        paidUntil: string | null;
        role: string;
    } | null> => {
        try {
            const res = await axios.get("/api/auth/refresh");
            const { isPaid, paidUntil, role } = res.data;

            const maxAge = 60 * 60 * 24 * 365;
            const expires = new Date(Date.now() + maxAge * 1000).toUTCString();

            document.cookie = `eps_is_paid=${isPaid ? "true" : "false"}; path=/; expires=${expires}; SameSite=Lax`;
            document.cookie = `eps_paid_until=${paidUntil ?? ""}; path=/; expires=${expires}; SameSite=Lax`;

            return { isPaid, paidUntil, role };
        } catch (error) {
            console.error("Session refresh error:", error);
            return null;
        }
    }, []);

    return { refresh };
}
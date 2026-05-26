// hooks/useWahda.ts
import { useState, useCallback } from "react";
import axios from "axios";
import { IWahda, ISession } from "@/app/models/WahdaDoc"; // Import plain type layout

export const useWahda = () => {
  const [wahda, setWahda] = useState<IWahda | null>(null); // Fixed type here
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWahda = useCallback(async (level: string, sport: string, trimester: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<IWahda | { sessions: [] }>(
        `/api/wahda/${level}`,
        { params: { sport, trimester } }
      );
      
      const data = response.data;
      
      setTimeout(() => {
        if ("sessions" in data && data.sessions.length > 0) {
          setWahda(data as IWahda);
        } else {
          setWahda(null);
        }
        setLoading(false);
      }, 0);
    } catch (err: unknown) {
      setTimeout(() => {
        const msg = err instanceof Error ? err.message : "Failed to load document data";
        setError(msg);
        setLoading(false);
      }, 0);
    }
  }, []);

  const saveWahda = async (
    level: string, 
    payload: { sport: string; trimester: string; sessions: ISession[] }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<{ success: boolean; data: IWahda }>(
        `/api/wahda/${level}`,
        payload
      );
      
      const updatedData = response.data.data;

      setTimeout(() => {
        setWahda(updatedData);
        setLoading(false);
      }, 0);
      return true;
    } catch (err: unknown) {
      setTimeout(() => {
        const msg = err instanceof Error ? err.message : "Failed to save document data";
        setError(msg);
        setLoading(false);
      }, 0);
      return false;
    }
  };

  return { wahda, loading, error, fetchWahda, saveWahda, setWahda };
};
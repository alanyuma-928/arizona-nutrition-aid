import { useEffect, useState } from "react";

export function usePersistentState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or serialization errors ignored */
    }
  }, [key, value]);

  return [value, setValue];
}

export const CDS_STORAGE_PREFIX = "cds:v1:";

export function clearCdsStorage() {
  try {
    Object.keys(window.localStorage)
      .filter(k => k.startsWith(CDS_STORAGE_PREFIX))
      .forEach(k => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

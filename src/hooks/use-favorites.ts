import { useSyncExternalStore } from "react";
import { toggleSaved } from "@/lib/discovery";

const key = "egark-favorites-v1";
let cachedRaw: string | null | undefined;
let cachedKeys: string[] = [];
function snapshot() {
  let raw: string | null = null;
  try { raw = localStorage.getItem(key); } catch { return cachedKeys; }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const value: unknown = JSON.parse(raw || "[]");
      cachedKeys = Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
    } catch { cachedKeys = []; }
  }
  return cachedKeys;
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("egark-favorites", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("egark-favorites", callback); };
}
export function useFavorites() {
  const keys = useSyncExternalStore(subscribe, snapshot);
  const toggle = (value: string) => {
    const next = toggleSaved(snapshot(), value);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { return; }
    window.dispatchEvent(new Event("egark-favorites"));
  };
  return { keys, toggle, isSaved: (value: string) => keys.includes(value) };
}
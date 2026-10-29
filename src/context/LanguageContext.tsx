"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { DICTIONARIES, LANG_COOKIE, isLang, type Dict, type Lang } from "@/lib/i18n";

interface LanguageContextType {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: Dict;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** 150000 → « 150 000 FCFA » / « 150 000 فرنك » */
  money: (amount: number) => string;
  /** « 2026-09-03 » → « 3 septembre 2026 » / « 3 سبتمبر 2026 » */
  date: (iso: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// --------------------------------------------------------------------
// La langue choisie vit dans le cookie (lu aussi par le serveur) : c'est la
// seule source de vérité. On la relit quand une page est restaurée par le
// bouton retour (bfcache / cache HTTP) ou quand on revient sur l'onglet.
// --------------------------------------------------------------------

/** Repli si les cookies sont bloqués */
let memoryLang: Lang | null = null;
const listeners = new Set<() => void>();

function readCookieLang(): Lang | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
  return match && isLang(match[1]) ? match[1] : null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("pageshow", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("pageshow", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}

function writeLang(next: Lang) {
  memoryLang = next;
  document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  listeners.forEach((l) => l());
}

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const lang = useSyncExternalStore(
    subscribe,
    () => readCookieLang() ?? memoryLang ?? initialLang,
    () => initialLang
  );
  const pathname = usePathname();

  // Garde <html lang/dir> aligné, y compris après une navigation qui
  // re-rendrait le layout racine avec une valeur serveur en cache.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = DICTIONARIES[lang].meta.title;
  }, [lang, pathname]);

  const setLang = useCallback((next: Lang) => writeLang(next), []);

  const value = useMemo<LanguageContextType>(() => {
    const t = DICTIONARIES[lang];
    const dateFormat = new Intl.DateTimeFormat(lang === "ar" ? "ar-u-nu-latn" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return {
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t,
      setLang,
      toggleLang: () => setLang(lang === "ar" ? "fr" : "ar"),
      money: (amount) => `${amount.toLocaleString("fr-FR")} ${t.common.currency}`,
      date: (iso) => {
        const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
        return Number.isNaN(d.getTime()) ? iso : dateFormat.format(d);
      },
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n must be used within a LanguageProvider");
  return context;
}

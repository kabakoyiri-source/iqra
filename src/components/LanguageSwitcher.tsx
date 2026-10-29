"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/context/LanguageContext";
import type { Lang } from "@/lib/i18n";

const OPTIONS: { id: Lang; label: string; title: string }[] = [
  { id: "ar", label: "عربي", title: "العربية" },
  { id: "fr", label: "FR", title: "Français" },
];

/** Bascule arabe ⇄ français (segment à deux options) */
export function LanguageSwitcher({ tone = "light" }: { tone?: "light" | "dark" | "glass" }) {
  const { lang, setLang, t } = useI18n();

  const shell = {
    light: "border-black/10 bg-white text-deep/70",
    dark: "border-white/15 bg-white/5 text-white/70",
    glass: "border-white/20 bg-white/10 text-white/80 backdrop-blur",
  }[tone];

  const active = tone === "light" ? "bg-navy text-white shadow" : "bg-lime text-night shadow";

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={`inline-flex items-center gap-0.5 rounded-full border p-1 ${shell}`}
    >
      <Languages className="mx-1.5 h-3.5 w-3.5 opacity-70" aria-hidden />
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          title={o.title}
          aria-pressed={lang === o.id}
          onClick={() => setLang(o.id)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
            lang === o.id ? active : "hover:opacity-100 opacity-80"
          } ${o.id === "ar" ? "font-body" : ""}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

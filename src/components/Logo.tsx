"use client";

import { useId } from "react";
import { useI18n } from "@/context/LanguageContext";

/** Pictogramme du logo IQRA (livre ouvert) redessiné en SVG */
export function LogoGlyph({ className = "h-8 w-auto" }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg viewBox="0 0 200 142" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}g1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fac36" />
          <stop offset=".62" stopColor="#36a046" />
          <stop offset="1" stopColor="#2a4c9c" />
        </linearGradient>
        <linearGradient id={`${id}g2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f9f52" />
          <stop offset=".45" stopColor="#2a8a6a" />
          <stop offset="1" stopColor="#29398f" />
        </linearGradient>
        <linearGradient id={`${id}g3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5cf2a" />
          <stop offset="1" stopColor="#8cbd1f" />
        </linearGradient>
        <g id={`${id}half`}>
          <path d="M62 3 L97 23 L97 128 C90 118 78 107 62 101 Z" fill={`url(#${id}g3)`} />
          <path d="M30 29 H48 V108 C68 109 86 116 98 127 V132 C84 121 60 115 30 115 Z" fill={`url(#${id}g1)`} />
          <path d="M6 56 H20 V116 C52 117 82 125 98 134 V139 C80 130 46 123 6 123 Z" fill={`url(#${id}g2)`} />
        </g>
      </defs>
      <use href={`#${id}half`} />
      <use href={`#${id}half`} transform="translate(200 0) scale(-1 1)" />
    </svg>
  );
}

/** Pastille blanche contenant le pictogramme, comme sur les affiches */
export function LogoMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_6px_20px_-8px_rgba(30,58,120,0.45)] ring-1 ring-black/5 ${className}`}
    >
      <LogoGlyph className="h-[62%] w-auto" />
    </span>
  );
}

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark className={compact ? "h-10 w-10" : "h-12 w-12"} />
      <span className="leading-none">
        <span
          className={`keep-tracking block font-display text-[1.45rem] font-extrabold tracking-[0.14em] ${
            light ? "text-white" : "text-navy"
          }`}
        >
          IQRA
        </span>
        <span
          className={`mt-0.5 block text-[0.7rem] font-bold ltr:uppercase ltr:tracking-[0.18em] ${
            light ? "text-lime-soft/90" : "text-emerald"
          }`}
        >
          {t.school.kicker}
        </span>
      </span>
    </span>
  );
}

"use client";

import { Languages, BookOpen, MoonStar, HeartHandshake } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Kicker } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";

const ICONS = [Languages, BookOpen, MoonStar, HeartHandshake];

export function Values() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-deep py-24 text-white lg:py-32">
      <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="pointer-events-none absolute -start-32 bottom-0 h-96 w-96 rounded-full bg-emerald/30 blur-[120px]" />
      <div className="pointer-events-none absolute -end-20 -top-20 h-80 w-80 rounded-full bg-ocean/40 blur-[110px]" />

      {/* Calligraphie décorative */}
      <p
        dir="rtl"
        lang="ar"
        aria-hidden
        className="pointer-events-none absolute -top-6 end-2 select-none font-calli text-[10rem] font-bold leading-none text-white/[0.05] md:text-[15rem]"
      >
        اقرأ
      </p>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="max-w-2xl">
          <Kicker className="text-lime">{t.identity.kicker}</Kicker>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl rtl:leading-[1.35]">
            {t.identity.titleA} <span className="text-lime">{t.identity.titleHighlight}</span>
            {t.identity.titleB}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.identity.items.map((v, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={v.title} delay={i * 0.1}>
                <div className="group h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 transition-colors duration-500 hover:border-lime/40 hover:bg-white/[0.07]">
                  <span className="arch inline-flex h-16 w-14 items-end justify-center bg-white/10 pb-3 text-lime transition-colors duration-500 group-hover:bg-lime group-hover:text-night">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold">{v.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/65">{v.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Bandeau défilant */}
        <div
          dir="ltr"
          className="mt-16 overflow-hidden border-y border-white/10 py-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        >
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-lg font-bold text-white/75">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex gap-10" aria-hidden={k === 1}>
                {t.identity.marquee.map((w) => (
                  <span key={w} className="flex items-center gap-10">
                    {w}
                    <span className="text-lime">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

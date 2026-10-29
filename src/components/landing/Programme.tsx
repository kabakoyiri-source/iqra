"use client";

import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Kicker } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";

/** Section lime inspirée de l'affiche « Le programme éducatif du Camp IQRAA » */
export function Programme() {
  const { t } = useI18n();

  return (
    <section id="programme" className="relative overflow-hidden bg-lime py-24 text-night lg:py-32">
      <div className="pattern-islamic-dark pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="pointer-events-none absolute -bottom-32 -start-24 h-96 w-96 rounded-full bg-white/40 blur-[110px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
        <div>
          <Reveal>
            <Kicker className="text-navy">{t.programme.kicker}</Kicker>
            <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl rtl:leading-[1.3]">
              {t.programme.title}
            </h2>
            <p className="mt-4 max-w-xl text-lg font-medium text-night/70">{t.programme.subtitle}</p>
          </Reveal>

          <ol className="mt-10 space-y-4">
            {t.programme.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <li className="flex items-stretch gap-3">
                  <span className="flex w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-ocean to-navy font-display text-4xl font-extrabold text-white shadow-lg shadow-navy/30 sm:w-20">
                    {i + 1}
                  </span>
                  <div className="flex-1 rounded-2xl bg-brand-soft px-5 py-4 text-white shadow-lg shadow-emerald/30">
                    <h3 className="font-display text-lg font-bold italic leading-snug sm:text-xl rtl:not-italic">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/80">{item.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={0.2}>
          <div className="relative rounded-[2rem] bg-white p-8 shadow-[0_30px_70px_-30px_rgba(6,27,38,0.5)]">
            <div className="absolute -top-5 start-8 rounded-full bg-navy px-4 py-1.5 font-display text-sm font-bold text-white shadow-lg">
              {t.school.fullName}
            </div>
            <h3 className="mt-2 font-display text-2xl font-extrabold text-navy">{t.programme.outcomesTitle}</h3>
            <ul className="mt-6 space-y-5">
              {t.programme.outcomes.map((o, i) => {
                const Arrow = i % 2 === 0 ? ArrowUpRight : ArrowUpLeft;
                return (
                  <li key={o} className="flex items-start gap-3 font-semibold text-deep/85">
                    <Arrow className="mt-0.5 h-5 w-5 shrink-0 text-leaf" strokeWidth={3} />
                    {o}
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 h-1 w-24 rounded-full bg-lime" />
            <p className="mt-4 font-calli text-2xl text-emerald ltr:font-display ltr:text-lg ltr:italic">{t.school.motto}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

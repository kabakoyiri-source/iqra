"use client";

import { Baby, BookOpenCheck, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CheckBadge, Kicker } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";
import { SECTION_IDS, TUITION } from "@/lib/school";

const ICONS = {
  jardin: Baby,
  primaire: BookOpenCheck,
  college: GraduationCap,
} as const;

export function Sections() {
  const { t, money } = useI18n();

  return (
    <section id="cycles" className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div className="pattern-islamic-dark pointer-events-none absolute end-0 top-10 h-72 w-72 opacity-[0.06] [mask-image:radial-gradient(circle,black,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Kicker className="text-emerald">{t.cycles.kicker}</Kicker>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy md:text-5xl rtl:leading-[1.35]">
            {t.cycles.titleA} <span className="swash">{t.cycles.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-lg text-deep/60">{t.cycles.subtitle}</p>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {SECTION_IDS.map((id, i) => {
            const Icon = ICONS[id];
            const s = t.cycles.items[id];
            return (
              <Reveal key={id} delay={i * 0.12}>
                <article className="card-glow group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_10px_30px_-20px_rgba(30,58,120,0.4)]">
                  <div className="absolute -end-12 -top-12 h-32 w-32 rounded-full bg-mint transition-transform duration-500 group-hover:scale-[2.4]" />

                  <div className="relative">
                    <span className="arch inline-flex h-24 w-20 items-end justify-center bg-brand-soft pb-5 text-white shadow-lg shadow-emerald/25">
                      <Icon className="h-8 w-8" />
                    </span>
                    <p className="mt-5 text-xs font-bold text-emerald ltr:uppercase ltr:tracking-[0.2em]">{s.age}</p>
                    <h3 className="mt-1 font-display text-3xl font-extrabold text-navy">{s.name}</h3>
                    <p className="mt-3 leading-relaxed text-deep/60">{s.description}</p>
                    <ul className="mt-6 space-y-3">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm font-medium text-deep/80">
                          <CheckBadge className="mt-0.5 h-5 w-5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative mt-auto border-t border-dashed border-black/10 pt-6">
                    <p className="text-sm text-deep/50">{t.cycles.annual}</p>
                    <p className="font-display text-2xl font-extrabold text-emerald">{money(TUITION[id])}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

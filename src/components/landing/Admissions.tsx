"use client";

import Link from "next/link";
import { UserRoundPlus, FileUp, CreditCard, BadgeCheck, ArrowRight, BellRing } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Kicker } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";
import { SCHOOL } from "@/lib/school";

const ICONS = [UserRoundPlus, FileUp, CreditCard, BadgeCheck];

export function Admissions() {
  const { t } = useI18n();

  return (
    <section id="admissions" className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div className="pattern-islamic-dark pointer-events-none absolute end-0 top-24 h-72 w-72 opacity-[0.06] [mask-image:radial-gradient(circle,black,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Kicker className="text-emerald">
            {t.admissions.kicker}{" "}
            <span dir="ltr" className="font-display text-2xl font-bold not-italic">
              {SCHOOL.year}
            </span>
          </Kicker>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy md:text-5xl rtl:leading-[1.35]">
            {t.admissions.titleA} <span className="swash">{t.admissions.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-lg text-deep/60">{t.admissions.subtitle}</p>
        </Reveal>

        {/* Calendrier */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 flex max-w-3xl flex-col items-stretch gap-4 rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(30,58,120,0.5)] sm:flex-row sm:items-center sm:gap-0 sm:p-0">
            <div className="flex-1 px-6 py-4 text-center">
              <p className="text-xs font-bold text-emerald ltr:uppercase ltr:tracking-[0.18em]">{t.admissions.opening}</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-navy">{t.dates.start}</p>
            </div>
            <div className="relative flex-1 rounded-2xl bg-brand px-6 py-5 text-center text-white sm:my-3 sm:rounded-3xl">
              <BellRing className="absolute -top-3 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-lime p-1.5 text-night shadow" />
              <p className="text-xs font-bold text-lime-soft ltr:uppercase ltr:tracking-[0.18em]">{t.admissions.registrations}</p>
              <p className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
                {t.dates.start} <span className="inline-block text-lime rtl:rotate-180">→</span> {t.dates.end}
              </p>
            </div>
            <div className="flex-1 px-6 py-4 text-center">
              <p className="text-xs font-bold text-emerald ltr:uppercase ltr:tracking-[0.18em]">{t.admissions.classesStart}</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-navy">{t.dates.classesStart}</p>
            </div>
          </div>
        </Reveal>

        {/* Étapes */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.admissions.steps.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={s.title} delay={i * 0.1}>
                <div className="card-glow relative h-full rounded-[1.75rem] border border-black/5 bg-white p-7">
                  <span className="absolute end-6 top-5 font-display text-6xl font-extrabold text-mint">{i + 1}</span>
                  <span className="arch relative inline-flex h-16 w-14 items-end justify-center bg-brand-soft pb-3 text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="relative mt-5 font-display text-lg font-bold text-navy">{s.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-deep/60">{s.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2} className="mt-12 text-center">
          <Link
            href="/inscription"
            className="group inline-flex items-center gap-3 rounded-full bg-navy px-9 py-4 font-display text-base font-bold text-white shadow-[0_18px_48px_-14px_rgba(30,58,120,0.6)] transition-all hover:bg-emerald"
          >
            {t.admissions.cta}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
          <p className="mt-4 text-sm text-deep/50">{t.admissions.visit}</p>
        </Reveal>
      </div>
    </section>
  );
}

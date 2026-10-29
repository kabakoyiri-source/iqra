"use client";

import { FileCheck, Shirt, Wallet, CalendarClock } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Kicker } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";
import { REGISTRATION_FEE, SCHOOL, SECTION_IDS, TUITION, UNIFORM_FEE, totalDueFor } from "@/lib/school";

export function Pricing() {
  const { t, money } = useI18n();

  return (
    <section id="tarifs" className="relative bg-sand py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Kicker className="text-emerald">{t.pricing.kicker}</Kicker>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy md:text-5xl rtl:leading-[1.35]">
            {t.pricing.titleA} <span className="swash">{t.pricing.titleHighlight}</span>
            {t.pricing.titleB}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-5">
          {/* Scolarité */}
          <Reveal className="lg:col-span-3">
            <div className="card-glow relative h-full overflow-hidden rounded-[2rem] bg-brand p-8 text-white md:p-10">
              <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.07]" />
              <div className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-lime/25 blur-3xl" />

              <div className="relative flex h-full flex-col">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold text-lime-soft ltr:uppercase ltr:tracking-[0.16em]">
                  <Wallet className="h-3.5 w-3.5" />
                  {t.pricing.tuitionBadge(SCHOOL.year)}
                </span>

                <div className="mb-8 mt-8 grid gap-4 sm:grid-cols-3">
                  {SECTION_IDS.map((id) => (
                    <div
                      key={id}
                      className="rounded-2xl border border-white/15 bg-white/10 p-5 transition-colors hover:border-lime/60"
                    >
                      <p className="text-sm font-semibold text-white/75">{t.labels.sections[id]}</p>
                      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                        {TUITION[id].toLocaleString("fr-FR")}
                      </p>
                      <p className="text-sm font-bold text-lime">{t.common.currency}</p>
                      <div className="mt-4 border-t border-white/15 pt-3">
                        <p className="text-[0.7rem] leading-snug text-white/60">{t.pricing.totalWithFees}</p>
                        <p className="mt-0.5 font-display text-base font-bold text-white">{money(totalDueFor(id))}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-start gap-3 rounded-2xl bg-night/25 p-4 text-sm leading-relaxed text-white/85">
                  <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-lime" />
                  <p>
                    <strong className="text-white">{t.pricing.installmentsTitle}</strong> {t.pricing.installmentsText}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Frais annexes */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            <Reveal delay={0.1}>
              <div className="card-glow rounded-[2rem] border border-black/5 bg-white p-8">
                <span className="arch inline-flex h-14 w-12 items-end justify-center bg-mint pb-2.5 text-emerald">
                  <FileCheck className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-navy">{t.pricing.registration}</h3>
                <p className="mt-1 font-display text-3xl font-extrabold text-emerald">{money(REGISTRATION_FEE)}</p>
                <p className="mt-1 text-sm text-deep/55">{t.pricing.registrationNote}</p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="card-glow rounded-[2rem] border border-black/5 bg-white p-8">
                <span className="arch inline-flex h-14 w-12 items-end justify-center bg-sky pb-2.5 text-ocean">
                  <Shirt className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-navy">{t.pricing.uniforms}</h3>
                <div className="mt-3 space-y-2">
                  {SECTION_IDS.map((id) => (
                    <p key={id} className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-deep/55">{t.labels.sections[id]}</span>
                      <span className="font-display text-lg font-extrabold text-navy">{money(UNIFORM_FEE[id])}</span>
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-xs text-deep/45">{t.pricing.uniformsNote}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

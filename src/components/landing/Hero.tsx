"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Sparkles, Phone, BookOpen, Languages } from "lucide-react";
import { LogoGlyph } from "@/components/Logo";
import { CheckBadge, InfoBox, PhoneText } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";
import { SCHOOL } from "@/lib/school";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { t, lang } = useI18n();

  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-brand text-white lg:min-h-[100dvh]">
      {/* Motif & halos */}
      <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="pointer-events-none absolute -top-48 end-[-10rem] h-[38rem] w-[38rem] rounded-full bg-lime/25 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-40 start-[-12rem] h-[30rem] w-[30rem] rounded-full bg-navy/60 blur-[130px]" />

      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-5 pb-20 pt-32 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-28">
        {/* Texte */}
        <div className="text-center lg:text-start">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease }}
            className="relative inline-flex"
          >
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-lime/40" />
            <span className="glass-dark relative inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-lime-soft sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-lime" />
              {t.hero.badge(SCHOOL.year)}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="mt-6 font-calli text-3xl text-lime-soft ltr:font-display ltr:text-xl ltr:font-semibold ltr:italic ltr:text-white/85"
          >
            {t.school.fullName}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="mt-2 font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl rtl:leading-[1.3]"
          >
            {t.hero.titleA}{" "}
            <span className="relative inline-block text-lime">
              {t.hero.titleHighlight}
              <svg viewBox="0 0 200 20" className="absolute -bottom-1 start-0 h-3 w-full text-lime/70 rtl:hidden" aria-hidden preserveAspectRatio="none">
                <path d="M2 14 C50 4 150 4 198 12" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
            {t.hero.titleB}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.52, ease }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link
              href="/inscription"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-lime px-7 py-3.5 font-display text-base font-bold text-night shadow-[0_18px_50px_-14px_rgba(182,238,31,0.65)] transition-transform hover:scale-[1.03]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{t.hero.ctaPrimary}</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
            <a
              href="#cycles"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-lime/60 hover:bg-white/5"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.66, ease }}
            className="glass-dark mx-auto mt-9 flex w-fit flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl border border-white/10 px-5 py-3 text-xs text-white/85 sm:text-sm lg:mx-0"
          >
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-lime" />
              {t.hero.registration(t.dates.start, t.dates.end)}
            </span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span>
              {t.hero.classesStart} <strong className="text-white">{t.dates.classesStart}</strong>
            </span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-lime" />
              <PhoneText phone={SCHOOL.phones[0]} />
            </span>
          </motion.div>
        </div>

        {/* Arche & verset */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className="relative mx-auto w-full max-w-[22rem] sm:max-w-sm lg:max-w-[25rem]"
        >
          <div className="arch relative aspect-[4/5] overflow-hidden border-[10px] border-white/90 bg-gradient-to-b from-night via-deep to-teal shadow-[0_40px_90px_-30px_rgba(6,27,38,0.9)]">
            <div className="pattern-islamic absolute inset-0 opacity-[0.09]" />
            <div className="absolute inset-x-0 top-[28%] mx-auto h-56 w-56 rounded-full bg-lime/25 blur-[70px]" />

            <div className="relative flex h-full flex-col items-center justify-center px-6 pt-6 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
                <LogoGlyph className="h-11 w-auto" />
              </span>
              <p dir="rtl" lang="ar" className="mt-4 font-calli text-[5.5rem] font-bold leading-[1.15] text-lime drop-shadow-[0_6px_24px_rgba(182,238,31,0.35)]">
                اقْرَأْ
              </p>
              <p dir="rtl" lang="ar" className="font-quran text-xl leading-loose text-white/95 sm:text-2xl">
                اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
              </p>
              {lang === "fr" && <p className="mt-1 text-sm italic text-white/70">{t.hero.verseTranslation}</p>}
              <p className="mt-2 text-[0.7rem] font-semibold text-lime-soft/70 ltr:uppercase ltr:tracking-[0.2em]">
                {t.hero.verseRef}
              </p>
            </div>
          </div>

          {/* Cartes flottantes */}
          <div className="absolute -top-3 end-[-0.75rem] animate-float sm:end-[-2rem]">
            <span className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-bold text-deep shadow-xl sm:text-sm">
              <CheckBadge />
              {t.hero.chipQuran}
            </span>
          </div>
          <div className="absolute top-[24%] start-[-1rem] animate-float-slow sm:start-[-3.5rem]">
            <span className="flex items-center gap-2 rounded-2xl bg-navy px-3.5 py-2.5 text-xs font-bold text-white shadow-xl ring-1 ring-white/20 sm:text-sm">
              <Languages className="h-4 w-4 text-lime" />
              {t.hero.chipBilingual}
            </span>
          </div>
          <div className="absolute -bottom-5 end-[-0.75rem] hidden animate-float sm:block sm:end-[-1.75rem]">
            <span className="flex items-center gap-2 rounded-2xl bg-lime px-3.5 py-2.5 text-sm font-bold text-night shadow-xl">
              <BookOpen className="h-4 w-4" />
              {t.hero.chipCadre}
            </span>
          </div>
          <InfoBox compact className="absolute -bottom-8 start-[-0.5rem] w-52 sm:start-[-2rem]" />
        </motion.div>
      </div>

      {/* Vague de transition */}
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="relative mt-auto block h-12 w-full sm:h-16" aria-hidden>
        <path d="M0 64 C240 120 480 8 720 44 C960 80 1200 22 1440 62 V120 H0 Z" className="fill-cream" />
      </svg>
    </section>
  );
}

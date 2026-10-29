"use client";

import Link from "next/link";
import { ArrowLeft, FileUp, CreditCard, BellRing, BookOpenCheck } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InfoBox } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";

const PERK_ICONS = [FileUp, CreditCard, BellRing, BookOpenCheck];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau marque */}
      <aside className="relative hidden overflow-hidden bg-brand text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="pointer-events-none absolute -end-24 top-1/4 h-96 w-96 rounded-full bg-lime/25 blur-[130px]" />
        <p
          dir="rtl"
          lang="ar"
          aria-hidden
          className="pointer-events-none absolute -bottom-12 end-4 select-none font-calli text-[12rem] font-bold leading-none text-white/[0.06]"
        >
          اقرأ
        </p>

        <Link href="/" className="relative w-fit" aria-label={t.common.backHome}>
          <Logo light />
        </Link>

        <div className="relative">
          <p className="font-calli text-3xl text-lime-soft ltr:font-display ltr:text-xl ltr:font-semibold ltr:italic">
            {t.auth.shellKicker}
          </p>
          <h2 className="mt-3 max-w-md font-display text-4xl font-extrabold leading-tight rtl:leading-[1.35]">
            {t.auth.shellTitleA} <span className="text-lime">{t.auth.shellTitleHighlight}</span>
          </h2>
          <ul className="mt-10 space-y-5">
            {t.auth.perks.map((p, i) => {
              const Icon = PERK_ICONS[i];
              return (
                <li key={p} className="flex items-center gap-4 font-medium text-white/85">
                  <span className="arch flex h-12 w-11 shrink-0 items-end justify-center bg-white/15 pb-2.5 text-lime">
                    <Icon className="h-5 w-5" />
                  </span>
                  {p}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative flex items-end justify-between gap-6">
          <p className="text-sm text-white/60">{t.school.address}</p>
          <InfoBox compact className="w-52" />
        </div>
      </aside>

      {/* Formulaire */}
      <main className="relative flex flex-col bg-cream px-5 py-6 sm:px-10 lg:px-16">
        <div className="pattern-islamic-dark pointer-events-none absolute end-0 top-0 h-56 w-56 opacity-[0.06] [mask-image:radial-gradient(circle,black,transparent_70%)]" />

        <div className="relative flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-deep/60 transition-colors hover:text-emerald"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t.common.backHome}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="lg:hidden">
              <LogoMark className="h-10 w-10" />
            </span>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy md:text-4xl rtl:leading-[1.35]">
            {title}
          </h1>
          <p className="mt-2 text-deep/60">{subtitle}</p>

          <div className="mt-9">{children}</div>

          <div className="mt-8 border-t border-black/5 pt-6 text-center text-sm text-deep/60">{footer}</div>
        </div>
      </main>
    </div>
  );
}

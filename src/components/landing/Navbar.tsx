"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/context/LanguageContext";

export function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#cycles", label: t.nav.cycles },
    { href: "#programme", label: t.nav.programme },
    { href: "#camp", label: t.nav.camp },
    { href: "#tarifs", label: t.nav.pricing },
    { href: "#admissions", label: t.nav.admissions },
    { href: "#contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "glass shadow-[0_10px_34px_-18px_rgba(6,27,38,0.35)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
        <Link href="/" aria-label={t.nav.home}>
          <Logo compact={scrolled} light={!solid} />
        </Link>

        <ul className="hidden items-center gap-7 xl:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`text-sm font-semibold transition-colors ${
                  solid ? "text-deep/75 hover:text-emerald" : "text-white/80 hover:text-lime"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2.5 xl:flex">
          <LanguageSwitcher tone={solid ? "light" : "glass"} />
          <Link
            href="/connexion"
            className={`rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
              solid ? "text-navy hover:text-emerald" : "text-white hover:text-lime"
            }`}
          >
            {t.common.login}
          </Link>
          <Link
            href="/inscription"
            className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
              solid
                ? "bg-navy text-white shadow-lg shadow-navy/25 hover:bg-emerald"
                : "bg-lime text-night shadow-lg shadow-lime/20 hover:bg-white"
            }`}
          >
            {t.common.register}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
          <Link
            href="/admin/dashboard"
            title={t.common.adminSpace}
            aria-label={t.common.adminSpace}
            className={`rounded-full border p-2.5 transition-colors ${
              solid ? "border-black/10 text-deep/60 hover:bg-sand" : "border-white/20 text-white/75 hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSwitcher tone={solid ? "light" : "glass"} />
          <button
            onClick={() => setOpen(!open)}
            className={`rounded-full p-2 transition-colors ${solid ? "text-navy" : "text-white"}`}
            aria-label={t.nav.menu}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-black/5 xl:hidden"
          >
            <ul className="space-y-1 px-5 pb-6 pt-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 font-semibold text-deep/80 transition-colors hover:bg-mint"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="grid grid-cols-2 gap-3 pt-3">
                <Link
                  href="/connexion"
                  className="rounded-full border border-navy/20 px-5 py-3 text-center text-sm font-bold text-navy"
                >
                  {t.common.login}
                </Link>
                <Link href="/inscription" className="rounded-full bg-navy px-5 py-3 text-center text-sm font-bold text-white">
                  {t.common.register}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="mt-2 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-deep/60 hover:bg-sand"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t.common.adminSpace}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

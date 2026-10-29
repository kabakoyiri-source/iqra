"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Logo } from "@/components/Logo";
import { InstagramIcon, PhoneText, WhatsAppIcon } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";
import { SCHOOL, telLink, whatsappLink } from "@/lib/school";

export function Footer() {
  const { t } = useI18n();

  const contacts = [
    ...SCHOOL.phones.map((p) => ({ icon: Phone, label: <PhoneText phone={p} />, href: telLink(p), key: p })),
    {
      icon: WhatsAppIcon,
      label: t.common.whatsapp,
      href: whatsappLink(t.camp.whatsappMessage),
      key: "wa",
    },
    {
      icon: InstagramIcon,
      label: <span dir="ltr">@{SCHOOL.instagram}</span>,
      href: `https://www.instagram.com/${SCHOOL.instagram}/`,
      key: "ig",
    },
    { icon: Mail, label: <span dir="ltr">{SCHOOL.email}</span>, href: `mailto:${SCHOOL.email}`, key: "mail" },
  ];

  return (
    <footer id="contact" className="relative overflow-hidden bg-night text-white">
      <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.04]" />
      <div className="h-1.5 w-full bg-gradient-to-r from-navy via-emerald to-lime" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_0.8fr]">
            <div>
              <Logo light />
              <p className="mt-5 max-w-sm leading-relaxed text-white/60">{t.footer.about}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-white/70">
                <MapPin className="h-4 w-4 text-lime" />
                {t.school.address}
              </p>
              <p dir="rtl" lang="ar" className="mt-6 font-quran text-2xl text-lime-soft/80">
                اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-lime ltr:uppercase ltr:tracking-[0.22em]">
                {t.footer.contactTitle}
              </h3>
              <ul className="mt-6 space-y-3.5">
                {contacts.map((c) => (
                  <li key={c.key}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-3 text-white/70 transition-colors hover:text-white"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 transition-colors group-hover:bg-emerald/40">
                        <c.icon className="h-4 w-4" />
                      </span>
                      {c.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-lime ltr:uppercase ltr:tracking-[0.22em]">
                {t.footer.quickTitle}
              </h3>
              <ul className="mt-6 space-y-3 text-white/70">
                <li>
                  <Link href="/inscription" className="transition-colors hover:text-white">
                    {t.nav.enroll}
                  </Link>
                </li>
                <li>
                  <Link href="/connexion" className="transition-colors hover:text-white">
                    {t.common.parentSpace}
                  </Link>
                </li>
                <li>
                  <a href="#camp" className="transition-colors hover:text-white">
                    {t.nav.camp}
                  </a>
                </li>
                <li>
                  <a href="#tarifs" className="transition-colors hover:text-white">
                    {t.footer.pricingLink(SCHOOL.year)}
                  </a>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="transition-colors hover:text-white">
                    {t.common.adminSpace}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row">
          <p>{t.footer.rights(new Date().getFullYear())}</p>
          <p className="font-calli text-xl text-lime-soft/70 ltr:font-display ltr:text-base ltr:italic">{t.school.motto}</p>
        </div>
      </div>
    </footer>
  );
}

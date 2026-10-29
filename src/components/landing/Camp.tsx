"use client";

import { useState } from "react";
import Image from "next/image";
import { Quote, ZoomIn, Flame } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CheckBadge, InfoBox, InstagramIcon, Kicker, Modal, WhatsAppIcon } from "@/components/ui";
import { useI18n } from "@/context/LanguageContext";
import { CAMP_POSTERS, SCHOOL, whatsappLink } from "@/lib/school";

type Poster = (typeof CAMP_POSTERS)[number];

/** Camp de Vacances Qur'an IQRAA — reprend les affiches et légendes Instagram */
export function Camp() {
  const { t } = useI18n();
  const [zoomed, setZoomed] = useState<Poster | null>(null);

  return (
    <section id="camp" className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div className="pattern-islamic-dark pointer-events-none absolute start-0 top-24 h-80 w-80 opacity-[0.06] [mask-image:radial-gradient(circle,black,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          {/* Texte */}
          <div>
            <Reveal>
              <Kicker className="text-emerald">{t.camp.kicker}</Kicker>
              <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy md:text-5xl rtl:leading-[1.35]">
                {t.camp.titleA} <span className="swash">{t.camp.titleHighlight}</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-deep/65">{t.camp.lead}</p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {t.camp.facts.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-white px-3.5 py-2 text-sm font-semibold text-deep/80 shadow-sm"
                  >
                    <CheckBadge className="h-4 w-4" />
                    {f}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-[0_20px_50px_-30px_rgba(30,58,120,0.45)]">
                <h3 className="font-display text-xl font-extrabold text-navy">{t.camp.reasonsTitle}</h3>
                <ol className="mt-5 space-y-3.5">
                  {t.camp.reasons.map((r, i) => (
                    <li key={r} className="flex items-center gap-3.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-ocean to-navy font-display text-sm font-extrabold text-white">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-deep/85">{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={whatsappLink(t.camp.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3.5 font-display text-base font-bold text-white shadow-[0_14px_36px_-12px_rgba(37,211,102,0.7)] transition-transform hover:scale-[1.03]"
                >
                  <WhatsAppIcon />
                  {t.camp.ctaWhatsapp}
                </a>
                <a
                  href={`https://www.instagram.com/${SCHOOL.instagram}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-navy/15 bg-white px-6 py-3.5 text-sm font-bold text-navy transition-colors hover:border-navy/40"
                >
                  <InstagramIcon />
                  {t.camp.ctaInstagram}
                </a>
              </div>
            </Reveal>
          </div>

          {/* Galerie des affiches */}
          <Reveal delay={0.1}>
            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="font-display text-lg font-bold text-navy">{t.camp.galleryTitle}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-xs font-bold text-night">
                  <Flame className="h-3.5 w-3.5" />
                  {t.camp.limited}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {CAMP_POSTERS.map((p, i) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setZoomed(p)}
                    className={`group relative overflow-hidden rounded-[1.4rem] bg-white shadow-[0_20px_40px_-24px_rgba(6,27,38,0.6)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 ${
                      i % 2 === 1 ? "sm:translate-y-8" : ""
                    }`}
                  >
                    <Image
                      src={p.src}
                      alt={t.camp.posters[p.key]}
                      width={853}
                      height={853}
                      sizes="(min-width: 1024px) 300px, 45vw"
                      className="aspect-square h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-night/0 opacity-0 transition-all duration-300 group-hover:bg-night/35 group-hover:opacity-100">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Mission */}
        <Reveal delay={0.1}>
          <figure className="relative mt-20 overflow-hidden rounded-[2rem] bg-brand px-7 py-12 text-white shadow-[0_30px_80px_-35px_rgba(30,58,120,0.8)] sm:px-14">
            <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.08]" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <Quote className="h-10 w-10 text-lime rtl:-scale-x-100" />
                <blockquote className="mt-4 max-w-3xl font-display text-2xl font-bold leading-snug sm:text-3xl rtl:leading-[1.6]">
                  {t.camp.mission}
                </blockquote>
                <figcaption className="mt-5 inline-flex rounded-full bg-lime px-4 py-1.5 text-sm font-bold text-night">
                  {t.camp.chance}
                </figcaption>
              </div>
              <InfoBox className="w-full max-w-60 justify-self-center lg:justify-self-end" />
            </div>
          </figure>
        </Reveal>
      </div>

      <Modal
        open={zoomed !== null}
        onClose={() => setZoomed(null)}
        title={t.camp.kicker}
        subtitle={zoomed ? t.camp.posters[zoomed.key] : undefined}
        size="xl"
      >
        {zoomed && (
          <Image
            src={zoomed.src}
            alt={t.camp.posters[zoomed.key]}
            width={853}
            height={853}
            sizes="(min-width: 768px) 720px, 100vw"
            className="h-auto w-full rounded-2xl"
          />
        )}
      </Modal>
    </section>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useI18n } from "@/context/LanguageContext";
import { SCHOOL, telLink } from "@/lib/school";

/** Numéro de téléphone isolé en LTR pour rester lisible dans un texte arabe */
export function PhoneText({ phone, className }: { phone: string; className?: string }) {
  return (
    <span dir="ltr" className={`inline-block whitespace-nowrap ${className ?? ""}`}>
      {phone}
    </span>
  );
}

/** Coche verte façon ✅ des légendes Instagram */
export function CheckBadge({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-md bg-leaf text-white shadow-sm ${className}`}>
      <Check className="h-[70%] w-[70%]" strokeWidth={3.5} />
    </span>
  );
}

/** Encadré « Infos & inscriptions » repris des affiches */
export function InfoBox({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-18px_rgba(6,27,38,0.55)] ring-1 ring-black/5 ${className}`}>
      <p className="bg-brand-soft px-4 py-1.5 font-display text-sm font-semibold italic text-white">{t.common.infos} :</p>
      <div className={compact ? "px-4 py-2" : "px-4 py-3"} dir="ltr">
        {SCHOOL.phones.map((p) => (
          <a
            key={p}
            href={telLink(p)}
            className={`block font-display font-extrabold leading-tight text-night transition-colors hover:text-emerald ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {p}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Petit titre d'accroche : calligraphie Ruq'a en arabe, italique en français */
export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-calli text-3xl leading-snug ltr:font-display ltr:text-2xl ltr:font-semibold ltr:italic ${className}`}>
      {children}
    </p>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.41 9.42-9.41 2.51 0 4.88.98 6.65 2.76a9.35 9.35 0 0 1 2.75 6.66c0 5.19-4.22 9.41-9.41 9.41m8.01-17.42A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.71 12.08c0 2 .52 3.95 1.52 5.66L.62 23.5l5.9-1.55a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.33-5.08 11.34-11.33 0-3.03-1.18-5.87-3.32-8.01" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Fenêtre modale animée (ferme avec Échap ou clic extérieur) */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  size = "md",
  tone = "light",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  tone?: "light" | "dark";
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const width = { md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" }[size];
  const panel =
    tone === "dark" ? "bg-deep text-white ring-1 ring-white/10" : "bg-white text-deep ring-1 ring-black/5";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-night/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl ${width} ${panel}`}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`no-print flex items-start justify-between gap-4 border-b pb-4 ${
                tone === "dark" ? "border-white/10" : "border-black/5"
              }`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <h3 className="font-display text-lg font-bold leading-snug">{title}</h3>
                  {subtitle && (
                    <p className={`text-xs ${tone === "dark" ? "text-white/55" : "text-deep/55"}`}>{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.common.close}
                className={`rounded-xl p-1.5 transition-colors ${
                  tone === "dark" ? "text-white/50 hover:bg-white/10" : "text-deep/40 hover:bg-sand"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="pt-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Notification flottante */
export function Toast({ message, tone = "success" }: { message: string | null; tone?: "success" | "info" }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className={`fixed inset-x-4 top-5 z-[70] mx-auto flex w-fit max-w-md items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold shadow-2xl ${
            tone === "success" ? "bg-leaf text-white" : "bg-navy text-white"
          }`}
          role="status"
        >
          <CheckBadge className="h-5 w-5 bg-white/25" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Écran de chargement pendant la lecture du stockage local */
export function LoadingScreen({ dark = false }: { dark?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`flex min-h-screen items-center justify-center ${dark ? "bg-night text-white/60" : "bg-cream text-deep/50"}`}>
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {t.common.loading}
      </div>
    </div>
  );
}

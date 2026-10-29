"use client";

import Link from "next/link";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { ArrowLeft } from "lucide-react";
import type { Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import type { StudentStatus } from "@/lib/db";
import type { PayState } from "@/lib/stats";
import { telLink, whatsappLink } from "@/lib/school";
import { WhatsAppIcon } from "@/components/ui";

export const darkInput =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-lime/60 [&>option]:bg-deep";

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-lime">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl rtl:leading-[1.4]">{title}</h1>
          {subtitle && <div className="mt-1 max-w-3xl text-sm text-white/55">{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  text,
  icon,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  text?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[1.5rem] border border-white/10 bg-deep/60 p-5 shadow-xl sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                {icon}
                {title}
              </h2>
            )}
            {text && <p className="mt-1 max-w-3xl text-sm text-white/55">{text}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`pb-3 pe-3 font-semibold ${className || "text-start"}`}>{children}</th>;
}

export function StatusBadge({ status }: { status: StudentStatus }) {
  const { t } = useI18n();
  const tone =
    status === "valide"
      ? "border-emerald/40 bg-emerald/20 text-emerald-200"
      : status === "rejete"
        ? "border-rose-400/40 bg-rose-400/15 text-rose-200"
        : "border-amber-400/40 bg-amber-400/15 text-amber-200";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone}`}>
      {t.labels.status[status]}
    </span>
  );
}

export function PayBadge({ state }: { state: PayState }) {
  const { t } = useI18n();
  const tone = {
    solde: "bg-lime/15 text-lime",
    partiel: "bg-amber-400/15 text-amber-200",
    impaye: "bg-rose-400/15 text-rose-200",
  }[state];
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>{t.admin.payState[state]}</span>;
}

export function ProgressBar({ value, tone = "lime" }: { value: number; tone?: "lime" | "amber" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${tone === "lime" ? "bg-gradient-to-r from-emerald to-lime rtl:bg-gradient-to-l" : "bg-amber-400"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: "default" | "amber" | "emerald" | "rose";
}) {
  const styles = {
    default: "border-white/10 bg-white/[0.04] [--accent:var(--color-lime)]",
    amber: "border-amber-400/20 bg-amber-400/[0.07] [--accent:#fcd34d]",
    emerald: "border-emerald/30 bg-emerald/[0.12] [--accent:var(--color-lime)]",
    rose: "border-rose-400/20 bg-rose-400/[0.07] [--accent:#fda4af]",
  }[tone];
  return (
    <div className={`rounded-[1.25rem] border p-5 ${styles}`}>
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-white/65">
        <span>{label}</span>
        <span className="text-(--accent) [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </div>
      <div className="mt-2 font-display text-2xl font-extrabold text-(--accent)">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-white/50">{hint}</div>}
    </div>
  );
}

/** Pastille élève : photo si disponible, sinon initiales dans une arche */
export function Avatar({ student, size = "md" }: { student: Pick<Student, "firstName" | "lastName" | "documents">; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-10 w-9 pb-1.5 text-xs", md: "h-12 w-11 pb-2 text-sm", lg: "h-24 w-20 pb-4 text-2xl" }[size];
  const photo = student.documents.photo?.dataUrl;
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" className={`arch shrink-0 object-cover ring-2 ring-white/15 ${dims}`} />;
  }
  return (
    <span className={`arch flex shrink-0 items-end justify-center bg-brand-soft font-display font-extrabold text-white ${dims}`}>
      {student.firstName[0]}
      {student.lastName[0]}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-white/45">{children}</p>;
}

export function SelectField({
  label,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={`block text-xs font-semibold text-white/55 ${className}`}>
      {label}
      <select {...props} className={`${darkInput} mt-1`}>
        {children}
      </select>
    </label>
  );
}

export function ButtonLink({ href, children, tone = "ghost" }: { href: string; children: ReactNode; tone?: "ghost" | "lime" }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${
        tone === "lime" ? "bg-lime text-night hover:bg-white" : "border border-white/10 text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export const btn = {
  lime: "inline-flex items-center justify-center gap-1.5 rounded-xl bg-lime px-3.5 py-2 text-sm font-bold text-night transition-colors hover:bg-white disabled:opacity-40",
  green: "inline-flex items-center justify-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald disabled:opacity-40",
  amber: "inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-sm font-bold text-night transition-colors hover:bg-amber-300 disabled:opacity-40",
  ghost: "inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40",
  danger: "inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/30 px-3.5 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/20 disabled:opacity-40",
};

/** Téléphone cliquable + raccourci WhatsApp */
export function PhoneCell({ phone }: { phone: string }) {
  if (!phone) return <span className="text-white/30">—</span>;
  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <a href={telLink(phone)} dir="ltr" className="whitespace-nowrap text-xs text-white/60 hover:text-lime">
        {phone}
      </a>
      <a
        href={whatsappLink("", phone)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="text-[#25D366] hover:brightness-125"
      >
        <WhatsAppIcon className="h-4 w-4" />
      </a>
    </span>
  );
}

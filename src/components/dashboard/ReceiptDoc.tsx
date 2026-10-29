"use client";

import { Printer } from "lucide-react";
import { LogoGlyph } from "@/components/Logo";
import { Modal, PhoneText } from "@/components/ui";
import type { Payment, Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { SCHOOL } from "@/lib/school";

/** Reçu officiel imprimable (en-tête bilingue) */
export function ReceiptDoc({ payment, student, payments }: { payment: Payment; student: Student; payments: Payment[] }) {
  const { t, money, date } = useI18n();
  const r = t.receipt;

  // Reste à payer juste après ce versement (versements antérieurs ou égaux à celui-ci)
  const upTo = payments
    .filter((p) => p.studentId === student.id)
    .filter((p) => p.date < payment.date || (p.date === payment.date && p.receiptNumber <= payment.receiptNumber))
    .reduce((acc, p) => acc + p.amount, 0);
  const remainingAfter = Math.max(0, student.totalDue - upTo);

  const rows: [string, React.ReactNode][] = [
    [r.date, date(payment.date)],
    [r.student, `${student.firstName} ${student.lastName} — ${t.labels.sections[student.section]}`],
    [r.parent, student.parentName],
    [r.type, t.labels.paymentTypes[payment.type]],
    [r.method, t.labels.methods[payment.method]],
    [r.validatedBy, payment.validatedBy],
  ];

  return (
    <div>
      <article className="print-area overflow-hidden rounded-2xl border border-black/10 bg-white text-deep">
        <header className="relative overflow-hidden bg-brand px-6 py-5 text-white">
          <div className="pattern-islamic absolute inset-0 opacity-[0.08]" />
          <div className="relative flex items-center justify-between gap-4" dir="ltr">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                <LogoGlyph className="h-7 w-auto" />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold leading-tight">Complexe Scolaire IQRA</p>
                <p className="text-xs text-white/75">
                  <PhoneText phone={SCHOOL.phones[0]} /> · <PhoneText phone={SCHOOL.phones[1]} />
                </p>
              </div>
            </div>
            <p dir="rtl" lang="ar" className="text-end font-display text-lg font-bold leading-tight">
              مجمع اقرأ المدرسي
              <span className="block text-xs font-normal text-white/75">{SCHOOL.year}</span>
            </p>
          </div>
        </header>

        <div className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-dashed border-black/10 pb-4">
            <div>
              <p className="font-display text-xl font-extrabold text-navy">{r.title}</p>
              <p className="text-xs text-deep/50">
                {r.number} : <span dir="ltr" className="font-mono font-bold text-deep">{payment.receiptNumber}</span>
              </p>
            </div>
            <div className="rounded-2xl bg-mint px-4 py-2 text-center">
              <p className="text-[0.7rem] font-semibold text-emerald">{r.amount}</p>
              <p className="font-display text-2xl font-extrabold text-navy">{money(payment.amount)}</p>
            </div>
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-deep/45">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-sand px-4 py-3 text-sm">
            <span className="text-deep/60">{r.remaining}</span>
            <span className="font-display font-extrabold text-navy">{money(remainingAfter)}</span>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <p className="max-w-xs text-xs text-deep/50">{r.thanks}</p>
            <div className="text-center">
              <div className="h-12 w-40 border-b border-deep/30" />
              <p className="mt-1 text-xs text-deep/50">{r.signature}</p>
            </div>
          </div>
        </div>
      </article>

      <div className="no-print mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald"
        >
          <Printer className="h-4 w-4" />
          {r.print}
        </button>
      </div>
    </div>
  );
}

export function ReceiptModal({
  payment,
  students,
  payments,
  onClose,
}: {
  payment: Payment | null;
  students: Student[];
  payments: Payment[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const student = payment ? students.find((s) => s.id === payment.studentId) : undefined;
  return (
    <Modal open={payment !== null && !!student} onClose={onClose} title={t.receipt.title} subtitle={payment?.receiptNumber} size="lg">
      {payment && student && <ReceiptDoc payment={payment} student={student} payments={payments} />}
    </Modal>
  );
}

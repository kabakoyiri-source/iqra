"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Download, Printer, Receipt, Search, Wallet } from "lucide-react";
import { EmptyState, PageHeader, Panel, ProgressBar, SelectField, StatCard, Th, btn, darkInput } from "@/components/admin/ui";
import { ReceiptModal } from "@/components/dashboard/ReceiptDoc";
import { useSchool, type Payment } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { today } from "@/lib/db";
import { PAYMENT_METHODS, PAYMENT_TYPES, type PaymentMethod, type PaymentType } from "@/lib/school";
import { downloadCSV } from "@/lib/stats";

export default function CaissePage() {
  const { payments, students } = useSchool();
  const { t, money, date } = useI18n();
  const a = t.admin;

  const [q, setQ] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [type, setType] = useState<PaymentType | "">("");
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const studentName = (id: string) => {
    const s = students.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : "—";
  };

  const total = payments.reduce((acc, p) => acc + p.amount, 0);
  const month = today().slice(0, 7);
  const monthTotal = payments.filter((p) => p.date.startsWith(month)).reduce((acc, p) => acc + p.amount, 0);
  const byMethod = PAYMENT_METHODS.map((m) => ({ m, sum: payments.filter((p) => p.method === m).reduce((acc, p) => acc + p.amount, 0) }));

  const query = q.trim().toLowerCase();
  const list = payments
    .filter((p) => !query || `${p.receiptNumber} ${studentName(p.studentId)}`.toLowerCase().includes(query))
    .filter((p) => !method || p.method === method)
    .filter((p) => !type || p.type === type);
  const listTotal = list.reduce((acc, p) => acc + p.amount, 0);

  const exportCsv = () =>
    downloadCSV("caisse-iqra.csv", [
      [a.th.receipt, a.th.date, a.th.student, a.th.type, a.th.method, a.th.amount, t.receipt.validatedBy],
      ...list.map((p) => [p.receiptNumber, p.date, studentName(p.studentId), t.labels.paymentTypes[p.type], t.labels.methods[p.method], p.amount, p.validatedBy]),
    ]);

  return (
    <>
      <PageHeader
        title={a.cashTitle}
        subtitle={a.cashSubtitle}
        actions={
          <button onClick={exportCsv} className={btn.ghost}>
            <Download className="h-4 w-4" /> {a.exportCsv}
          </button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label={a.cashTotal} value={money(total)} icon={<Wallet />} tone="emerald" />
        <StatCard label={a.cashMonth} value={money(monthTotal)} icon={<CalendarDays />} />
        <StatCard label={a.cashCount} value={payments.length} icon={<Receipt />} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_2.4fr]">
        <Panel title={a.byMethod}>
          <div className="space-y-4">
            {byMethod.map(({ m, sum }) => (
              <div key={m}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold">{t.labels.methods[m]}</span>
                  <span className="font-display font-bold text-white/80">{money(sum)}</span>
                </div>
                <ProgressBar value={total ? (sum / total) * 100 : 0} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <label className="relative block text-xs font-semibold text-white/55">
              <span className="invisible">{a.search}</span>
              <Search className="pointer-events-none absolute start-3 top-[2.05rem] h-4 w-4 text-white/40" />
              <input type="search" placeholder={a.search} value={q} onChange={(e) => setQ(e.target.value)} className={`${darkInput} mt-1 ps-9`} />
            </label>
            <SelectField label={a.filterMethod} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod | "")}>
              <option value="">{a.all}</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {t.labels.methods[m]}
                </option>
              ))}
            </SelectField>
            <SelectField label={a.filterType} value={type} onChange={(e) => setType(e.target.value as PaymentType | "")}>
              <option value="">{a.all}</option>
              {PAYMENT_TYPES.map((id) => (
                <option key={id} value={id}>
                  {t.labels.paymentTypes[id]}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-white/55">{a.results(list.length)}</span>
            <span className="font-display font-extrabold text-emerald-300">{money(listTotal)}</span>
          </div>

          {list.length === 0 ? (
            <EmptyState>{a.noPayments}</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/45">
                    <Th>{a.th.receipt}</Th>
                    <Th>{a.th.date}</Th>
                    <Th>{a.th.student}</Th>
                    <Th>{a.th.type}</Th>
                    <Th>{a.th.method}</Th>
                    <Th className="text-end">{a.th.amount}</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {list.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.03]">
                      <td className="py-2.5 pe-3 font-mono text-xs font-bold text-lime">
                        <span dir="ltr">{p.receiptNumber}</span>
                      </td>
                      <td className="py-2.5 pe-3 text-white/65">{date(p.date)}</td>
                      <td className="py-2.5 pe-3">
                        <Link href={`/admin/eleves/${p.studentId}`} className="font-bold hover:text-lime">
                          {studentName(p.studentId)}
                        </Link>
                      </td>
                      <td className="py-2.5 pe-3">{t.labels.paymentTypes[p.type]}</td>
                      <td className="py-2.5 pe-3 text-white/60">{t.labels.methods[p.method]}</td>
                      <td className="py-2.5 pe-3 text-end font-display font-extrabold text-emerald-300">{money(p.amount)}</td>
                      <td className="py-2.5 text-end">
                        <button onClick={() => setReceipt(p)} aria-label={t.receipt.print} title={t.receipt.print} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <ReceiptModal payment={receipt} students={students} payments={payments} onClose={() => setReceipt(null)} />
    </>
  );
}

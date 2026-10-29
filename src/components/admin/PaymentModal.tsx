"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { Modal } from "@/components/ui";
import { useSchool, type Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { PAYMENT_METHODS, PAYMENT_TYPES, REGISTRATION_FEE, type PaymentMethod, type PaymentType } from "@/lib/school";
import { remainingOf } from "@/lib/stats";
import { useAdminToast } from "./AdminShell";
import { darkInput } from "./ui";

/** Encaissement d'un versement : valide le dossier et déduit le montant du reste à payer */
export function PaymentModal({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal
      tone="dark"
      open={student !== null}
      onClose={onClose}
      title={t.admin.validateTitle}
      subtitle={student ? `${student.firstName} ${student.lastName} · ${t.labels.sections[student.section]}` : undefined}
    >
      {student && <PaymentForm key={student.id} student={student} onDone={onClose} />}
    </Modal>
  );
}

function PaymentForm({ student, onDone }: { student: Student; onDone: () => void }) {
  const { confirmPayment } = useSchool();
  const { t, money } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;

  const pending = student.status !== "valide";
  const remaining = remainingOf(student);
  const [amount, setAmount] = useState(String(pending ? Math.min(REGISTRATION_FEE, remaining) : remaining));
  const [type, setType] = useState<PaymentType>(pending ? "inscription" : "acompte");
  const [method, setMethod] = useState<PaymentMethod>("especes");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    await confirmPayment({ studentId: student.id, amount: value, method, type });
    toast(a.paymentValidated(money(value), `${student.firstName} ${student.lastName}`));
    onDone();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-sm">
      <label className="block text-xs font-semibold text-white/65">
        {a.amountReceived}
        <input
          type="number"
          min="1"
          required
          dir="ltr"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${darkInput} mt-1 py-3 text-base font-bold`}
        />
      </label>

      <label className="block text-xs font-semibold text-white/65">
        {a.paymentLabel}
        <select value={type} onChange={(e) => setType(e.target.value as PaymentType)} className={`${darkInput} mt-1 py-3`}>
          {PAYMENT_TYPES.map((id) => (
            <option key={id} value={id}>
              {t.labels.paymentTypes[id]}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="mb-1 block text-xs font-semibold text-white/65">{a.paymentMethod}</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                method === m ? "border-lime bg-lime text-night" : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {t.labels.methods[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald/30 bg-emerald/10 p-3.5 text-emerald-100">
        <span className="text-xs">{a.newRemaining}</span>
        <span className="mt-0.5 block font-display text-lg font-extrabold text-white">
          {money(Math.max(0, remaining - (Number(amount) || 0)))}
        </span>
      </div>

      <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-3.5 font-display text-sm font-bold text-white shadow-lg hover:bg-emerald">
        <CircleCheck className="h-5 w-5" /> {a.confirmPayment}
      </button>
    </form>
  );
}

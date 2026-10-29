"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Eye, RotateCcw, X } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminShell";
import { DocumentsList, docsProvided } from "@/components/admin/DocumentsList";
import { PaymentModal } from "@/components/admin/PaymentModal";
import { Avatar, EmptyState, PageHeader, PhoneCell, btn } from "@/components/admin/ui";
import { Modal } from "@/components/ui";
import { useSchool, type Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import type { StudentStatus } from "@/lib/db";

const TABS: StudentStatus[] = ["en_attente_paiement", "valide", "rejete"];

export default function InscriptionsPage() {
  const { students, setStudentStatus } = useSchool();
  const { t, date } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;

  const [tab, setTab] = useState<StudentStatus>("en_attente_paiement");
  const [payFor, setPayFor] = useState<Student | null>(null);
  const [docsFor, setDocsFor] = useState<Student | null>(null);

  const label = { en_attente_paiement: a.tabPending, valide: a.tabValidated, rejete: a.tabRejected };
  const list = students.filter((s) => s.status === tab).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const name = (s: Student) => `${s.firstName} ${s.lastName}`;

  return (
    <>
      <PageHeader title={a.inscTitle} subtitle={a.inscSubtitle} />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((id) => {
          const n = students.filter((s) => s.status === id).length;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                tab === id ? "bg-lime text-night" : "border border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {label[id]} <span className="opacity-60">({n})</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState>{a.emptyTab}</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((s) => (
            <article key={s.id} className="rounded-[1.5rem] border border-white/10 bg-deep/60 p-5">
              <div className="flex items-start gap-3">
                <Avatar student={s} />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/eleves/${s.id}`} className="font-display text-lg font-bold hover:text-lime">
                    {name(s)}
                  </Link>
                  <p className="text-xs text-white/50">
                    {t.labels.sections[s.section]} · {t.labels.gender[s.gender]} · {t.parent.bornOn(date(s.birthDate))}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/40">{a.submittedOn(date(s.createdAt))}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    docsProvided(s) >= 2 ? "bg-lime/15 text-lime" : "bg-amber-400/15 text-amber-200"
                  }`}
                >
                  {a.docsCount(docsProvided(s), 3)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-3 py-2 text-sm">
                <span className="truncate font-semibold text-white/80">{s.parentName}</span>
                <PhoneCell phone={s.parentPhone} />
              </div>
              {s.healthNotes && <p className="mt-2 text-xs text-amber-100/80">⚕ {s.healthNotes}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setDocsFor(s)} className={btn.ghost}>
                  <Eye className="h-4 w-4" /> {a.docsTitle}
                </button>
                {tab !== "valide" && (
                  <button onClick={() => setPayFor(s)} className={btn.green}>
                    <CircleCheck className="h-4 w-4" /> {a.validate}
                  </button>
                )}
                {tab === "en_attente_paiement" && (
                  <button
                    onClick={async () => {
                      if (!window.confirm(a.rejectConfirm(name(s)))) return;
                      await setStudentStatus(s.id, "rejete");
                      toast(a.rejected(name(s)));
                    }}
                    className={btn.danger}
                  >
                    <X className="h-4 w-4" /> {a.reject}
                  </button>
                )}
                {tab === "rejete" && (
                  <button
                    onClick={async () => {
                      await setStudentStatus(s.id, "en_attente_paiement");
                      toast(a.restored(name(s)));
                    }}
                    className={btn.ghost}
                  >
                    <RotateCcw className="h-4 w-4" /> {a.restore}
                  </button>
                )}
                <Link href={`/admin/eleves/${s.id}`} className={`${btn.ghost} ms-auto`}>
                  {a.view}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <PaymentModal student={payFor} onClose={() => setPayFor(null)} />
      <Modal tone="dark" open={docsFor !== null} onClose={() => setDocsFor(null)} title={a.docsTitle} subtitle={docsFor ? name(docsFor) : undefined}>
        {docsFor && <DocumentsList student={docsFor} />}
      </Modal>
    </>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, FileText, TrendingUp, TriangleAlert, Users } from "lucide-react";
import { Avatar, PageHeader, Panel, ProgressBar, StatCard } from "@/components/admin/ui";
import { useSchool } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { SCHOOL, SECTION_IDS } from "@/lib/school";
import { remainingOf } from "@/lib/stats";

export default function AdminDashboardPage() {
  const { students, payments, classes } = useSchool();
  const { t, money, date } = useI18n();
  const a = t.admin;

  const enrolled = students.filter((s) => s.status === "valide");
  const pending = students.filter((s) => s.status === "en_attente_paiement");
  const revenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const unpaid = enrolled.reduce((acc, s) => acc + remainingOf(s), 0);
  const due = enrolled.reduce((acc, s) => acc + s.totalDue, 0);
  const recovery = due ? Math.round(((due - unpaid) / due) * 100) : 0;
  const unassigned = enrolled.filter((s) => !s.classId).length;
  const debtors = enrolled
    .filter((s) => remainingOf(s) > 0)
    .sort((x, y) => remainingOf(y) - remainingOf(x))
    .slice(0, 5);
  const studentName = (id: string) => {
    const s = students.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : "—";
  };
  const maxSection = Math.max(1, ...SECTION_IDS.map((id) => enrolled.filter((s) => s.section === id).length));

  const seeAll = (href: string) => (
    <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold text-lime hover:underline">
      {a.seeAll} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
    </Link>
  );

  return (
    <>
      <PageHeader title={a.dashTitle} subtitle={a.dashSubtitle(SCHOOL.year)} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={a.kpiStudents} value={a.studentsCount(enrolled.length)} hint={a.kpiStudentsHint(unassigned)} icon={<Users />} />
        <StatCard label={a.kpiPending} value={pending.length} hint={a.kpiPendingHint} icon={<TriangleAlert />} tone="amber" />
        <StatCard label={a.kpiRevenue} value={money(revenue)} hint={a.kpiRevenueHint(payments.length)} icon={<TrendingUp />} tone="emerald" />
        <StatCard
          label={a.kpiUnpaid}
          value={money(unpaid)}
          hint={
            <span className="block space-y-1.5">
              <span className="block">{a.kpiRecovery(recovery)}</span>
              <ProgressBar value={recovery} />
            </span>
          }
          icon={<CreditCard />}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title={a.bySection}>
          <div className="space-y-4">
            {SECTION_IDS.map((id) => {
              const n = enrolled.filter((s) => s.section === id).length;
              return (
                <Link key={id} href={`/admin/eleves?cycle=${id}`} className="block rounded-xl p-1 hover:bg-white/[0.03]">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold">{t.labels.sections[id]}</span>
                    <span className="font-display font-extrabold text-lime">{n}</span>
                  </div>
                  <ProgressBar value={(n / maxSection) * 100} />
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel title={a.byClass} action={seeAll("/admin/classes")} className="xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {classes.map((c) => {
              const n = students.filter((s) => s.classId === c.id).length;
              const cap = c.capacity ?? 30;
              return (
                <Link
                  key={c.id}
                  href={`/admin/classes/${c.id}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-lime/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold">{c.name}</span>
                    <span className="shrink-0 text-xs text-white/50">{a.seats(n, cap)}</span>
                  </div>
                  <p className="mb-2 text-[11px] text-white/45">{c.teacher || a.noTeacher}</p>
                  <ProgressBar value={(n / cap) * 100} tone={n > cap ? "amber" : "lime"} />
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel title={a.pendingTitle} icon={<FileText className="h-5 w-5 text-amber-300" />} action={seeAll("/admin/inscriptions")}>
          {pending.length === 0 ? (
            <p className="py-6 text-center text-sm text-lime">{a.noPending}</p>
          ) : (
            <ul className="space-y-1">
              {pending.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/eleves/${s.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/[0.04]">
                    <Avatar student={s} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {s.firstName} {s.lastName}
                      </span>
                      <span className="block text-[11px] text-white/45">
                        {t.labels.sections[s.section]} · {a.submittedOn(date(s.createdAt))}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={a.latestPayments} action={seeAll("/admin/caisse")}>
          <ul className="space-y-1">
            {payments.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl p-2 text-sm">
                <span className="min-w-0">
                  <Link href={`/admin/eleves/${p.studentId}`} className="block truncate font-bold hover:text-lime">
                    {studentName(p.studentId)}
                  </Link>
                  <span className="block text-[11px] text-white/45">
                    {t.labels.paymentTypes[p.type]} · {date(p.date)}
                  </span>
                </span>
                <span className="shrink-0 font-display font-extrabold text-emerald-300">+{money(p.amount)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={a.topDebtors} action={seeAll("/admin/relances")}>
          <ul className="space-y-1">
            {debtors.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/eleves/${s.id}`} className="flex items-center justify-between gap-3 rounded-xl p-2 text-sm hover:bg-white/[0.04]">
                  <span className="min-w-0">
                    <span className="block truncate font-bold">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="block truncate text-[11px] text-white/45">{s.parentName}</span>
                  </span>
                  <span className="shrink-0 font-display font-extrabold text-amber-300">{money(remainingOf(s))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

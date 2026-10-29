"use client";

import { useState } from "react";
import Link from "next/link";
import { BellRing, Download, Search } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminShell";
import { Avatar, EmptyState, PageHeader, PayBadge, PhoneCell, ProgressBar, btn, darkInput } from "@/components/admin/ui";
import { useSchool } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { downloadCSV, payStateOf, remainingOf } from "@/lib/stats";

export default function FamillesPage() {
  const { parents, students, sendReminder } = useSchool();
  const { t, money, date } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;
  const [q, setQ] = useState("");

  const families = parents
    .map((p) => {
      const children = students.filter((s) => s.parentId === p.id);
      const due = children.reduce((acc, s) => acc + s.totalDue, 0);
      const paid = children.reduce((acc, s) => acc + s.totalPaid, 0);
      return { parent: p, children, due, paid, remaining: Math.max(0, due - paid) };
    })
    .filter(({ parent, children }) => {
      const query = q.trim().toLowerCase();
      if (!query) return true;
      return `${parent.fullName} ${parent.email} ${parent.phone} ${children.map((c) => `${c.firstName} ${c.lastName}`).join(" ")}`
        .toLowerCase()
        .includes(query);
    })
    .sort((x, y) => x.parent.fullName.localeCompare(y.parent.fullName));

  const exportCsv = () =>
    downloadCSV("familles-iqra.csv", [
      [a.th.parent, "E-mail", a.th.phone, a.th.children, a.th.total, a.th.paid, a.th.remaining],
      ...families.map((f) => [
        f.parent.fullName,
        f.parent.email,
        f.parent.phone,
        f.children.map((c) => `${c.firstName} ${c.lastName}`).join(", "),
        f.due,
        f.paid,
        f.remaining,
      ]),
    ]);

  return (
    <>
      <PageHeader
        title={a.familiesTitle}
        subtitle={a.familiesSubtitle}
        actions={
          <button onClick={exportCsv} className={btn.ghost}>
            <Download className="h-4 w-4" /> {a.exportCsv}
          </button>
        }
      />

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input type="search" placeholder={a.search} value={q} onChange={(e) => setQ(e.target.value)} className={`${darkInput} ps-9`} />
      </div>
      <p className="mb-3 text-sm font-semibold text-white/55">{a.results(families.length)}</p>

      {families.length === 0 ? (
        <EmptyState>{a.noResults}</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {families.map(({ parent, children, due, paid, remaining }) => (
            <article key={parent.id} className="rounded-[1.5rem] border border-white/10 bg-deep/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold">{parent.fullName}</h2>
                  <p dir="ltr" className="truncate text-start text-xs text-white/50 rtl:text-end">
                    {parent.email}
                  </p>
                  <div className="mt-1">
                    <PhoneCell phone={parent.phone} />
                  </div>
                </div>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-white/60">{a.childrenCount(children.length)}</span>
              </div>

              {children.length === 0 ? (
                <p className="mt-4 text-sm text-white/40">{a.noChildren}</p>
              ) : (
                <ul className="mt-4 space-y-1.5">
                  {children.map((s) => (
                    <li key={s.id}>
                      <Link href={`/admin/eleves/${s.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-2 hover:bg-white/[0.07]">
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Avatar student={s} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold">
                              {s.firstName} {s.lastName}
                            </span>
                            <span className="block text-[11px] text-white/45">{t.labels.sections[s.section]}</span>
                          </span>
                        </span>
                        <PayBadge state={payStateOf(s)} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-white/45">{a.th.total}</p>
                  <p className="font-display font-extrabold">{money(due)}</p>
                </div>
                <div>
                  <p className="text-white/45">{a.th.paid}</p>
                  <p className="font-display font-extrabold text-emerald-300">{money(paid)}</p>
                </div>
                <div>
                  <p className="text-white/45">{a.th.remaining}</p>
                  <p className={`font-display font-extrabold ${remaining > 0 ? "text-amber-300" : "text-lime"}`}>{money(remaining)}</p>
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar value={due ? (paid / due) * 100 : 0} />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-white/40">{a.memberSince(date(parent.createdAt))}</span>
                {children.some((s) => s.status === "valide" && remainingOf(s) > 0) && (
                  <button
                    onClick={async () => {
                      for (const s of children.filter((c) => c.status === "valide" && remainingOf(c) > 0)) await sendReminder(s.id);
                      toast(a.familyReminded(parent.fullName));
                    }}
                    className={btn.amber}
                  >
                    <BellRing className="h-4 w-4" /> {a.remindFamily}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

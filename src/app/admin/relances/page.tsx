"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Send } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminShell";
import { EmptyState, PageHeader, Panel, PhoneCell, Th, btn, darkInput } from "@/components/admin/ui";
import { useSchool } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { remainingOf } from "@/lib/stats";

export default function RelancesPage() {
  const { students, notifications, sendReminder, sendAllReminders } = useSchool();
  const { t, money, date } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;
  const [q, setQ] = useState("");

  const debtors = students
    .filter((s) => s.status === "valide" && remainingOf(s) > 0)
    .sort((x, y) => remainingOf(y) - remainingOf(x));
  const query = q.trim().toLowerCase();
  const list = debtors.filter((s) => !query || `${s.firstName} ${s.lastName} ${s.parentName}`.toLowerCase().includes(query));
  const lastReminder = (id: string) => notifications.find((n) => n.studentId === id && n.kind === "reminder")?.date;
  const totalRemaining = debtors.reduce((acc, s) => acc + remainingOf(s), 0);

  return (
    <>
      <PageHeader
        title={a.remindersTitle}
        subtitle={a.remindersText}
        actions={
          debtors.length > 0 && (
            <button
              onClick={async () => {
                const n = await sendAllReminders();
                toast(a.remindersSent(n));
              }}
              className={btn.amber}
            >
              <Send className="h-4 w-4 rtl:-scale-x-100" /> {a.sendAll(debtors.length)}
            </button>
          )
        }
      />

      <Panel
        title={
          <span>
            {a.th.remaining} : <span className="text-amber-300">{money(totalRemaining)}</span>
          </span>
        }
        action={
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input type="search" placeholder={a.search} value={q} onChange={(e) => setQ(e.target.value)} className={`${darkInput} ps-9`} />
          </div>
        }
      >
        {debtors.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-lime">{a.allPaid}</p>
        ) : list.length === 0 ? (
          <EmptyState>{a.noResults}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/45">
                  <Th>{a.th.student}</Th>
                  <Th>{a.th.parent}</Th>
                  <Th>{a.th.total}</Th>
                  <Th>{a.th.paid}</Th>
                  <Th>{a.th.remaining}</Th>
                  <Th>{a.th.lastReminder}</Th>
                  <Th className="text-end">{a.th.action}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {list.map((s) => {
                  const last = lastReminder(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-white/[0.03]">
                      <td className="py-3 pe-3">
                        <Link href={`/admin/eleves/${s.id}`} className="font-bold hover:text-lime">
                          {s.firstName} {s.lastName}
                        </Link>
                        <span className="block text-[11px] text-white/45">{t.labels.sections[s.section]}</span>
                      </td>
                      <td className="py-3 pe-3">
                        <span className="block text-white/80">{s.parentName}</span>
                        <PhoneCell phone={s.parentPhone} />
                      </td>
                      <td className="py-3 pe-3 text-white/55">{money(s.totalDue)}</td>
                      <td className="py-3 pe-3 text-emerald-300">{money(s.totalPaid)}</td>
                      <td className="py-3 pe-3 font-display font-extrabold text-amber-300">{money(remainingOf(s))}</td>
                      <td className="py-3 pe-3 text-xs text-white/55">{last ? date(last) : a.never}</td>
                      <td className="py-3 text-end">
                        <button
                          onClick={async () => {
                            await sendReminder(s.id);
                            toast(a.reminderSent(s.parentName));
                          }}
                          className={btn.amber}
                        >
                          <Send className="h-3.5 w-3.5 rtl:-scale-x-100" /> {a.sendReminder}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

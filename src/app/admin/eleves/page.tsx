"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, ChevronRight, Download, Search } from "lucide-react";
import { Avatar, EmptyState, PageHeader, PayBadge, PhoneCell, ProgressBar, SelectField, StatusBadge, Th, btn, darkInput } from "@/components/admin/ui";
import { useSchool } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import type { StudentStatus } from "@/lib/db";
import { SECTION_IDS, ageFrom, type SectionId } from "@/lib/school";
import { downloadCSV, latestTerm, payStateOf, remainingOf, studentAverage, type PayState } from "@/lib/stats";

type SortKey = "name" | "remaining" | "average";

export default function ElevesPage() {
  return (
    <Suspense>
      <ElevesList />
    </Suspense>
  );
}

function ElevesList() {
  const router = useRouter();
  const params = useSearchParams();
  const { students, classes, grades } = useSchool();
  const { t, money } = useI18n();
  const a = t.admin;

  const [q, setQ] = useState("");
  const [section, setSection] = useState<SectionId | "">((params.get("cycle") as SectionId) ?? "");
  const [classId, setClassId] = useState(params.get("classe") ?? "");
  const [status, setStatus] = useState<StudentStatus | "">((params.get("statut") as StudentStatus) ?? "");
  const [pay, setPay] = useState<PayState | "">((params.get("paiement") as PayState) ?? "");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });

  const term = latestTerm(grades);
  const avgOf = (id: string) => studentAverage(grades, id, term);
  const className = (id?: string) => classes.find((c) => c.id === id)?.name ?? a.unassigned;

  const query = q.trim().toLowerCase();
  const list = students
    .filter((s) => !query || `${s.firstName} ${s.lastName} ${s.parentName}`.toLowerCase().includes(query))
    .filter((s) => !section || s.section === section)
    .filter((s) => !classId || (classId === "none" ? !s.classId : s.classId === classId))
    .filter((s) => !status || s.status === status)
    .filter((s) => !pay || payStateOf(s) === pay)
    .sort((x, y) => {
      if (sort.key === "remaining") return (remainingOf(x) - remainingOf(y)) * sort.dir;
      if (sort.key === "average") return ((avgOf(x.id) ?? -1) - (avgOf(y.id) ?? -1)) * sort.dir;
      return `${x.lastName} ${x.firstName}`.localeCompare(`${y.lastName} ${y.firstName}`) * sort.dir;
    });

  const toggleSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "name" ? 1 : -1 }));
  const sortable = (key: SortKey, label: string) => (
    <button onClick={() => toggleSort(key)} className={`inline-flex items-center gap-1 hover:text-white ${sort.key === key ? "text-lime" : ""}`}>
      {label}
      <ArrowDownUp className="h-3 w-3" />
    </button>
  );

  const exportCsv = () =>
    downloadCSV("eleves-iqra.csv", [
      [a.th.student, t.enroll.birthDate, t.enroll.gender, a.th.section, a.th.class, a.th.parent, a.th.phone, "E-mail", a.th.total, a.th.paid, a.th.remaining, a.th.average, a.th.status],
      ...list.map((s) => [
        `${s.firstName} ${s.lastName}`,
        s.birthDate,
        t.labels.gender[s.gender],
        t.labels.sections[s.section],
        className(s.classId),
        s.parentName,
        s.parentPhone,
        s.parentEmail,
        s.totalDue,
        s.totalPaid,
        remainingOf(s),
        avgOf(s.id)?.toFixed(2) ?? "",
        t.labels.status[s.status],
      ]),
    ]);

  return (
    <>
      <PageHeader
        title={a.studentsTitle}
        subtitle={a.studentsSubtitle}
        actions={
          <button onClick={exportCsv} className={btn.ghost}>
            <Download className="h-4 w-4" /> {a.exportCsv}
          </button>
        }
      />

      {/* Filtres */}
      <div className="mb-5 grid gap-3 rounded-[1.25rem] border border-white/10 bg-deep/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="relative block text-xs font-semibold text-white/55 sm:col-span-2 lg:col-span-1">
          <span className="invisible">{a.search}</span>
          <Search className="pointer-events-none absolute start-3 top-[2.05rem] h-4 w-4 text-white/40" />
          <input type="search" placeholder={a.search} value={q} onChange={(e) => setQ(e.target.value)} className={`${darkInput} mt-1 ps-9`} />
        </label>
        <SelectField
          label={a.filterSection}
          value={section}
          onChange={(e) => {
            setSection(e.target.value as SectionId | "");
            setClassId("");
          }}
        >
          <option value="">{a.all}</option>
          {SECTION_IDS.map((id) => (
            <option key={id} value={id}>
              {t.labels.sections[id]}
            </option>
          ))}
        </SelectField>
        <SelectField label={a.filterClass} value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">{a.all}</option>
          <option value="none">{a.unassigned}</option>
          {classes
            .filter((c) => !section || c.section === section)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </SelectField>
        <SelectField label={a.filterStatus} value={status} onChange={(e) => setStatus(e.target.value as StudentStatus | "")}>
          <option value="">{a.all}</option>
          {(["valide", "en_attente_paiement", "rejete"] as const).map((id) => (
            <option key={id} value={id}>
              {t.labels.status[id]}
            </option>
          ))}
        </SelectField>
        <SelectField label={a.filterPayment} value={pay} onChange={(e) => setPay(e.target.value as PayState | "")}>
          <option value="">{a.all}</option>
          {(["solde", "partiel", "impaye"] as const).map((id) => (
            <option key={id} value={id}>
              {a.payState[id]}
            </option>
          ))}
        </SelectField>
      </div>

      <p className="mb-3 text-sm font-semibold text-white/55">{a.results(list.length)}</p>

      {list.length === 0 ? (
        <EmptyState>{a.noResults}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-deep/60 p-4">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/45">
                <Th>{sortable("name", a.th.student)}</Th>
                <Th>{a.th.section}</Th>
                <Th>{a.th.class}</Th>
                <Th>{a.th.parent}</Th>
                <Th>{sortable("remaining", a.th.payment)}</Th>
                <Th>{sortable("average", `${a.th.average} (${t.labels.terms[term]})`)}</Th>
                <Th>{a.th.status}</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.map((s) => {
                const avg = avgOf(s.id);
                const pct = s.totalDue ? (s.totalPaid / s.totalDue) * 100 : 0;
                return (
                  <tr key={s.id} onClick={() => router.push(`/admin/eleves/${s.id}`)} className="cursor-pointer hover:bg-white/[0.04]">
                    <td className="py-3 pe-3">
                      <div className="flex items-center gap-3">
                        <Avatar student={s} size="sm" />
                        <div>
                          <Link href={`/admin/eleves/${s.id}`} onClick={(e) => e.stopPropagation()} className="font-bold hover:text-lime">
                            {s.firstName} {s.lastName}
                          </Link>
                          <span className="block text-[11px] text-white/45">
                            {t.labels.gender[s.gender]} · {a.age(ageFrom(s.birthDate))}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pe-3 text-lime-soft/85">{t.labels.sections[s.section]}</td>
                    <td className="py-3 pe-3 text-white/75">{s.classId ? className(s.classId) : <span className="text-amber-200/80">{a.unassigned}</span>}</td>
                    <td className="py-3 pe-3" onClick={(e) => e.stopPropagation()}>
                      <span className="block text-white/80">{s.parentName}</span>
                      <PhoneCell phone={s.parentPhone} />
                    </td>
                    <td className="w-44 py-3 pe-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <PayBadge state={payStateOf(s)} />
                        <span className="text-[11px] text-white/50">{remainingOf(s) > 0 ? money(remainingOf(s)) : ""}</span>
                      </div>
                      <ProgressBar value={pct} />
                    </td>
                    <td className="py-3 pe-3">
                      {avg === null ? (
                        <span className="text-white/30">—</span>
                      ) : (
                        <span dir="ltr" className={`font-display font-extrabold ${avg >= 10 ? "text-lime" : "text-rose-300"}`}>
                          {avg.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pe-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 text-end">
                      <ChevronRight className="inline h-4 w-4 text-white/30 rtl:rotate-180" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

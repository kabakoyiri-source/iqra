"use client";

import { useState } from "react";
import Link from "next/link";
import { CirclePlus, GraduationCap, TriangleAlert, UserRound } from "lucide-react";
import { ClassFormModal } from "@/components/admin/ClassFormModal";
import { EmptyState, PageHeader, ProgressBar, btn } from "@/components/admin/ui";
import { useSchool } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { SECTION_IDS, type SectionId } from "@/lib/school";
import { averageOf, latestTerm, payStateOf } from "@/lib/stats";

export default function ClassesPage() {
  const { classes, students, grades } = useSchool();
  const { t } = useI18n();
  const a = t.admin;
  const [creating, setCreating] = useState<SectionId | null>(null);

  const term = latestTerm(grades);
  const unassigned = students.filter((s) => s.status === "valide" && !s.classId).length;

  return (
    <>
      <PageHeader
        title={a.classesTitle}
        subtitle={a.classesSubtitle}
        actions={
          <button onClick={() => setCreating("primaire")} className={btn.lime}>
            <CirclePlus className="h-4 w-4" /> {a.newClass}
          </button>
        }
      />

      {unassigned > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <span className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" /> {a.unassignedHint(unassigned)}
          </span>
          <Link href="/admin/eleves?classe=none&statut=valide" className={btn.amber}>
            {a.assignNow}
          </Link>
        </div>
      )}

      <div className="space-y-10">
        {SECTION_IDS.map((section) => {
          const list = classes.filter((c) => c.section === section);
          return (
            <section key={section}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">
                  {t.labels.sections[section]} <span className="text-sm font-semibold text-white/40">({list.length})</span>
                </h2>
                <button onClick={() => setCreating(section)} className={btn.ghost}>
                  <CirclePlus className="h-4 w-4" /> {a.newClass}
                </button>
              </div>

              {list.length === 0 ? (
                <EmptyState>{a.noClasses}</EmptyState>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((c) => {
                    const members = students.filter((s) => s.classId === c.id);
                    const cap = c.capacity ?? 30;
                    const memberGrades = grades.filter((g) => g.term === term && members.some((m) => m.id === g.studentId));
                    const avg = memberGrades.length ? averageOf(memberGrades) : null;
                    const paidUp = members.filter((m) => payStateOf(m) === "solde").length;
                    return (
                      <Link
                        key={c.id}
                        href={`/admin/classes/${c.id}`}
                        className="group rounded-[1.5rem] border border-white/10 bg-deep/60 p-5 transition-colors hover:border-lime/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="arch flex h-14 w-12 shrink-0 items-end justify-center bg-brand-soft pb-2.5 text-white">
                            <GraduationCap className="h-5 w-5" />
                          </span>
                          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-white/60">{a.seats(members.length, cap)}</span>
                        </div>
                        <h3 className="mt-3 font-display text-lg font-bold group-hover:text-lime">{c.name}</h3>
                        <p className="flex items-center gap-1.5 text-xs text-white/50">
                          <UserRound className="h-3.5 w-3.5" /> {c.teacher || a.noTeacher}
                        </p>
                        <div className="mt-4">
                          <ProgressBar value={(members.length / cap) * 100} tone={members.length > cap ? "amber" : "lime"} />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl bg-white/[0.04] p-2.5">
                            <p className="text-white/45">{a.classAverage}</p>
                            <p dir="ltr" className="text-start font-display text-base font-extrabold text-lime rtl:text-end">
                              {avg === null ? "—" : avg.toFixed(2)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-white/[0.04] p-2.5">
                            <p className="text-white/45">{a.payState.solde}</p>
                            <p dir="ltr" className="text-start font-display text-base font-extrabold rtl:text-end">
                              {paidUp} / {members.length}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <ClassFormModal open={creating !== null} defaultSection={creating ?? "primaire"} onClose={() => setCreating(null)} />
    </>
  );
}

"use client";

import { useState } from "react";
import { GraduationCap, Printer } from "lucide-react";
import { LogoGlyph } from "@/components/Logo";
import type { ClassItem, GradeItem, Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { SCHOOL, TERM_IDS, type TermId } from "@/lib/school";
import type { Dict } from "@/lib/i18n";

export function averageOf(grades: GradeItem[]) {
  if (grades.length === 0) return 0;
  return grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 20, 0) / grades.length;
}

export function mentionFor(avg: number, t: Dict) {
  const m = t.labels.mentions;
  if (avg >= 16) return m.excellent;
  if (avg >= 14) return m.tresBien;
  if (avg >= 12) return m.bien;
  if (avg >= 10) return m.assezBien;
  return m.insuffisant;
}

/** Bulletin trimestriel imprimable, en-tête bilingue comme un document officiel */
export function Bulletin({ student, grades, classes }: { student: Student; grades: GradeItem[]; classes: ClassItem[] }) {
  const { t, date } = useI18n();
  const studentGrades = grades.filter((g) => g.studentId === student.id);
  const terms = TERM_IDS.filter((term) => studentGrades.some((g) => g.term === term));
  const [term, setTerm] = useState<TermId>(terms[terms.length - 1] ?? "t1");

  if (studentGrades.length === 0) {
    return (
      <div className="rounded-2xl bg-sand p-8 text-center">
        <GraduationCap className="mx-auto h-10 w-10 text-emerald/60" />
        <h4 className="mt-3 font-display text-base font-bold text-navy">{t.parent.noBulletinTitle}</h4>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-deep/60">{t.parent.noBulletinText}</p>
      </div>
    );
  }

  const termGrades = studentGrades.filter((g) => g.term === term);
  const avg = averageOf(termGrades);
  const cls = classes.find((c) => c.id === student.classId);

  return (
    <div>
      {terms.length > 1 && (
        <div className="no-print mb-4 flex flex-wrap gap-2">
          {terms.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTerm(id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                term === id ? "bg-navy text-white" : "bg-sand text-deep/60 hover:bg-mint"
              }`}
            >
              {t.labels.terms[id]}
            </button>
          ))}
        </div>
      )}

      <article className="print-area overflow-hidden rounded-2xl border border-black/10 bg-white">
        {/* En-tête bilingue */}
        <header className="relative overflow-hidden bg-brand px-6 py-5 text-white">
          <div className="pattern-islamic absolute inset-0 opacity-[0.08]" />
          <div className="relative flex items-center justify-between gap-4" dir="ltr">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                <LogoGlyph className="h-7 w-auto" />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold leading-tight">Complexe Scolaire IQRA</p>
                <p className="text-xs text-white/70">{SCHOOL.year}</p>
              </div>
            </div>
            <p dir="rtl" lang="ar" className="text-end font-display text-lg font-bold leading-tight">
              مجمع اقرأ المدرسي
              <span className="block text-xs font-normal text-white/70">{t.labels.terms[term]}</span>
            </p>
          </div>
        </header>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-deep/50">{t.parent.bulletinTitle} — {t.labels.terms[term]}</p>
              <p className="font-display text-xl font-extrabold text-navy">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-xs text-deep/60">
                {t.labels.sections[student.section]}
                {cls ? ` · ${cls.name}` : ""} · {t.parent.bornOn(date(student.birthDate))}
              </p>
            </div>
            <div className="rounded-2xl bg-mint px-4 py-2.5 text-center">
              <p className="text-[0.7rem] font-semibold text-emerald">{t.parent.average}</p>
              <p className="font-display text-2xl font-extrabold text-navy">
                <span dir="ltr">{avg.toFixed(2)} / 20</span>
              </p>
              <p className="text-xs font-bold text-emerald">{mentionFor(avg, t)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs text-deep/50">
                  <th className="pb-2 text-start font-semibold">{t.parent.subject}</th>
                  <th className="pb-2 text-start font-semibold">{t.parent.score}</th>
                  <th className="pb-2 text-start font-semibold">{t.parent.remarks}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {termGrades.map((g) => (
                  <tr key={g.id}>
                    <td className="py-3 pe-4 font-semibold text-navy">{t.labels.subjects[g.subject]}</td>
                    <td className="py-3 pe-4">
                      <span
                        dir="ltr"
                        className={`inline-block rounded-lg px-2 py-0.5 font-display font-extrabold ${
                          (g.score / g.maxScore) * 20 >= 10 ? "bg-mint text-emerald" : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {g.score} / {g.maxScore}
                      </span>
                    </td>
                    <td className="py-3 text-deep/65">{g.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-dashed border-black/10 pt-5">
            <p className="font-quran text-lg text-emerald" dir="rtl" lang="ar">
              وَقُل رَّبِّ زِدْنِي عِلْمًا
            </p>
            <div className="text-center">
              <div className="h-10 w-40 border-b border-deep/30" />
              <p className="mt-1 text-xs text-deep/50">{t.parent.signature}</p>
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
          {t.parent.printBulletin}
        </button>
      </div>
    </div>
  );
}

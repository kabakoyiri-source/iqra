import type { GradeItem } from "./db";
import { TERM_IDS, type TermId } from "./school";
import type { Dict } from "./i18n";

export type PayState = "solde" | "partiel" | "impaye";

export function remainingOf(s: { totalDue: number; totalPaid: number }) {
  return Math.max(0, s.totalDue - s.totalPaid);
}

export function payStateOf(s: { totalDue: number; totalPaid: number }): PayState {
  if (remainingOf(s) === 0) return "solde";
  return s.totalPaid > 0 ? "partiel" : "impaye";
}

/** Moyenne sur 20 d'une liste de notes */
export function averageOf(grades: GradeItem[]) {
  if (grades.length === 0) return 0;
  return grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 20, 0) / grades.length;
}

/** Moyenne d'un élève pour un trimestre, ou null s'il n'a aucune note */
export function studentAverage(grades: GradeItem[], studentId: string, term: TermId) {
  const own = grades.filter((g) => g.studentId === studentId && g.term === term);
  return own.length ? averageOf(own) : null;
}

/** Dernier trimestre pour lequel des notes existent */
export function latestTerm(grades: GradeItem[]): TermId {
  return [...TERM_IDS].reverse().find((t) => grades.some((g) => g.term === t)) ?? "t1";
}

/** Classement d'un groupe d'élèves (les ex-aequo partagent le même rang) */
export function ranking(studentIds: string[], grades: GradeItem[], term: TermId) {
  const rows = studentIds
    .map((id) => ({ id, avg: studentAverage(grades, id, term) }))
    .filter((r): r is { id: string; avg: number } => r.avg !== null)
    .sort((a, b) => b.avg - a.avg);
  const result = new Map<string, { avg: number; rank: number }>();
  rows.forEach((r, i) => {
    const rank = i > 0 && Math.abs(rows[i - 1].avg - r.avg) < 1e-9 ? result.get(rows[i - 1].id)!.rank : i + 1;
    result.set(r.id, { avg: r.avg, rank });
  });
  return { result, ranked: rows.length };
}

export function mentionFor(avg: number, t: Dict) {
  const m = t.labels.mentions;
  if (avg >= 16) return m.excellent;
  if (avg >= 14) return m.tresBien;
  if (avg >= 12) return m.bien;
  if (avg >= 10) return m.assezBien;
  return m.insuffisant;
}

/** Télécharge un tableau en CSV (séparateur « ; » et BOM pour Excel) */
export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

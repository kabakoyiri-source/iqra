"use client";

import { BellRing, CircleCheck, FileCheck, GraduationCap, Sparkles, type LucideIcon } from "lucide-react";
import type { NotificationItem, Student } from "@/context/SchoolContext";
import type { NotificationKind } from "@/lib/db";
import type { Dict } from "@/lib/i18n";

export const NOTIF_STYLE: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  welcome: { icon: Sparkles, tone: "bg-sky text-ocean" },
  enrollment_received: { icon: FileCheck, tone: "bg-mint text-emerald" },
  payment_confirmed: { icon: CircleCheck, tone: "bg-emerald/15 text-emerald" },
  reminder: { icon: BellRing, tone: "bg-amber-100 text-amber-700" },
  grade_published: { icon: GraduationCap, tone: "bg-navy/10 text-navy" },
};

/** Construit le titre et le message d'une notification dans la langue active */
export function notificationText(
  n: NotificationItem,
  ctx: { t: Dict; money: (n: number) => string; parentName: string; students: Student[] }
) {
  const { t, money, parentName, students } = ctx;
  const st = students.find((s) => s.id === n.studentId);
  const studentName = st ? `${st.firstName} ${st.lastName}` : t.common.student;

  switch (n.kind) {
    case "welcome":
      return { title: t.notif.welcome.title, body: t.notif.welcome.body(parentName) };
    case "enrollment_received":
      return { title: t.notif.enrollment_received.title, body: t.notif.enrollment_received.body(studentName) };
    case "payment_confirmed":
      return {
        title: t.notif.payment_confirmed.title,
        body: t.notif.payment_confirmed.body(money(n.amount ?? 0), studentName, n.receiptNumber ?? "—"),
      };
    case "reminder":
      return { title: t.notif.reminder.title, body: t.notif.reminder.body(money(n.amount ?? 0), studentName) };
    case "grade_published":
      return {
        title: t.notif.grade_published.title,
        body: t.notif.grade_published.body(n.subject ? t.labels.subjects[n.subject] : "—", studentName),
      };
  }
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BellRing,
  CircleCheck,
  FileText,
  GraduationCap,
  HeartPulse,
  Pencil,
  Phone,
  Printer,
  Trash2,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminShell";
import { DocumentsList } from "@/components/admin/DocumentsList";
import { PaymentModal } from "@/components/admin/PaymentModal";
import { StudentEditModal } from "@/components/admin/StudentEditModal";
import { Avatar, EmptyState, PageHeader, Panel, PayBadge, PhoneCell, ProgressBar, StatusBadge, Th, btn, darkInput } from "@/components/admin/ui";
import { Bulletin } from "@/components/dashboard/Bulletin";
import { NOTIF_STYLE, notificationText } from "@/components/dashboard/notifications";
import { ReceiptModal } from "@/components/dashboard/ReceiptDoc";
import { LogoMark } from "@/components/Logo";
import { Modal } from "@/components/ui";
import { useSchool, type Payment, type Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import type { StudentStatus } from "@/lib/db";
import { SUBJECTS_BY_SECTION, TERM_IDS, ageFrom, telLink, type SubjectId, type TermId } from "@/lib/school";
import { latestTerm, mentionFor, payStateOf, ranking, remainingOf, studentAverage } from "@/lib/stats";

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const school = useSchool();
  const { students, payments, grades, classes, notifications, assignClass, setStudentStatus, deleteStudent, sendReminder } = school;
  const { t, money, date } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;
  const p = a.profile;

  const [payFor, setPayFor] = useState<Student | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [showBulletin, setShowBulletin] = useState(false);
  const [term, setTerm] = useState<TermId>(latestTerm(grades));

  const student = students.find((s) => s.id === id);
  if (!student) {
    return (
      <>
        <PageHeader title={p.notFound} back={{ href: "/admin/eleves", label: p.back }} />
        <EmptyState>{p.notFound}</EmptyState>
      </>
    );
  }

  const name = `${student.firstName} ${student.lastName}`;
  const cls = classes.find((c) => c.id === student.classId);
  const myPayments = payments.filter((x) => x.studentId === student.id);
  const myNotifs = notifications.filter((n) => n.studentId === student.id);
  const siblings = students.filter((s) => s.parentId === student.parentId && s.id !== student.id);
  const remaining = remainingOf(student);
  const pct = student.totalDue ? Math.round((student.totalPaid / student.totalDue) * 100) : 0;

  // Notes et classement du trimestre sélectionné
  const termGrades = grades.filter((g) => g.studentId === student.id && g.term === term);
  const subjects = [...new Set<SubjectId>([...SUBJECTS_BY_SECTION[student.section], ...termGrades.map((g) => g.subject)])];
  const avg = studentAverage(grades, student.id, term);
  const classmates = cls ? students.filter((s) => s.classId === cls.id).map((s) => s.id) : [];
  const { result: ranks, ranked } = ranking(classmates, grades, term);
  const myRank = ranks.get(student.id);

  const changeStatus = async (status: StudentStatus) => {
    await setStudentStatus(student.id, status);
    toast(p.statusUpdated);
  };

  const onDelete = async () => {
    if (!window.confirm(p.deleteConfirm(name))) return;
    await deleteStudent(student.id);
    toast(p.deleted(name));
    router.push("/admin/eleves");
  };

  const info: [string, React.ReactNode][] = [
    [p.birthDate, date(student.birthDate)],
    [p.age, a.age(ageFrom(student.birthDate))],
    [p.gender, t.labels.gender[student.gender]],
    [p.section, t.labels.sections[student.section]],
    [p.teacher, cls?.teacher || "—"],
  ];

  return (
    <>
      <PageHeader title={name} back={{ href: "/admin/eleves", label: p.back }} />

      {/* En-tête de la fiche */}
      <section className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-brand p-5 shadow-xl sm:p-6">
        <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
          <Avatar student={student} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={student.status} />
              <PayBadge state={payStateOf(student)} />
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold">{name}</p>
            <p className="text-sm text-white/75">
              {t.labels.sections[student.section]} ·{" "}
              {cls ? (
                <Link href={`/admin/classes/${cls.id}`} className="font-semibold underline-offset-4 hover:underline">
                  <bdi>{cls.name}</bdi>
                </Link>
              ) : (
                a.unassigned
              )}{" "}
              · {a.age(ageFrom(student.birthDate))}
            </p>
            <p className="mt-0.5 text-xs text-white/55">{p.enrolledOn(date(student.createdAt))}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {remaining > 0 && (
              <button onClick={() => setPayFor(student)} className={btn.lime}>
                <Wallet className="h-4 w-4" /> {p.collect}
              </button>
            )}
            {remaining > 0 && student.status === "valide" && (
              <button
                onClick={async () => {
                  await sendReminder(student.id);
                  toast(a.reminderSent(student.parentName));
                }}
                className={btn.amber}
              >
                <BellRing className="h-4 w-4" /> {p.remind}
              </button>
            )}
            <button onClick={() => setEditing(student)} className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-bold text-white hover:bg-white/25">
              <Pencil className="h-4 w-4" /> {a.edit}
            </button>
            <button onClick={onDelete} title={a.delete} aria-label={a.delete} className="rounded-xl bg-night/30 p-2.5 text-rose-200 hover:bg-rose-500/30">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-white/15 pt-4 text-xs">
          <span className="font-semibold text-white/70">{p.statusLabel} :</span>
          {(
            [
              ["valide", p.setValid],
              ["en_attente_paiement", p.setPending],
              ["rejete", p.setRejected],
            ] as const
          ).map(([status, label]) => (
            <button
              key={status}
              onClick={() => changeStatus(status)}
              disabled={student.status === status}
              className={`rounded-full px-3 py-1 font-bold transition-colors ${
                student.status === status ? "bg-white text-navy" : "bg-night/25 text-white/80 hover:bg-night/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Finances */}
          <Panel title={p.finances} icon={<Wallet className="h-5 w-5 text-lime" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  [p.totalDue, student.totalDue, "text-white"],
                  [p.paid, student.totalPaid, "text-emerald-300"],
                  [p.remaining, remaining, remaining > 0 ? "text-amber-300" : "text-lime"],
                ] as const
              ).map(([label, value, tone]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-white/50">{label}</p>
                  <p className={`font-display text-lg font-extrabold ${tone}`}>{money(value)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <ProgressBar value={pct} />
              <span dir="ltr" className="shrink-0 text-xs font-bold text-white/60">{pct} %</span>
            </div>

            <h3 className="mb-2 mt-6 text-sm font-bold text-white/75">{p.receipts}</h3>
            {myPayments.length === 0 ? (
              <EmptyState>{p.noReceipts}</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-white/45">
                      <Th>{a.th.receipt}</Th>
                      <Th>{a.th.date}</Th>
                      <Th>{a.th.type}</Th>
                      <Th>{a.th.method}</Th>
                      <Th className="text-end">{a.th.amount}</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myPayments.map((x) => (
                      <tr key={x.id}>
                        <td className="py-2.5 pe-3 font-mono text-xs font-bold text-lime">
                          <span dir="ltr">{x.receiptNumber}</span>
                        </td>
                        <td className="py-2.5 pe-3 text-white/70">{date(x.date)}</td>
                        <td className="py-2.5 pe-3">{t.labels.paymentTypes[x.type]}</td>
                        <td className="py-2.5 pe-3 text-white/60">{t.labels.methods[x.method]}</td>
                        <td className="py-2.5 pe-3 text-end font-display font-extrabold text-emerald-300">{money(x.amount)}</td>
                        <td className="py-2.5 text-end">
                          <button onClick={() => setReceipt(x)} aria-label={t.receipt.print} title={t.receipt.print} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                            <Printer className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Notes */}
          <Panel
            title={p.grades}
            icon={<GraduationCap className="h-5 w-5 text-lime" />}
            action={
              <button onClick={() => setShowBulletin(true)} className={btn.ghost}>
                <Printer className="h-4 w-4" /> {p.openBulletin}
              </button>
            }
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {TERM_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => setTerm(id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${term === id ? "bg-lime text-night" : "bg-white/5 text-white/60 hover:text-white"}`}
                >
                  {t.labels.terms[id]}
                </button>
              ))}
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-white/50">{p.average}</p>
                <p dir="ltr" className="text-start font-display text-lg font-extrabold text-lime rtl:text-end">
                  {avg === null ? "—" : `${avg.toFixed(2)} / 20`}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-white/50">{a.th.mention}</p>
                <p className="font-display text-lg font-extrabold">{avg === null ? "—" : mentionFor(avg, t)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-white/50">{p.rank}</p>
                <p className="font-display text-lg font-extrabold">{myRank ? p.rankValue(myRank.rank, ranked) : "—"}</p>
              </div>
            </div>

            <GradeTable student={student} term={term} subjects={subjects} />
          </Panel>

          {/* Historique */}
          <Panel title={p.history} icon={<BellRing className="h-5 w-5 text-lime" />}>
            {myNotifs.length === 0 ? (
              <EmptyState>{p.noHistory}</EmptyState>
            ) : (
              <ul className="space-y-2">
                {myNotifs.map((n) => {
                  const { icon: Icon } = NOTIF_STYLE[n.kind];
                  const text = notificationText(n, { t, money, parentName: student.parentName, students });
                  return (
                    <li key={n.id} className="flex gap-3 rounded-xl bg-white/[0.03] p-3 text-sm">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                      <div className="min-w-0">
                        <p className="font-bold">
                          {text.title} <span className="text-[11px] font-normal text-white/40">· {date(n.date)}</span>
                        </p>
                        <p className="text-white/60">{text.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          {/* Identité */}
          <Panel title={p.identity} icon={<FileText className="h-5 w-5 text-lime" />}>
            <dl className="space-y-3 text-sm">
              {info.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <dt className="text-white/50">{label}</dt>
                  <dd className="text-end font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <label className="mt-4 block text-xs font-semibold text-white/55">
              {p.class}
              <select
                value={student.classId ?? ""}
                onChange={async (e) => {
                  await assignClass(student.id, e.target.value || undefined);
                  toast(p.updated);
                }}
                className={`${darkInput} mt-1`}
              >
                <option value="">{a.unassigned}</option>
                {classes
                  .filter((c) => c.section === student.section)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3 text-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-200/80">
                <HeartPulse className="h-4 w-4" /> {p.health}
              </p>
              <p className="mt-1 text-white/80">{student.healthNotes || "—"}</p>
            </div>
          </Panel>

          {/* Famille */}
          <Panel title={p.family} icon={<UsersRound className="h-5 w-5 text-lime" />}>
            <p className="font-display text-lg font-bold">{student.parentName}</p>
            <p dir="ltr" className="text-start text-sm text-white/55 rtl:text-end">
              {student.parentEmail}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <PhoneCell phone={student.parentPhone} />
              <a href={telLink(student.parentPhone)} className={btn.ghost}>
                <Phone className="h-4 w-4" /> {p.call}
              </a>
            </div>
            {siblings.length > 0 && (
              <>
                <h3 className="mb-2 mt-5 text-xs font-bold text-white/55">{p.siblings}</h3>
                <ul className="space-y-1.5">
                  {siblings.map((s) => (
                    <li key={s.id}>
                      <Link href={`/admin/eleves/${s.id}`} className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-white/[0.05]">
                        <Avatar student={s} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">
                            {s.firstName} {s.lastName}
                          </span>
                          <span className="block text-[11px] text-white/45">{t.labels.sections[s.section]}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          {/* Documents */}
          <Panel title={p.documents} icon={<CircleCheck className="h-5 w-5 text-lime" />}>
            <DocumentsList student={student} />
          </Panel>
        </div>
      </div>

      <PaymentModal student={payFor} onClose={() => setPayFor(null)} />
      <StudentEditModal student={editing} onClose={() => setEditing(null)} />
      <ReceiptModal payment={receipt} students={students} payments={payments} onClose={() => setReceipt(null)} />
      <Modal open={showBulletin} onClose={() => setShowBulletin(false)} title={t.parent.bulletinTitle} subtitle={name} size="lg" icon={<LogoMark className="h-10 w-10" />}>
        <Bulletin student={student} grades={grades} classes={classes} />
      </Modal>
    </>
  );
}

/** Notes du trimestre, modifiables ligne par ligne */
function GradeTable({ student, term, subjects }: { student: Student; term: TermId; subjects: SubjectId[] }) {
  const { grades, addGrade, deleteGrade } = useSchool();
  const { t } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;
  const termGrades = grades.filter((g) => g.studentId === student.id && g.term === term);

  const [subject, setSubject] = useState<SubjectId>(subjects[0]);
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("20");
  const [remarks, setRemarks] = useState("");

  const pick = (s: SubjectId) => {
    const g = termGrades.find((x) => x.subject === s);
    setSubject(s);
    setScore(g ? String(g.score) : "");
    setMaxScore(g ? String(g.maxScore) : "20");
    setRemarks(g?.remarks ?? "");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(score);
    const max = Number(maxScore) || 20;
    if (score === "" || !Number.isFinite(value)) return;
    await addGrade({ studentId: student.id, subject, term, score: Math.min(value, max), maxScore: max, remarks: remarks.trim() || undefined });
    toast(a.profile.gradeSaved);
    setScore("");
    setRemarks("");
  };

  return (
    <>
      {termGrades.length === 0 && <p className="mb-3 text-sm text-white/45">{a.profile.noGrades}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-white/45">
              <Th>{a.subject}</Th>
              <Th>{a.score}</Th>
              <Th>{a.remarks}</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {subjects.map((s) => {
              const g = termGrades.find((x) => x.subject === s);
              return (
                <tr key={s} className={subject === s ? "bg-white/[0.04]" : ""}>
                  <td className="py-2.5 pe-3">
                    <button onClick={() => pick(s)} className="font-semibold hover:text-lime">
                      {t.labels.subjects[s]}
                    </button>
                  </td>
                  <td className="py-2.5 pe-3">
                    {g ? (
                      <span dir="ltr" className={`font-display font-extrabold ${(g.score / g.maxScore) * 20 >= 10 ? "text-lime" : "text-rose-300"}`}>
                        {g.score} / {g.maxScore}
                      </span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pe-3 text-xs text-white/55">{g?.remarks || ""}</td>
                  <td className="py-2.5 text-end">
                    {g && (
                      <span className="inline-flex gap-1">
                        <button onClick={() => pick(s)} aria-label={a.edit} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            await deleteGrade(g.id);
                            toast(a.profile.gradeDeleted);
                          }}
                          aria-label={a.delete}
                          className="rounded-lg p-1.5 text-white/40 hover:bg-rose-500/20 hover:text-rose-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[1.4fr_0.6fr_0.6fr_2fr_auto] sm:items-end">
        <p className="text-xs font-bold text-white/60 sm:col-span-5">
          {a.profile.gradeEntry} — {t.labels.terms[term]}
        </p>
        <label className="block text-[11px] text-white/50">
          {a.subject}
          <select value={subject} onChange={(e) => pick(e.target.value as SubjectId)} className={`${darkInput} mt-1 py-2`}>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {t.labels.subjects[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] text-white/50">
          {a.score}
          <input type="number" step="0.25" min="0" required dir="ltr" value={score} onChange={(e) => setScore(e.target.value)} className={`${darkInput} mt-1 py-2 font-bold text-lime`} />
        </label>
        <label className="block text-[11px] text-white/50">
          {a.maxScore}
          <input type="number" min="1" dir="ltr" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} className={`${darkInput} mt-1 py-2`} />
        </label>
        <label className="block text-[11px] text-white/50">
          {a.remarks}
          <input placeholder={a.remarksPh} value={remarks} onChange={(e) => setRemarks(e.target.value)} className={`${darkInput} mt-1 py-2`} />
        </label>
        <button type="submit" className={btn.green}>
          {a.save}
        </button>
      </form>
    </>
  );
}

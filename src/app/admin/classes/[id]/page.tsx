"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CirclePlus, GraduationCap, Medal, Pencil, Printer, Save, Trash2, UserMinus, UserRound, Users } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminShell";
import { ClassFormModal } from "@/components/admin/ClassFormModal";
import { Avatar, EmptyState, PageHeader, Panel, PayBadge, PhoneCell, StatCard, Th, btn, darkInput } from "@/components/admin/ui";
import { LogoGlyph } from "@/components/Logo";
import { useSchool, type ClassItem, type Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { SCHOOL, SUBJECTS_BY_SECTION, TERM_IDS, ageFrom, type SubjectId, type TermId } from "@/lib/school";
import { averageOf, latestTerm, mentionFor, payStateOf, ranking, remainingOf } from "@/lib/stats";

type Tab = "roster" | "grades" | "ranking";

export default function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { classes, students, grades, assignClass, deleteClass } = useSchool();
  const { t, money, date } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;
  const c = a.classPage;

  const [tab, setTab] = useState<Tab>("roster");
  const [term, setTerm] = useState<TermId>(latestTerm(grades));
  const [editing, setEditing] = useState(false);

  const cls = classes.find((x) => x.id === id);
  if (!cls) {
    return (
      <>
        <PageHeader title={c.notFound} back={{ href: "/admin/classes", label: c.back }} />
        <EmptyState>{c.notFound}</EmptyState>
      </>
    );
  }

  const members = students
    .filter((s) => s.classId === cls.id)
    .sort((x, y) => `${x.lastName} ${x.firstName}`.localeCompare(`${y.lastName} ${y.firstName}`));
  const candidates = students.filter((s) => s.section === cls.section && !s.classId && s.status !== "rejete");
  const cap = cls.capacity ?? 30;
  const memberIds = members.map((m) => m.id);
  const { result: ranks, ranked } = ranking(memberIds, grades, term);
  const termGrades = grades.filter((g) => g.term === term && memberIds.includes(g.studentId));
  const classAvg = termGrades.length ? averageOf(termGrades) : null;
  const girls = members.filter((m) => m.gender === "F").length;
  const paidUp = members.filter((m) => payStateOf(m) === "solde").length;

  const onDelete = async () => {
    if (!window.confirm(c.deleteConfirm(cls.name))) return;
    await deleteClass(cls.id);
    toast(c.deleted(cls.name));
    router.push("/admin/classes");
  };

  const termTabs = (
    <div className="flex flex-wrap gap-2">
      {TERM_IDS.map((tid) => (
        <button
          key={tid}
          onClick={() => setTerm(tid)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${term === tid ? "bg-lime text-night" : "bg-white/5 text-white/60 hover:text-white"}`}
        >
          {t.labels.terms[tid]}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title={cls.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{t.labels.sections[cls.section]}</span>
            <span className="inline-flex items-center gap-1">
              <UserRound className="h-3.5 w-3.5" /> {cls.teacher || a.noTeacher}
            </span>
            <span>{cls.academicYear}</span>
          </span>
        }
        back={{ href: "/admin/classes", label: c.back }}
        actions={
          <>
            <button onClick={() => window.print()} className={btn.ghost}>
              <Printer className="h-4 w-4" /> {a.printList}
            </button>
            <button onClick={() => setEditing(true)} className={btn.ghost}>
              <Pencil className="h-4 w-4" /> {a.edit}
            </button>
            <button onClick={onDelete} className={btn.danger}>
              <Trash2 className="h-4 w-4" /> {a.delete}
            </button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={c.tabRoster} value={a.seats(members.length, cap)} icon={<Users />} />
        <StatCard
          label={`${a.classAverage} · ${t.labels.terms[term]}`}
          value={<span dir="ltr">{classAvg === null ? "—" : `${classAvg.toFixed(2)} / 20`}</span>}
          icon={<GraduationCap />}
          tone="emerald"
        />
        <StatCard label={a.payState.solde} value={<span dir="ltr">{`${paidUp} / ${members.length}`}</span>} icon={<Medal />} tone="amber" />
        <StatCard label={`${t.labels.gender.F} / ${t.labels.gender.M}`} value={<span dir="ltr">{`${girls} / ${members.length - girls}`}</span>} icon={<UserRound />} />
      </div>

      <div className="mb-5 flex flex-wrap gap-2 border-b border-white/10">
        {(
          [
            ["roster", c.tabRoster],
            ["grades", c.tabGrades],
            ["ranking", c.tabRanking],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-t-xl border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === key ? "border-lime bg-lime/10 text-lime" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "roster" && (
        <div className="grid gap-6 xl:grid-cols-3">
          <Panel className="xl:col-span-2" title={`${c.tabRoster} (${members.length})`} action={termTabs}>
            {members.length === 0 ? (
              <EmptyState>{c.emptyRoster}</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-white/45">
                      <Th>#</Th>
                      <Th>{a.th.student}</Th>
                      <Th>{a.th.parent}</Th>
                      <Th>{a.th.payment}</Th>
                      <Th>{a.th.average}</Th>
                      <Th>{a.th.rank}</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((s, i) => {
                      const r = ranks.get(s.id);
                      return (
                        <tr key={s.id} className="hover:bg-white/[0.03]">
                          <td className="py-2.5 pe-3 text-white/40">{i + 1}</td>
                          <td className="py-2.5 pe-3">
                            <Link href={`/admin/eleves/${s.id}`} className="flex items-center gap-2.5 hover:text-lime">
                              <Avatar student={s} size="sm" />
                              <span>
                                <span className="block font-bold">
                                  {s.firstName} {s.lastName}
                                </span>
                                <span className="block text-[11px] text-white/45">
                                  {t.labels.gender[s.gender]} · {a.age(ageFrom(s.birthDate))}
                                </span>
                              </span>
                            </Link>
                          </td>
                          <td className="py-2.5 pe-3">
                            <span className="block text-white/80">{s.parentName}</span>
                            <PhoneCell phone={s.parentPhone} />
                          </td>
                          <td className="py-2.5 pe-3">
                            <PayBadge state={payStateOf(s)} />
                            {remainingOf(s) > 0 && <span className="block text-[11px] text-white/45">{money(remainingOf(s))}</span>}
                          </td>
                          <td className="py-2.5 pe-3">
                            {r ? <span dir="ltr" className={`font-display font-extrabold ${r.avg >= 10 ? "text-lime" : "text-rose-300"}`}>{r.avg.toFixed(2)}</span> : <span className="text-white/30">—</span>}
                          </td>
                          <td className="py-2.5 pe-3 font-bold">{r ? a.profile.rankValue(r.rank, ranked) : "—"}</td>
                          <td className="py-2.5 text-end">
                            <button
                              onClick={async () => {
                                await assignClass(s.id, undefined);
                                toast(c.removed(`${s.firstName} ${s.lastName}`));
                              }}
                              title={c.remove}
                              aria-label={c.remove}
                              className="rounded-lg p-1.5 text-white/40 hover:bg-rose-500/20 hover:text-rose-200"
                            >
                              <UserMinus className="h-4 w-4" />
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

          <Panel title={c.addStudents} icon={<CirclePlus className="h-5 w-5 text-lime" />}>
            {candidates.length === 0 ? (
              <p className="text-sm text-white/45">{c.noCandidates}</p>
            ) : (
              <ul className="space-y-2">
                {candidates.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.03] p-2">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Avatar student={s} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="block text-[11px] text-white/45">{t.labels.status[s.status]}</span>
                      </span>
                    </span>
                    <button
                      onClick={async () => {
                        await assignClass(s.id, cls.id);
                        toast(c.added(`${s.firstName} ${s.lastName}`));
                      }}
                      className={btn.lime}
                    >
                      {c.add}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      {tab === "grades" && (
        <Panel title={c.tabGrades} text={c.gradesHint} action={termTabs}>
          {members.length === 0 ? <EmptyState>{c.emptyRoster}</EmptyState> : <BulkGrades cls={cls} members={members} term={term} />}
        </Panel>
      )}

      {tab === "ranking" && (
        <Panel title={`${c.tabRanking} · ${t.labels.terms[term]}`} text={c.rankingHint} action={termTabs}>
          {ranked === 0 ? (
            <EmptyState>{c.noRanking}</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/45">
                    <Th>{a.th.rank}</Th>
                    <Th>{a.th.student}</Th>
                    <Th>{a.th.average}</Th>
                    <Th>{a.th.mention}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members
                    .filter((m) => ranks.has(m.id))
                    .sort((x, y) => ranks.get(x.id)!.rank - ranks.get(y.id)!.rank)
                    .map((s) => {
                      const r = ranks.get(s.id)!;
                      const medal = ["bg-lime text-night", "bg-white/80 text-night", "bg-amber-400 text-night"][r.rank - 1];
                      return (
                        <tr key={s.id} className="hover:bg-white/[0.03]">
                          <td className="py-2.5 pe-3">
                            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-extrabold ${medal ?? "bg-white/5 text-white/70"}`}>
                              {r.rank}
                            </span>
                          </td>
                          <td className="py-2.5 pe-3">
                            <Link href={`/admin/eleves/${s.id}`} className="flex items-center gap-2.5 font-bold hover:text-lime">
                              <Avatar student={s} size="sm" />
                              {s.firstName} {s.lastName}
                            </Link>
                          </td>
                          <td className="py-2.5 pe-3">
                            <span dir="ltr">
                              <span className={`font-display text-base font-extrabold ${r.avg >= 10 ? "text-lime" : "text-rose-300"}`}>{r.avg.toFixed(2)}</span>
                              <span className="text-white/40"> / 20</span>
                            </span>
                          </td>
                          <td className="py-2.5 pe-3 font-semibold">{mentionFor(r.avg, t)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {/* Liste de classe imprimable */}
      <div className="print-sheet hidden bg-white p-8 text-deep print:block">
        <div className="flex items-center justify-between border-b-2 border-navy pb-4" dir="ltr">
          <div className="flex items-center gap-3">
            <LogoGlyph className="h-10 w-auto" />
            <div>
              <p className="font-display text-lg font-extrabold">Complexe Scolaire IQRA</p>
              <p className="text-xs">{SCHOOL.year}</p>
            </div>
          </div>
          <p dir="rtl" className="font-display text-lg font-bold">
            مجمع اقرأ المدرسي
          </p>
        </div>
        <h2 className="mt-5 font-display text-xl font-extrabold">{c.listTitle(cls.name)}</h2>
        <p className="text-sm">
          {t.labels.sections[cls.section]} · {cls.teacher || a.noTeacher} · {a.studentsCount(members.length)}
        </p>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr>
              {["#", a.th.student, t.enroll.birthDate, t.enroll.gender, a.th.parent, a.th.phone].map((h) => (
                <th key={h} className="border border-deep/30 px-2 py-1.5 text-start">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((s, i) => (
              <tr key={s.id}>
                <td className="border border-deep/30 px-2 py-1.5">{i + 1}</td>
                <td className="border border-deep/30 px-2 py-1.5 font-semibold">
                  {s.lastName.toUpperCase()} {s.firstName}
                </td>
                <td className="border border-deep/30 px-2 py-1.5">{date(s.birthDate)}</td>
                <td className="border border-deep/30 px-2 py-1.5">{t.labels.gender[s.gender]}</td>
                <td className="border border-deep/30 px-2 py-1.5">{s.parentName}</td>
                <td className="border border-deep/30 px-2 py-1.5" dir="ltr">
                  {s.parentPhone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClassFormModal open={editing} cls={cls} onClose={() => setEditing(false)} />
    </>
  );
}

/** Saisie des notes de toute la classe pour une matière et un trimestre */
function BulkGrades({ cls, members, term }: { cls: ClassItem; members: Student[]; term: TermId }) {
  const subjects = SUBJECTS_BY_SECTION[cls.section];
  const [subject, setSubject] = useState<SubjectId>(subjects[0]);
  const { t } = useI18n();
  const a = t.admin;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold ${subject === s ? "bg-white text-navy" : "border border-white/10 text-white/60 hover:text-white"}`}
          >
            {t.labels.subjects[s]}
          </button>
        ))}
      </div>
      <p className="mb-3 text-sm text-white/55">
        {a.subject} : <strong className="text-white">{t.labels.subjects[subject]}</strong> · {t.labels.terms[term]}
      </p>
      {/* clé = matière + trimestre : le brouillon repart des notes enregistrées */}
      <BulkGradesForm key={`${subject}-${term}`} members={members} subject={subject} term={term} />
    </>
  );
}

function BulkGradesForm({ members, subject, term }: { members: Student[]; subject: SubjectId; term: TermId }) {
  const { grades, saveGrades } = useSchool();
  const { t } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;
  const c = a.classPage;

  const existing = (id: string) => grades.find((g) => g.studentId === id && g.subject === subject && g.term === term);
  const [maxScore, setMaxScore] = useState(String(existing(members[0].id)?.maxScore ?? 20));
  const [drafts, setDrafts] = useState<Record<string, { score: string; remarks: string }>>(() =>
    Object.fromEntries(members.map((m) => [m.id, { score: existing(m.id)?.score.toString() ?? "", remarks: existing(m.id)?.remarks ?? "" }]))
  );

  const setDraft = (id: string, patch: Partial<{ score: string; remarks: string }>) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const onSave = async () => {
    const max = Number(maxScore) || 20;
    const entries = members
      .filter((m) => drafts[m.id]?.score !== "" && Number.isFinite(Number(drafts[m.id]?.score)))
      .map((m) => ({
        studentId: m.id,
        subject,
        term,
        score: Math.min(Number(drafts[m.id].score), max),
        maxScore: max,
        remarks: drafts[m.id].remarks.trim() || undefined,
      }));
    if (entries.length === 0) {
      toast(c.nothingToSave);
      return;
    }
    const n = await saveGrades(entries);
    toast(c.gradesSaved(n));
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-white/45">
              <Th>#</Th>
              <Th>{a.th.student}</Th>
              <Th>
                <span className="inline-flex items-center gap-2">
                  {a.score} {c.outOf}
                  <input
                    type="number"
                    min="1"
                    dir="ltr"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-lime/60"
                  />
                </span>
              </Th>
              <Th>{a.remarks}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map((s, i) => {
              const value = drafts[s.id]?.score ?? "";
              const low = value !== "" && (Number(value) / (Number(maxScore) || 20)) * 20 < 10;
              return (
                <tr key={s.id}>
                  <td className="py-2 pe-3 text-white/40">{i + 1}</td>
                  <td className="py-2 pe-3 font-semibold">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="py-2 pe-3">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      dir="ltr"
                      value={value}
                      onChange={(e) => setDraft(s.id, { score: e.target.value })}
                      className={`w-24 rounded-lg border bg-white/5 px-2.5 py-1.5 font-display font-bold outline-none focus:border-lime/60 ${
                        low ? "border-rose-400/40 text-rose-300" : "border-white/10 text-lime"
                      }`}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      value={drafts[s.id]?.remarks ?? ""}
                      placeholder={a.remarksPh}
                      onChange={(e) => setDraft(s.id, { remarks: e.target.value })}
                      className={`${darkInput} py-1.5`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={onSave} className={btn.green}>
          <Save className="h-4 w-4" /> {c.saveAll}
        </button>
      </div>
    </>
  );
}

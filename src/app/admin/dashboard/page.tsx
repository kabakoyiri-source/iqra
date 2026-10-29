"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CircleCheck,
  CreditCard,
  Eye,
  FileText,
  GraduationCap,
  LogOut,
  Mail,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  Users,
  Bell,
  ExternalLink,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Field, FormError, PasswordField } from "@/components/auth/fields";
import { LoadingScreen, Modal, PhoneText, Toast } from "@/components/ui";
import { errorText, useSchool, type DocFile, type Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { formatSize } from "@/lib/files";
import {
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  REGISTRATION_FEE,
  SECTION_IDS,
  SUBJECT_IDS,
  TERM_IDS,
  type PaymentMethod,
  type PaymentType,
  type SectionId,
  type SubjectId,
  type TermId,
} from "@/lib/school";

type Tab = "dossiers" | "caisse" | "relances" | "pedagogie";

const darkInput =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-lime/60 [&>option]:bg-deep";

/** Ouvre un aperçu stocké en data URL (les navigateurs bloquent la navigation directe vers data:) */
async function openDoc(doc: DocFile) {
  if (!doc.dataUrl) return;
  const blob = await (await fetch(doc.dataUrl)).blob();
  window.open(URL.createObjectURL(blob), "_blank", "noopener");
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    ready,
    currentUser,
    login,
    logout,
    students,
    payments,
    grades,
    classes,
    confirmPayment,
    sendReminder,
    sendAllReminders,
    addGrade,
    addClass,
    assignClass,
    resetDemo,
  } = useSchool();
  const { t, money, date } = useI18n();
  const a = t.admin;

  const [activeTab, setActiveTab] = useState<Tab>("dossiers");
  const [searchTerm, setSearchTerm] = useState("");
  const [docsFor, setDocsFor] = useState<Student | null>(null);
  const [validationFor, setValidationFor] = useState<Student | null>(null);

  // Connexion admin
  const [adminEmail, setAdminEmail] = useState("admin@iqra.ml");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Encaissement
  const [valAmount, setValAmount] = useState("");
  const [valMethod, setValMethod] = useState<PaymentMethod>("especes");
  const [valType, setValType] = useState<PaymentType>("inscription");

  // Classes
  const [className, setClassName] = useState("");
  const [classSection, setClassSection] = useState<SectionId>("primaire");

  // Notes
  const [gradeStudentId, setGradeStudentId] = useState("");
  const [gradeTerm, setGradeTerm] = useState<TermId>("t1");
  const [gradeSubject, setGradeSubject] = useState<SubjectId>("quran");
  const [gradeScore, setGradeScore] = useState("");
  const [gradeMax, setGradeMax] = useState("20");
  const [gradeRemarks, setGradeRemarks] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  if (!ready) return <LoadingScreen dark />;

  // ── Écran de connexion ───────────────────────────────────────────
  if (!currentUser || currentUser.role !== "admin") {
    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError("");
      try {
        const user = await login(adminEmail, adminPassword);
        if (user.role !== "admin") setLoginError(t.errors.not_admin);
      } catch (err) {
        setLoginError(errorText(t, err));
      }
    };

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-night px-4">
        <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div className="pointer-events-none absolute -top-40 start-1/4 h-96 w-96 rounded-full bg-emerald/25 blur-[130px]" />
        <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xs font-semibold text-deep/50 hover:text-emerald">
              {t.common.backHome}
            </Link>
            <LanguageSwitcher />
          </div>
          <LogoMark className="mx-auto mb-4 mt-6 h-14 w-14" />
          <h1 className="text-center font-display text-2xl font-bold text-navy">{a.gateTitle}</h1>
          <p className="mt-1 text-center text-sm leading-relaxed text-deep/55">{a.gateText}</p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            {loginError && <FormError message={loginError} />}
            <Field
              icon={<Mail />}
              label={a.gateEmail}
              type="email"
              dir="ltr"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <PasswordField
              label={a.gatePassword}
              dir="ltr"
              required
              placeholder="••••••••"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-navy py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-navy/25 transition-colors hover:bg-emerald"
            >
              {a.gateSubmit}
            </button>
            <p className="rounded-xl bg-mint px-3 py-2 text-center text-xs text-deep/60">
              {a.gateDemo} <span dir="ltr" className="font-semibold">admin@iqra.ml / admin123</span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── Données dérivées ────────────────────────────────────────────
  const remainingOf = (s: Student) => Math.max(0, s.totalDue - s.totalPaid);
  const pendingCount = students.filter((s) => s.status === "en_attente_paiement").length;
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalUnpaid = students.reduce((acc, s) => acc + remainingOf(s), 0);
  const debtors = students.filter((s) => remainingOf(s) > 0);

  const q = searchTerm.trim().toLowerCase();
  const filteredStudents = students.filter(
    (s) => !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.parentName.toLowerCase().includes(q)
  );
  const studentName = (id: string) => {
    const s = students.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : "—";
  };

  const openValidation = (s: Student) => {
    const pending = s.status === "en_attente_paiement";
    setValAmount(String(pending ? Math.min(REGISTRATION_FEE, remainingOf(s)) : remainingOf(s)));
    setValType(pending ? "inscription" : "acompte");
    setValMethod("especes");
    setValidationFor(s);
  };

  const handleConfirmValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationFor) return;
    const amount = Number(valAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await confirmPayment({ studentId: validationFor.id, amount, method: valMethod, type: valType });
    showToast(a.paymentValidated(money(amount), `${validationFor.firstName} ${validationFor.lastName}`));
    setValidationFor(null);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    await addClass(className, classSection);
    showToast(a.classCreated(className.trim()));
    setClassName("");
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const score = Number(gradeScore);
    const maxScore = Number(gradeMax) || 20;
    if (!gradeStudentId || !Number.isFinite(score) || gradeScore === "") return;
    await addGrade({
      studentId: gradeStudentId,
      subject: gradeSubject,
      term: gradeTerm,
      score: Math.min(score, maxScore),
      maxScore,
      remarks: gradeRemarks.trim() || undefined,
    });
    showToast(a.gradePublished(t.labels.subjects[gradeSubject], studentName(gradeStudentId)));
    setGradeScore("");
    setGradeRemarks("");
  };

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "dossiers", label: a.tabDossiers(pendingCount), icon: FileText },
    { id: "caisse", label: a.tabCaisse, icon: CreditCard },
    { id: "relances", label: a.tabRelances, icon: Bell },
    { id: "pedagogie", label: a.tabPedagogie, icon: BookOpen },
  ];

  const kpis = [
    { label: a.kpiStudents, value: a.studentsCount(students.length), hint: a.kpiStudentsHint, icon: Users, tone: "border-white/10 bg-white/[0.04] text-white", accent: "text-lime" },
    { label: a.kpiPending, value: a.dossiersCount(pendingCount), hint: a.kpiPendingHint, icon: TriangleAlert, tone: "border-amber-400/20 bg-amber-400/[0.07] text-amber-200", accent: "text-amber-300" },
    { label: a.kpiRevenue, value: money(totalRevenue), hint: a.kpiRevenueHint, icon: TrendingUp, tone: "border-emerald/30 bg-emerald/[0.12] text-emerald-200", accent: "text-lime" },
    { label: a.kpiUnpaid, value: money(totalUnpaid), hint: a.kpiUnpaidHint, icon: CreditCard, tone: "border-rose-400/20 bg-rose-400/[0.07] text-rose-200", accent: "text-rose-300" },
  ];

  const statusBadge = (s: Student) =>
    s.status === "valide"
      ? "border-emerald/40 bg-emerald/20 text-emerald-200"
      : s.status === "rejete"
        ? "border-rose-400/40 bg-rose-400/15 text-rose-200"
        : "border-amber-400/40 bg-amber-400/15 text-amber-200";

  return (
    <div className="min-h-screen bg-night pb-16 text-white">
      <Toast message={toast} />

      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-night/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-10 w-10" />
            <div className="leading-tight">
              <span className="keep-tracking block font-display text-lg font-extrabold tracking-[0.1em]">IQRA</span>
              <span className="block text-[0.7rem] font-bold text-lime">{a.portal}</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher tone="dark" />
            <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/75 lg:inline-flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime" />
              {currentUser.fullName}
            </span>
            <button
              onClick={() => {
                if (window.confirm(a.resetConfirm)) {
                  resetDemo();
                  showToast(a.resetDone);
                }
              }}
              title={a.resetDemo}
              aria-label={a.resetDemo}
              className="rounded-xl border border-white/10 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/connexion");
              }}
              title={t.common.logout}
              aria-label={t.common.logout}
              className="rounded-xl border border-white/10 p-2 text-white/60 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* KPIs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className={`rounded-[1.5rem] border p-5 ${k.tone}`}>
              <div className="flex items-center justify-between text-xs font-semibold opacity-80">
                <span>{k.label}</span>
                <k.icon className={`h-4 w-4 ${k.accent}`} />
              </div>
              <div className={`mt-2 font-display text-2xl font-extrabold ${k.accent}`}>{k.value}</div>
              <span className="mt-1 block text-[11px] opacity-60">{k.hint}</span>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-t-xl border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                activeTab === tab.id ? "border-lime bg-lime/10 text-lime" : "border-transparent text-white/50 hover:text-white/85"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === "dossiers" || activeTab === "relances") && (
          <div className="relative mb-6 max-w-md">
            <Search className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              placeholder={a.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pe-4 ps-10 text-sm text-white outline-none placeholder:text-white/35 focus:border-lime/60"
            />
          </div>
        )}

        {/* 1. Inscriptions & paiements */}
        {activeTab === "dossiers" && (
          <Panel title={a.dossiersTitle} text={a.dossiersText}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-start text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/45">
                    <Th>{a.thStudent}</Th>
                    <Th>{a.thSection}</Th>
                    <Th>{a.thClass}</Th>
                    <Th>{a.thParent}</Th>
                    <Th>{a.thDocs}</Th>
                    <Th>{a.thStatus}</Th>
                    <Th className="text-end">{a.thAction}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-white/[0.03]">
                      <td className="py-3.5 pe-3">
                        <span className="font-bold">
                          {st.firstName} {st.lastName}
                        </span>
                        <span className="block text-[11px] text-white/40">{t.parent.bornOn(date(st.birthDate))}</span>
                      </td>
                      <td className="py-3.5 pe-3 font-semibold text-lime-soft/85">{t.labels.sections[st.section]}</td>
                      <td className="py-3.5 pe-3">
                        <select
                          value={st.classId ?? ""}
                          onChange={(e) => {
                            assignClass(st.id, e.target.value || undefined);
                            showToast(a.classAssigned);
                          }}
                          className="max-w-56 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-lime/60 [&>option]:bg-deep"
                        >
                          <option value="">{t.parent.notAssigned}</option>
                          {classes
                            .filter((c) => c.section === st.section)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="py-3.5 pe-3 text-white/75">
                        {st.parentName}
                        <span className="block text-[11px] text-white/40">
                          <PhoneText phone={st.parentPhone} />
                        </span>
                      </td>
                      <td className="py-3.5 pe-3">
                        <button
                          onClick={() => setDocsFor(st)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-lime hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" /> {a.inspect}
                        </button>
                      </td>
                      <td className="py-3.5 pe-3">
                        <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadge(st)}`}>
                          {t.labels.status[st.status]}
                        </span>
                      </td>
                      <td className="py-3.5 text-end">
                        {remainingOf(st) > 0 ? (
                          <button
                            onClick={() => openValidation(st)}
                            className="rounded-xl bg-leaf px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald"
                          >
                            {a.validate}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-lime">
                            <CircleCheck className="h-4 w-4" /> {t.parent.fullyPaid}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && <p className="py-8 text-center text-sm text-white/40">{a.noResults}</p>}
            </div>
          </Panel>
        )}

        {/* 2. Historique de caisse */}
        {activeTab === "caisse" && (
          <Panel title={a.caisseTitle}>
            {payments.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">{a.noPayments}</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                    <div className="min-w-0">
                      <span dir="ltr" className="block font-mono text-sm font-bold text-lime">
                        {p.receiptNumber}
                      </span>
                      <span className="font-bold">{studentName(p.studentId)}</span>
                      <span className="block text-xs text-white/45">
                        {t.labels.paymentTypes[p.type]} · {date(p.date)}
                      </span>
                    </div>
                    <div className="shrink-0 text-end">
                      <span className="block font-display text-base font-extrabold text-emerald-300">+{money(p.amount)}</span>
                      <span className="text-[11px] text-white/45">{t.labels.methods[p.method]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}

        {/* 3. Relances */}
        {activeTab === "relances" && (
          <Panel
            title={a.relancesTitle}
            text={a.relancesText}
            action={
              debtors.length > 0 && (
                <button
                  onClick={async () => {
                    const n = await sendAllReminders();
                    showToast(a.remindersSent(n));
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-night hover:bg-amber-300"
                >
                  <Send className="h-4 w-4 rtl:-scale-x-100" /> {a.sendAll(debtors.length)}
                </button>
              )
            }
          >
            {debtors.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-lime">{a.allPaid}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-start text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-white/45">
                      <Th>{t.common.parent}</Th>
                      <Th>{a.thStudent}</Th>
                      <Th>{a.thTotal}</Th>
                      <Th>{a.thPaid}</Th>
                      <Th>{a.thRemaining}</Th>
                      <Th className="text-end">{a.thReminder}</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {debtors
                      .filter((s) => filteredStudents.includes(s))
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.03]">
                          <td className="py-3.5 pe-3 font-bold">{s.parentName}</td>
                          <td className="py-3.5 pe-3 font-semibold text-lime-soft/85">
                            {s.firstName} {s.lastName}
                          </td>
                          <td className="py-3.5 pe-3 text-white/55">{money(s.totalDue)}</td>
                          <td className="py-3.5 pe-3 text-emerald-300">{money(s.totalPaid)}</td>
                          <td className="py-3.5 pe-3 font-display font-extrabold text-amber-300">{money(remainingOf(s))}</td>
                          <td className="py-3.5 text-end">
                            <button
                              onClick={async () => {
                                await sendReminder(s.id);
                                showToast(a.reminderSent(s.parentName));
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-night hover:bg-amber-300"
                            >
                              <Send className="h-3.5 w-3.5 rtl:-scale-x-100" /> {a.sendReminder}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        )}

        {/* 4. Pédagogie */}
        {activeTab === "pedagogie" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title={a.classesTitle} text={a.classesText} icon={<BookOpen className="h-5 w-5 text-lime" />}>
                <form onSubmit={handleCreateClass} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="block text-sm font-bold">{a.newClass}</span>
                  <label className="block text-xs text-white/60">
                    {a.className}
                    <input
                      required
                      placeholder={a.classNamePh}
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className={`${darkInput} mt-1`}
                    />
                  </label>
                  <label className="block text-xs text-white/60">
                    {a.classSection}
                    <select value={classSection} onChange={(e) => setClassSection(e.target.value as SectionId)} className={`${darkInput} mt-1`}>
                      {SECTION_IDS.map((id) => (
                        <option key={id} value={id}>
                          {t.labels.sections[id]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="w-full rounded-xl bg-lime py-2.5 text-sm font-bold text-night transition-colors hover:bg-white">
                    + {a.createClass}
                  </button>
                </form>

                <p className="mb-2 mt-5 text-sm font-bold text-white/75">{a.activeClasses(classes.length)}</p>
                {classes.length === 0 ? (
                  <p className="py-3 text-sm italic text-white/40">{a.noClasses}</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {classes.map((c) => (
                      <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <span className="block text-sm font-bold">{c.name}</span>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="rounded-full border border-lime/30 bg-lime/10 px-2 py-0.5 font-bold text-lime">
                            {t.labels.sections[c.section]}
                          </span>
                          <span className="text-white/45">{a.studentsInClass(students.filter((s) => s.classId === c.id).length)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title={a.gradesTitle} text={a.gradesText} icon={<GraduationCap className="h-5 w-5 text-lime" />}>
                <form onSubmit={handleAddGrade} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="block text-xs text-white/60">
                    {t.common.student} *
                    <select required value={gradeStudentId} onChange={(e) => setGradeStudentId(e.target.value)} className={`${darkInput} mt-1`}>
                      <option value="">{a.chooseStudent}</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} — {t.labels.sections[s.section]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs text-white/60">
                      {a.term}
                      <select value={gradeTerm} onChange={(e) => setGradeTerm(e.target.value as TermId)} className={`${darkInput} mt-1`}>
                        {TERM_IDS.map((id) => (
                          <option key={id} value={id}>
                            {t.labels.terms[id]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs text-white/60">
                      {a.subject} *
                      <select value={gradeSubject} onChange={(e) => setGradeSubject(e.target.value as SubjectId)} className={`${darkInput} mt-1`}>
                        {SUBJECT_IDS.map((id) => (
                          <option key={id} value={id}>
                            {t.labels.subjects[id]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs text-white/60">
                      {a.score} *
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        required
                        dir="ltr"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        className={`${darkInput} mt-1 font-bold text-lime`}
                      />
                    </label>
                    <label className="block text-xs text-white/60">
                      {a.maxScore}
                      <input
                        type="number"
                        min="1"
                        required
                        dir="ltr"
                        value={gradeMax}
                        onChange={(e) => setGradeMax(e.target.value)}
                        className={`${darkInput} mt-1 font-bold`}
                      />
                    </label>
                  </div>
                  <label className="block text-xs text-white/60">
                    {a.remarks}
                    <input
                      placeholder={a.remarksPh}
                      value={gradeRemarks}
                      onChange={(e) => setGradeRemarks(e.target.value)}
                      className={`${darkInput} mt-1`}
                    />
                  </label>
                  <button type="submit" className="w-full rounded-xl bg-leaf py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald">
                    {a.publishGrade}
                  </button>
                </form>
              </Panel>
            </div>

            <Panel title={a.latestGrades(grades.length)}>
              {grades.length === 0 ? (
                <p className="py-4 text-sm italic text-white/40">{a.noGrades}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {grades.slice(0, 18).map((g) => (
                    <div key={g.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="min-w-0">
                        <span className="block text-sm font-bold">{t.labels.subjects[g.subject]}</span>
                        <span className="text-xs font-semibold text-lime-soft/80">{studentName(g.studentId)}</span>
                        <span className="block text-[11px] text-white/40">{t.labels.terms[g.term]}</span>
                        {g.remarks && <p className="mt-1 text-[11px] text-white/50">« {g.remarks} »</p>}
                      </div>
                      <span dir="ltr" className="shrink-0 rounded-xl border border-emerald/40 bg-emerald/15 px-2.5 py-1 font-display text-sm font-extrabold text-lime">
                        {g.score} / {g.maxScore}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        )}
      </main>

      {/* Modale d'encaissement */}
      <Modal
        tone="dark"
        open={validationFor !== null}
        onClose={() => setValidationFor(null)}
        title={a.validateTitle}
        subtitle={validationFor ? `${validationFor.firstName} ${validationFor.lastName} · ${t.labels.sections[validationFor.section]}` : undefined}
      >
        {validationFor && (
          <form onSubmit={handleConfirmValidation} className="space-y-4 text-sm">
            <label className="block text-xs font-semibold text-white/65">
              {a.amountReceived}
              <input
                type="number"
                min="1"
                required
                dir="ltr"
                value={valAmount}
                onChange={(e) => setValAmount(e.target.value)}
                className={`${darkInput} mt-1 py-3 text-base font-bold`}
              />
            </label>

            <label className="block text-xs font-semibold text-white/65">
              {a.paymentLabel}
              <select value={valType} onChange={(e) => setValType(e.target.value as PaymentType)} className={`${darkInput} mt-1 py-3`}>
                {PAYMENT_TYPES.map((id) => (
                  <option key={id} value={id}>
                    {t.labels.paymentTypes[id]}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-1 block text-xs font-semibold text-white/65">{a.paymentMethod}</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setValMethod(m)}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                      valMethod === m ? "border-lime bg-lime text-night" : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    {t.labels.methods[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald/30 bg-emerald/10 p-3.5 text-emerald-100">
              <span className="text-xs">{a.newRemaining}</span>
              <span className="mt-0.5 block font-display text-lg font-extrabold text-white">
                {money(Math.max(0, remainingOf(validationFor) - (Number(valAmount) || 0)))}
              </span>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-3.5 font-display text-sm font-bold text-white shadow-lg hover:bg-emerald"
            >
              <CircleCheck className="h-5 w-5" /> {a.confirmPayment}
            </button>
          </form>
        )}
      </Modal>

      {/* Modale des pièces */}
      <Modal
        tone="dark"
        open={docsFor !== null}
        onClose={() => setDocsFor(null)}
        title={a.docsTitle}
        subtitle={docsFor ? `${docsFor.firstName} ${docsFor.lastName}` : undefined}
        icon={
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/15 text-lime">
            <ShieldCheck className="h-5 w-5" />
          </span>
        }
      >
        {docsFor && (
          <div className="space-y-3 text-sm">
            {(
              [
                ["birthCert", t.enroll.docBirth],
                ["photo", t.enroll.docPhoto],
                ["healthRecord", t.enroll.docHealth],
              ] as const
            ).map(([key, label]) => {
              const doc = docsFor.documents[key];
              return (
                <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {doc?.dataUrl && doc.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={doc.dataUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-white/20" />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/40">
                        <FileText className="h-6 w-6" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <span className="block font-bold">{label}</span>
                      <span dir="ltr" className="block truncate text-[11px] text-white/45">
                        {doc ? `${doc.name} · ${formatSize(doc.size)}` : a.notUploaded}
                      </span>
                      {doc && !doc.dataUrl && <span className="block text-[11px] text-amber-200/70">{a.previewUnavailable}</span>}
                    </div>
                  </div>
                  {doc?.dataUrl && (
                    <button
                      onClick={() => openDoc(doc)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-lime/40 bg-lime/10 px-3 py-2 text-xs font-bold text-lime hover:bg-lime hover:text-night"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> {a.open}
                    </button>
                  )}
                </div>
              );
            })}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="block text-xs font-semibold text-white/50">{a.healthNotes}</span>
              <span className="mt-1 block">{docsFor.healthNotes || "—"}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Panel({
  title,
  text,
  icon,
  action,
  children,
}: {
  title: string;
  text?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-deep/70 p-6 shadow-xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            {icon}
            {title}
          </h2>
          {text && <p className="mt-1 max-w-3xl text-sm text-white/55">{text}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`pb-3 pe-3 font-semibold ${className || "text-start"}`}>{children}</th>;
}

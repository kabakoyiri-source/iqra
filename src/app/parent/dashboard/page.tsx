"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CirclePlus,
  CircleCheck,
  CircleAlert,
  FileText,
  GraduationCap,
  Info,
  LogOut,
  Phone,
  Receipt,
  UserRound,
  Baby,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InfoBox, LoadingScreen, Modal, PhoneText, WhatsAppIcon } from "@/components/ui";
import { Bulletin } from "@/components/dashboard/Bulletin";
import { NOTIF_STYLE, notificationText } from "@/components/dashboard/notifications";
import { useSchool, type Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { REGISTRATION_FEE, SCHOOL, telLink, whatsappLink } from "@/lib/school";

export default function ParentDashboardPage() {
  const router = useRouter();
  const { ready, currentUser, students, payments, notifications, grades, classes, logout, markNotificationsRead } =
    useSchool();
  const { t, money, date, dir } = useI18n();
  const p = t.parent;

  const [payFor, setPayFor] = useState<Student | null>(null);
  const [receiptsFor, setReceiptsFor] = useState<Student | null>(null);
  const [bulletinFor, setBulletinFor] = useState<Student | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!ready) return <LoadingScreen />;

  if (!currentUser || currentUser.role !== "parent") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand px-4 text-center">
        <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="relative w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
          <div className="absolute end-4 top-4">
            <LanguageSwitcher />
          </div>
          <LogoMark className="mx-auto mb-4 h-14 w-14" />
          <h1 className="font-display text-2xl font-bold text-navy">{p.gateTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-deep/60">{p.gateText}</p>
          <div className="mt-6 space-y-3">
            <Link
              href="/connexion"
              className="block w-full rounded-2xl bg-navy py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-navy/25 hover:bg-emerald"
            >
              {t.common.login}
            </Link>
            <Link
              href="/inscription"
              className="block w-full rounded-2xl border border-black/10 py-3.5 text-sm font-semibold text-deep/70 hover:bg-sand"
            >
              {p.gateRegister}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const myStudents = students.filter((s) => s.parentId === currentUser.id);
  const myNotifications = notifications.filter((n) => n.parentId === currentUser.id);
  const unread = myNotifications.filter((n) => !n.isRead).length;

  const totalDue = myStudents.reduce((acc, s) => acc + s.totalDue, 0);
  const totalPaid = myStudents.reduce((acc, s) => acc + s.totalPaid, 0);
  const totalRemaining = Math.max(0, totalDue - totalPaid);

  const openNotifications = () => {
    setShowNotifications(true);
    if (unread > 0) markNotificationsRead(currentUser.id);
  };

  return (
    <div className="min-h-screen bg-cream text-deep">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-10 w-10" />
            <div className="leading-tight">
              <span className="keep-tracking block font-display text-lg font-extrabold tracking-[0.1em] text-navy">IQRA</span>
              <span className="block text-[0.7rem] font-bold text-emerald">{p.portal}</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <button
              onClick={openNotifications}
              aria-label={p.notifications}
              className="relative rounded-xl border border-black/10 p-2 text-deep/60 transition-colors hover:bg-sand hover:text-navy"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-2 rounded-full bg-sand px-3.5 py-1.5 text-xs font-semibold text-deep/75 lg:flex">
              <UserRound className="h-4 w-4 text-emerald" />
              {currentUser.fullName}
            </div>
            <Link
              href="/parent/inscription-enfant"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-3.5 py-2 font-display text-xs font-bold text-white shadow-md shadow-navy/20 transition-colors hover:bg-emerald sm:text-sm"
            >
              <CirclePlus className="h-4 w-4" />
              <span className="hidden sm:inline">{p.enrollChild}</span>
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/connexion");
              }}
              title={t.common.logout}
              aria-label={t.common.logout}
              className="rounded-xl border border-black/10 p-2 text-deep/50 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end md:hidden">
          <LanguageSwitcher />
        </div>

        {/* Bannière de bienvenue */}
        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-brand p-6 text-white shadow-[0_30px_70px_-35px_rgba(30,58,120,0.8)] sm:p-8">
          <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.08]" />
          <div className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-lime/25 blur-3xl" />
          <div className="relative grid gap-5 md:grid-cols-3">
            <div>
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-lime-soft">
                {p.yearBadge(SCHOOL.year)}
              </span>
              <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl rtl:leading-[1.35]">
                {p.welcome(currentUser.fullName)}
              </h1>
              <p className="mt-1 text-xs text-white/70">
                <span dir="ltr">{currentUser.email}</span> · <PhoneText phone={currentUser.phone} />
              </p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <span className="text-xs font-medium text-white/70">{p.paidValidated}</span>
              <span className="font-display text-2xl font-extrabold text-lime">{money(totalPaid)}</span>
              <span className="mt-1 text-xs text-white/60">{p.outOf(money(totalDue))}</span>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-amber-300/40 bg-night/30 p-4 backdrop-blur-sm">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-100">
                <CircleAlert className="h-4 w-4" /> {p.remaining}
              </span>
              <span className="font-display text-2xl font-extrabold text-amber-200">{money(totalRemaining)}</span>
              <span className="mt-1 text-xs text-amber-100/70">{p.remainingHint}</span>
            </div>
          </div>
        </section>

        {/* Modalités de paiement */}
        <section className="mb-10 grid items-center gap-5 rounded-[2rem] border border-emerald/15 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-4">
            <span className="arch flex h-12 w-11 shrink-0 items-end justify-center bg-brand-soft pb-2.5 text-white">
              <Info className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-navy">{p.payInfoTitle}</h2>
              <p className="mt-1 text-sm leading-relaxed text-deep/65">{p.payInfoText}</p>
            </div>
          </div>
          <InfoBox compact className="w-full md:w-56" />
        </section>

        {/* Enfants */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-navy">{p.childrenTitle}</h2>
          <p className="text-sm text-deep/55">{p.childrenSubtitle}</p>
        </div>

        {myStudents.length === 0 ? (
          <div className="rounded-[2rem] border border-black/5 bg-white p-12 text-center shadow-sm">
            <span className="arch mx-auto flex h-20 w-16 items-end justify-center bg-mint pb-4 text-emerald">
              <Baby className="h-8 w-8" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-navy">{p.noChildTitle}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-deep/55">{p.noChildText}</p>
            <Link
              href="/parent/inscription-enfant"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-navy px-6 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-navy/20 hover:bg-emerald"
            >
              <CirclePlus className="h-4 w-4" /> {p.noChildCta}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {myStudents.map((student) => {
              const remaining = Math.max(0, student.totalDue - student.totalPaid);
              const pct = Math.min(100, Math.round((student.totalPaid / student.totalDue) * 100));
              const cls = classes.find((c) => c.id === student.classId);
              const receiptCount = payments.filter((x) => x.studentId === student.id).length;
              const validated = student.status === "valide";

              return (
                <article
                  key={student.id}
                  className="flex flex-col justify-between rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(30,58,120,0.5)]"
                >
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="arch flex h-14 w-12 items-end justify-center bg-brand-soft pb-2 font-display text-base font-extrabold text-white">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </span>
                        <div>
                          <h3 className="font-display text-lg font-bold text-navy">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-xs text-deep/55">
                            {t.labels.sections[student.section]} · {p.classLabel} : {cls ? cls.name : p.notAssigned}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          validated
                            ? "border border-emerald/25 bg-mint text-emerald"
                            : "border border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {validated ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
                        {t.labels.status[student.status]}
                      </span>
                    </div>

                    {/* Progression */}
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-deep/60">{p.progress}</span>
                        <span className="font-bold text-navy">{p.done(pct)}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
                        <motion.div
                          className={`h-full rounded-full ${pct === 100 ? "bg-leaf" : "bg-gradient-to-r from-ocean to-leaf rtl:bg-gradient-to-l"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1 text-xs text-deep/50">
                        <span>{p.received(money(student.totalPaid))}</span>
                        <span>{p.total(money(student.totalDue))}</span>
                      </div>
                    </div>

                    <div
                      className={`mt-4 flex items-center justify-between rounded-2xl p-3.5 text-sm ${
                        remaining > 0
                          ? "border border-amber-200 bg-amber-50 text-amber-900"
                          : "border border-emerald/20 bg-mint text-emerald"
                      }`}
                    >
                      <span className="font-medium">{remaining > 0 ? p.remaining : p.fullyPaid}</span>
                      <span className="font-display font-extrabold">{money(remaining)}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-black/5 pt-4">
                    <button
                      onClick={() => setPayFor(student)}
                      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-navy/10 py-2.5 text-xs font-bold text-navy transition-colors hover:bg-navy hover:text-white"
                    >
                      <Phone className="h-4 w-4" />
                      {p.actionPay}
                    </button>
                    <button
                      onClick={() => setReceiptsFor(student)}
                      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-sand py-2.5 text-xs font-semibold text-deep/75 transition-colors hover:bg-mint"
                    >
                      <FileText className="h-4 w-4 text-deep/50" />
                      {p.actionReceipts(receiptCount)}
                    </button>
                    <button
                      onClick={() => setBulletinFor(student)}
                      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-mint py-2.5 text-xs font-semibold text-emerald transition-colors hover:bg-emerald hover:text-white"
                    >
                      <GraduationCap className="h-4 w-4" />
                      {p.actionBulletin}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Tiroir des notifications */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end bg-night/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotifications(false)}
          >
            <motion.aside
              className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"
              initial={{ x: dir === "rtl" ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: dir === "rtl" ? "-100%" : "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
                  <Bell className="h-5 w-5 text-emerald" /> {p.notifications}
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  aria-label={t.common.close}
                  className="rounded-lg p-1.5 text-deep/40 hover:bg-sand"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {myNotifications.length === 0 ? (
                  <p className="py-6 text-center text-sm text-deep/50">{p.noNotifications}</p>
                ) : (
                  myNotifications.map((n) => {
                    const { icon: Icon, tone } = NOTIF_STYLE[n.kind];
                    const text = notificationText(n, { t, money, parentName: currentUser.fullName, students });
                    return (
                      <div key={n.id} className="flex gap-3 rounded-2xl border border-black/5 bg-cream p-4">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 space-y-1 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-x-2">
                            <span className="font-bold text-navy">{text.title}</span>
                            <span className="text-[11px] text-deep/40">{date(n.date)}</span>
                          </div>
                          <p className="leading-relaxed text-deep/65">{text.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consignes de paiement */}
      <Modal
        open={payFor !== null}
        onClose={() => setPayFor(null)}
        title={p.payModalTitle}
        subtitle={payFor ? `${t.common.student} : ${payFor.firstName} ${payFor.lastName}` : undefined}
      >
        {payFor && (
          <div className="space-y-4 text-sm">
            <div className="space-y-2 rounded-2xl border border-black/5 bg-sand p-4">
              <div className="flex justify-between font-semibold text-deep/70">
                <span>{t.labels.sections[payFor.section]}</span>
                <span className="text-navy">{money(payFor.totalDue)}</span>
              </div>
              <div className="flex justify-between font-semibold text-deep/70">
                <span>{t.pricing.registration}</span>
                <span>{money(REGISTRATION_FEE)}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 font-extrabold text-amber-800">
                <span>{p.currentRemaining}</span>
                <span>{money(Math.max(0, payFor.totalDue - payFor.totalPaid))}</span>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-emerald/20 bg-mint/60 p-4">
              <span className="flex items-center gap-1.5 font-bold text-navy">
                <Phone className="h-4 w-4 text-emerald" /> {p.officialNumbers}
              </span>
              <p className="leading-relaxed text-deep/70">{p.payModalText}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SCHOOL.phones.map((ph) => (
                  <a
                    key={ph}
                    href={telLink(ph)}
                    className="rounded-xl border border-emerald/25 bg-white p-3 text-center font-display text-lg font-extrabold text-navy hover:border-emerald"
                  >
                    <PhoneText phone={ph} />
                  </a>
                ))}
              </div>
              <p className="text-xs text-deep/55">{p.payModalNote}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={whatsappLink(p.whatsappPayMsg(`${payFor.firstName} ${payFor.lastName}`))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-display text-sm font-bold text-white hover:brightness-105"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {p.whatsappPay}
              </a>
              <button
                onClick={() => setPayFor(null)}
                className="rounded-2xl bg-navy py-3.5 font-display text-sm font-bold text-white hover:bg-emerald"
              >
                {p.understood}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reçus */}
      <Modal
        open={receiptsFor !== null}
        onClose={() => setReceiptsFor(null)}
        title={p.receiptsTitle}
        subtitle={receiptsFor ? `${receiptsFor.firstName} ${receiptsFor.lastName}` : undefined}
        icon={
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-emerald">
            <Receipt className="h-5 w-5" />
          </span>
        }
      >
        {receiptsFor && (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pe-1">
            {payments.filter((x) => x.studentId === receiptsFor.id).length === 0 ? (
              <p className="py-6 text-center text-sm text-deep/50">{p.noReceipts}</p>
            ) : (
              payments
                .filter((x) => x.studentId === receiptsFor.id)
                .map((x) => (
                  <div key={x.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-cream p-4 text-sm">
                    <div>
                      <span dir="ltr" className="block font-mono font-bold text-navy">
                        {x.receiptNumber}
                      </span>
                      <span className="text-deep/60">
                        {t.labels.paymentTypes[x.type]} · {date(x.date)}
                      </span>
                      <span className="mt-0.5 block text-xs text-deep/45">
                        {t.labels.methods[x.method]} · {p.validatedBy} {x.validatedBy}
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="block font-display font-extrabold text-emerald">+{money(x.amount)}</span>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-emerald">
                        <CircleCheck className="h-3 w-3" /> {p.officialReceipt}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </Modal>

      {/* Bulletin */}
      <Modal
        open={bulletinFor !== null}
        onClose={() => setBulletinFor(null)}
        title={p.bulletinTitle}
        subtitle={bulletinFor ? `${bulletinFor.firstName} ${bulletinFor.lastName}` : undefined}
        size="lg"
        icon={<LogoMark className="h-10 w-10" />}
      >
        {bulletinFor && <Bulletin student={bulletinFor} grades={grades} classes={classes} />}
      </Modal>
    </div>
  );
}

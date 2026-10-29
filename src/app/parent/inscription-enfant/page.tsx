"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Baby,
  CircleCheck,
  CloudUpload,
  FileCheck,
  FileText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FormError } from "@/components/auth/fields";
import { LoadingScreen } from "@/components/ui";
import { errorText, useSchool, type DocFile } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { fileToDoc, formatSize } from "@/lib/files";
import { REGISTRATION_FEE, SCHOOL, SECTION_IDS, TUITION, UNIFORM_FEE, totalDueFor, type SectionId } from "@/lib/school";

const inputCls =
  "w-full rounded-2xl border border-black/10 bg-cream px-4 py-3 text-sm text-deep outline-none transition-all focus:border-emerald focus:bg-white focus:ring-4 focus:ring-lime/25";

type DocKey = "birthCert" | "photo" | "healthRecord";

export default function InscriptionEnfantPage() {
  const { ready, currentUser, addStudent } = useSchool();
  const { t, money } = useI18n();
  const e = t.enroll;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [section, setSection] = useState<SectionId>("primaire");
  const [healthNotes, setHealthNotes] = useState("");
  const [docs, setDocs] = useState<Partial<Record<DocKey, DocFile>>>({});
  const [processing, setProcessing] = useState<DocKey | null>(null);

  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ready) return <LoadingScreen />;

  if (!currentUser || currentUser.role !== "parent") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4 text-center">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
          <LogoMark className="mx-auto mb-4 h-14 w-14" />
          <h1 className="font-display text-2xl font-bold text-navy">{t.parent.gateTitle}</h1>
          <p className="mt-2 text-sm text-deep/60">{t.errors.not_logged_in}</p>
          <Link
            href="/connexion"
            className="mt-6 block w-full rounded-2xl bg-navy py-3.5 font-display text-sm font-bold text-white hover:bg-emerald"
          >
            {t.common.login}
          </Link>
        </div>
      </div>
    );
  }

  const pickFile = async (key: DocKey, file: File | undefined) => {
    if (!file) return;
    setProcessing(key);
    const doc = await fileToDoc(file);
    setDocs((d) => ({ ...d, [key]: doc }));
    setProcessing(null);
  };

  const reset = () => {
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setGender("M");
    setHealthNotes("");
    setDocs({});
    setSubmittedName(null);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrorMsg("");
    if (!firstName.trim() || !lastName.trim() || !birthDate) {
      setErrorMsg(t.errors.fill_required);
      return;
    }
    if (!docs.birthCert || !docs.photo) {
      setErrorMsg(e.missingDocs);
      return;
    }
    setIsSubmitting(true);
    try {
      await addStudent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate,
        gender,
        section,
        healthNotes: healthNotes.trim() || undefined,
        documents: docs,
      });
      setSubmittedName(`${firstName.trim()} ${lastName.trim()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMsg(errorText(t, err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const docSlots: { key: DocKey; label: string; required: boolean; accept: string }[] = [
    { key: "birthCert", label: e.docBirth, required: true, accept: ".pdf,image/*" },
    { key: "photo", label: e.docPhoto, required: true, accept: "image/*" },
    { key: "healthRecord", label: e.docHealth, required: false, accept: ".pdf,image/*" },
  ];

  return (
    <div className="min-h-screen bg-cream pb-16 text-deep">
      <header className="border-b border-black/5 bg-white px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link
            href="/parent/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-deep/60 hover:text-emerald"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{e.back}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="h-9 w-9" />
              <span className="keep-tracking hidden font-display font-extrabold tracking-[0.1em] text-navy sm:inline">IQRA</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {submittedName ? (
          <div className="my-12 rounded-[2rem] border border-black/5 bg-white p-8 text-center shadow-xl">
            <span className="arch mx-auto flex h-20 w-16 items-end justify-center bg-brand-soft pb-4 text-white">
              <CircleCheck className="h-8 w-8" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-navy">{e.successTitle}</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-deep/65">{e.successText(submittedName)}</p>
            <div className="mx-auto mt-6 max-w-md space-y-1 rounded-2xl bg-mint p-4 text-sm text-deep/80">
              <p>
                {t.pricing.registration} : <strong>{money(REGISTRATION_FEE)}</strong>
              </p>
              <p>
                {e.total} : <strong>{money(totalDueFor(section))}</strong>
              </p>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/parent/dashboard"
                className="rounded-2xl bg-navy px-6 py-3 font-display text-sm font-bold text-white shadow-lg shadow-navy/20 hover:bg-emerald"
              >
                {e.goDashboard}
              </Link>
              <button
                onClick={reset}
                className="rounded-2xl border border-black/10 px-6 py-3 text-sm font-semibold text-deep/70 hover:bg-sand"
              >
                {e.enrollAnother}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-brand p-6 text-white shadow-xl sm:p-8">
              <div className="pattern-islamic pointer-events-none absolute inset-0 opacity-[0.08]" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-lime-soft">
                  <Sparkles className="h-3.5 w-3.5 text-lime" /> {e.badge(SCHOOL.year)}
                </span>
                <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">{e.title}</h1>
                <p className="mt-1 max-w-xl text-sm text-white/75">{e.subtitle}</p>
              </div>
            </div>

            {errorMsg && <FormError title={e.errorTitle} message={errorMsg} />}

            {/* 1. Élève */}
            <section className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
              <StepTitle n={1} icon={<Baby className="h-5 w-5" />} title={e.step1} />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-deep/70">{e.lastName} *</span>
                  <input required placeholder={e.lastNamePh} value={lastName} onChange={(x) => setLastName(x.target.value)} className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-deep/70">{e.firstName} *</span>
                  <input required placeholder={e.firstNamePh} value={firstName} onChange={(x) => setFirstName(x.target.value)} className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-deep/70">{e.birthDate} *</span>
                  <input type="date" required value={birthDate} onChange={(x) => setBirthDate(x.target.value)} className={inputCls} />
                </label>
                <div>
                  <span className="mb-1 block text-xs font-semibold text-deep/70">{e.gender} *</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(["M", "F"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        aria-pressed={gender === g}
                        className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                          gender === g ? "border-emerald bg-mint text-emerald ring-2 ring-emerald/20" : "border-black/10 text-deep/60 hover:border-black/20"
                        }`}
                      >
                        {t.labels.gender[g]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="mb-2 block text-xs font-semibold text-deep/70">{e.sectionLabel} *</span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SECTION_IDS.map((id) => (
                    <label
                      key={id}
                      className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all ${
                        section === id ? "border-emerald bg-mint/60 ring-2 ring-emerald/20" : "border-black/10 hover:border-black/20"
                      }`}
                    >
                      <input type="radio" name="section" value={id} checked={section === id} onChange={() => setSection(id)} className="sr-only" />
                      <span>
                        <span className="block font-display font-bold text-navy">{t.cycles.items[id].name}</span>
                        <span className="text-[11px] text-deep/55">{t.cycles.items[id].age}</span>
                      </span>
                      <span className="mt-2 block font-display text-sm font-extrabold text-emerald">{money(TUITION[id])}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-deep/70">{e.healthNotes}</span>
                <textarea
                  rows={2}
                  placeholder={e.healthPlaceholder}
                  value={healthNotes}
                  onChange={(x) => setHealthNotes(x.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </label>
            </section>

            {/* 2. Pièces */}
            <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
              <StepTitle n={2} icon={<CloudUpload className="h-5 w-5" />} title={e.step2} />
              <p className="mb-6 mt-2 text-xs text-deep/55">{e.step2Hint}</p>

              <div className="space-y-3">
                {docSlots.map((slot) => {
                  const doc = docs[slot.key];
                  return (
                    <label
                      key={slot.key}
                      onDragOver={(x) => x.preventDefault()}
                      onDrop={(x) => {
                        x.preventDefault();
                        pickFile(slot.key, x.dataTransfer.files?.[0]);
                      }}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 border-dashed p-4 transition-colors ${
                        doc ? "border-emerald/40 bg-mint/40" : "border-black/10 hover:border-emerald/40 hover:bg-cream"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {doc?.dataUrl && doc.type.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={doc.dataUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-black/10" />
                        ) : (
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                              doc ? "bg-emerald text-white" : "bg-sand text-deep/40"
                            }`}
                          >
                            {doc ? <FileCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-navy">
                            {slot.label} {slot.required && "*"}
                          </span>
                          <span dir={doc ? "ltr" : undefined} className="block truncate text-xs text-deep/50">
                            {doc ? `${doc.name} · ${formatSize(doc.size)}` : slot.required ? e.docRequired : e.docOptional}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 rounded-xl border border-emerald/30 bg-white px-3.5 py-2 text-xs font-bold text-emerald transition-colors hover:bg-emerald hover:text-white">
                        {processing === slot.key ? "…" : doc ? <CircleCheck className="h-4 w-4" /> : e.upload}
                      </span>
                      <input
                        type="file"
                        accept={slot.accept}
                        className="hidden"
                        onChange={(x) => pickFile(slot.key, x.target.files?.[0])}
                      />
                    </label>
                  );
                })}
              </div>
            </section>

            {/* 3. Récapitulatif */}
            <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
              <StepTitle n={3} icon={<Wallet className="h-5 w-5" />} title={e.step3} />

              <div className="mb-6 mt-5 space-y-2 rounded-2xl bg-sand p-4 text-sm">
                <Line label={e.tuition(t.labels.sections[section])} value={money(TUITION[section])} />
                <Line label={t.pricing.registration} value={money(REGISTRATION_FEE)} />
                <Line label={e.uniforms} value={money(UNIFORM_FEE[section])} />
                <div className="flex justify-between border-t border-black/10 pt-2 font-bold text-navy">
                  <span>{e.total}</span>
                  <span className="font-display font-extrabold text-emerald">{money(totalDueFor(section))}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || processing !== null}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 font-display text-base font-bold text-white shadow-xl shadow-navy/25 transition-all hover:bg-emerald disabled:opacity-50"
              >
                <FileCheck className="h-5 w-5" />
                {isSubmitting ? e.submitting : e.submit}
              </button>
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-deep/50">
                <ShieldCheck className="h-4 w-4 text-emerald" /> {e.secure}
              </p>
            </section>
          </form>
        )}
      </main>
    </div>
  );
}

function StepTitle({ n, icon, title }: { n: number; icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-lg font-bold text-navy">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-ocean to-navy text-white">{icon}</span>
      <span className="text-emerald">{n}.</span> {title}
    </h2>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-deep/65">
      <span>{label}</span>
      <span className="font-bold text-deep">{value}</span>
    </div>
  );
}

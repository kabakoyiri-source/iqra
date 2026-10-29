"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, LogIn, ShieldCheck, UserRound, Sparkles } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field, FormError, PasswordField } from "@/components/auth/fields";
import { errorText, useSchool } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";

const DEMO_ACCOUNTS = [
  { kind: "parent", email: "fatoumata.diallo@gmail.com", password: "parent123", icon: UserRound },
  { kind: "admin", email: "admin@iqra.ml", password: "admin123", icon: ShieldCheck },
] as const;

export default function ConnexionPage() {
  const router = useRouter();
  const { login } = useSchool();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg(t.errors.fill_required);
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(user.role === "admin" ? "/admin/dashboard" : "/parent/dashboard");
    } catch (err) {
      setErrorMsg(errorText(t, err));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={t.auth.login.title}
      subtitle={t.auth.login.subtitle}
      footer={
        <>
          {t.auth.login.noAccount}{" "}
          <Link href="/inscription" className="font-bold text-emerald hover:underline">
            {t.auth.login.createAccount}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && <FormError message={errorMsg} />}

        <Field
          icon={<Mail />}
          label={t.auth.login.email}
          type="email"
          dir="ltr"
          autoComplete="email"
          required
          placeholder="parent@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField
          label={t.auth.login.password}
          dir="ltr"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-navy py-4 font-display text-base font-bold text-white shadow-lg shadow-navy/25 transition-all hover:bg-emerald disabled:opacity-50"
        >
          <LogIn className="h-5 w-5 rtl:rotate-180" />
          {isSubmitting ? t.auth.login.submitting : t.auth.login.submit}
        </button>

        <p className="flex items-center justify-center gap-2 text-xs text-deep/50">
          <ShieldCheck className="h-4 w-4 text-emerald" /> {t.auth.login.secure}
        </p>
      </form>

      {/* Comptes de démonstration (données locales) */}
      <div className="mt-8 rounded-2xl border border-dashed border-emerald/30 bg-mint/60 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-navy">
          <Sparkles className="h-4 w-4 text-emerald" />
          {t.auth.login.demoTitle}
          <span className="text-xs font-medium text-deep/50">— {t.auth.login.demoHint}</span>
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.kind}
              type="button"
              onClick={() => {
                setEmail(a.email);
                setPassword(a.password);
                setErrorMsg("");
              }}
              className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-start shadow-sm ring-1 ring-black/5 transition-all hover:ring-emerald/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-white">
                <a.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-navy">
                  {a.kind === "admin" ? t.auth.login.demoAdmin : t.auth.login.demoParent}
                </span>
                <span dir="ltr" className="block truncate text-[0.7rem] text-deep/55">
                  {a.email} · {a.password}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}

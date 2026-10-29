"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Phone, User, ShieldCheck, UserPlus } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field, FormError, PasswordField } from "@/components/auth/fields";
import { errorText, useSchool } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";

export default function InscriptionParentPage() {
  const router = useRouter();
  const { registerParent } = useSchool();
  const { t } = useI18n();
  const r = t.auth.register;

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !firstName || !lastName || !phone) {
      setErrorMsg(t.errors.fill_required);
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t.errors.password_short);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerParent({ fullName: `${firstName.trim()} ${lastName.trim()}`, email, phone, password });
      router.push("/parent/dashboard");
    } catch (err) {
      setErrorMsg(errorText(t, err));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={r.title}
      subtitle={r.subtitle}
      footer={
        <>
          {r.already}{" "}
          <Link href="/connexion" className="font-bold text-emerald hover:underline">
            {t.common.login}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <FormError title={r.errorTitle} message={errorMsg} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            icon={<User />}
            label={`${r.lastName} *`}
            required
            autoComplete="family-name"
            placeholder={r.lastNamePh}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Field
            icon={<User />}
            label={`${r.firstName} *`}
            required
            autoComplete="given-name"
            placeholder={r.firstNamePh}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <Field
          icon={<Mail />}
          label={`${r.email} *`}
          type="email"
          dir="ltr"
          required
          autoComplete="email"
          placeholder="votre.email@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Field
          icon={<Phone />}
          label={`${r.phone} *`}
          type="tel"
          dir="ltr"
          required
          autoComplete="tel"
          placeholder="+223 72 22 07 03"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <PasswordField
          label={`${r.password} *`}
          dir="ltr"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-navy py-4 font-display text-base font-bold text-white shadow-lg shadow-navy/25 transition-all hover:bg-emerald disabled:opacity-50"
        >
          <UserPlus className="h-5 w-5" />
          {isSubmitting ? r.submitting : r.submit}
        </button>

        <p className="flex items-center justify-center gap-2 pt-2 text-center text-xs text-deep/50">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald" /> {r.privacy}
        </p>
      </form>
    </AuthShell>
  );
}

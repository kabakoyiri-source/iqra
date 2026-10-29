"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  FileText,
  House,
  LayoutDashboard,
  LogOut,
  Mail,
  RotateCcw,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Field, FormError, PasswordField } from "@/components/auth/fields";
import { LoadingScreen, Toast } from "@/components/ui";
import { errorText, useSchool } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";

const ToastContext = createContext<(msg: string) => void>(() => {});

/** Affiche une notification de confirmation dans le portail admin */
export function useAdminToast() {
  return useContext(ToastContext);
}

const NAV = [
  { href: "/admin/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/inscriptions", key: "inscriptions", icon: FileText },
  { href: "/admin/eleves", key: "eleves", icon: Users },
  { href: "/admin/classes", key: "classes", icon: BookOpen },
  { href: "/admin/familles", key: "familles", icon: UsersRound },
  { href: "/admin/caisse", key: "caisse", icon: Wallet },
  { href: "/admin/relances", key: "relances", icon: Bell },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { ready, currentUser, students, logout, resetDemo } = useSchool();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const a = t.admin;

  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  if (!ready) return <LoadingScreen dark />;
  if (!currentUser || currentUser.role !== "admin") return <AdminGate />;

  const pending = students.filter((s) => s.status === "en_attente_paiement").length;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navLinks = (compact: boolean) =>
    NAV.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={
          compact
            ? `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                isActive(item.href) ? "bg-lime text-night" : "text-white/60 hover:bg-white/10 hover:text-white"
              }`
            : `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                isActive(item.href) ? "bg-lime text-night shadow-lg shadow-lime/10" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
              }`
        }
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {a.nav[item.key]}
        {item.key === "inscriptions" && pending > 0 && (
          <span
            className={`ms-auto rounded-full px-1.5 text-[11px] font-bold ${
              isActive(item.href) ? "bg-night text-lime" : "bg-amber-400 text-night"
            }`}
          >
            {pending}
          </span>
        )}
      </Link>
    ));

  const onReset = () => {
    if (window.confirm(a.resetConfirm)) {
      resetDemo();
      showToast(a.resetDone);
      router.push("/admin/dashboard");
    }
  };

  const onLogout = () => {
    logout();
    router.push("/connexion");
  };

  return (
    <ToastContext.Provider value={showToast}>
      <div className="min-h-screen bg-night text-white lg:flex">
        <Toast message={toast} />

        {/* Barre latérale (bureau) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-white/10 bg-deep/50 p-5 lg:flex">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-1">
            <LogoMark className="h-10 w-10" />
            <div className="leading-tight">
              <span className="keep-tracking block font-display text-lg font-extrabold tracking-[0.1em]">IQRA</span>
              <span className="block text-[0.7rem] font-bold text-lime">{a.portal}</span>
            </div>
          </Link>

          <nav className="mt-8 flex flex-1 flex-col gap-1">{navLinks(false)}</nav>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white/75">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime" />
              <span className="truncate">{currentUser.fullName}</span>
            </div>
            <LanguageSwitcher tone="dark" />
            <div className="grid grid-cols-3 gap-2">
              <Link href="/" title={t.common.backHome} aria-label={t.common.backHome} className="flex justify-center rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white">
                <House className="h-4 w-4" />
              </Link>
              <button onClick={onReset} title={a.resetDemo} aria-label={a.resetDemo} className="flex justify-center rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={onLogout} title={t.common.logout} aria-label={t.common.logout} className="flex justify-center rounded-xl border border-white/10 p-2 text-white/60 hover:bg-rose-500/20 hover:text-rose-200">
                <LogOut className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* En-tête (mobile & tablette) */}
          <header className="sticky top-0 z-30 border-b border-white/10 bg-night/90 backdrop-blur-md lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <LogoMark className="h-9 w-9" />
                <span className="text-xs font-bold text-lime">{a.portal}</span>
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSwitcher tone="dark" />
                <button onClick={onReset} aria-label={a.resetDemo} className="rounded-xl border border-white/10 p-2 text-white/60">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button onClick={onLogout} aria-label={t.common.logout} className="rounded-xl border border-white/10 p-2 text-white/60">
                  <LogOut className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
            <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3">{navLinks(true)}</nav>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

function AdminGate() {
  const { login } = useSchool();
  const { t } = useI18n();
  const a = t.admin;
  const [email, setEmail] = useState("admin@iqra.ml");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      if (user.role !== "admin") setError(t.errors.not_admin);
    } catch (err) {
      setError(errorText(t, err));
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

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <FormError message={error} />}
          <Field icon={<Mail />} label={a.gateEmail} type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordField label={a.gatePassword} dir="ltr" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full rounded-2xl bg-navy py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-navy/25 transition-colors hover:bg-emerald">
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

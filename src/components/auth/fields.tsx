"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const base =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 ps-12 text-sm text-deep placeholder:text-deep/35 outline-none transition-all focus:border-emerald focus:ring-4 focus:ring-lime/30";

export function Field({
  icon,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-deep/80">{label}</span>
      <span dir={props.dir} className="relative block [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:start-4 [&>svg]:top-1/2 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:-translate-y-1/2 [&>svg]:text-emerald">
        {icon}
        <input className={base} {...props} />
      </span>
    </label>
  );
}

export function PasswordField({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-deep/80">{label}</span>
      <span dir={props.dir} className="relative block">
        <Lock className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald" />
        <input type={show ? "text" : "password"} className={`${base} pe-12`} {...props} />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute end-4 top-1/2 -translate-y-1/2 text-deep/40 transition-colors hover:text-emerald"
          aria-label={show ? "Masquer / إخفاء" : "Afficher / إظهار"}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </span>
    </label>
  );
}

export function FormError({ title, message }: { title?: string; message: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-800">
      {title && <span className="mb-0.5 block font-bold text-rose-900">{title}</span>}
      {message}
    </div>
  );
}

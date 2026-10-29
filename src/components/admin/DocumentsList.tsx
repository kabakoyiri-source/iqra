"use client";

import { ExternalLink, FileText } from "lucide-react";
import type { DocFile, Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { formatSize } from "@/lib/files";

const DOC_KEYS = ["birthCert", "photo", "healthRecord"] as const;

/** Ouvre un aperçu stocké en data URL (les navigateurs bloquent la navigation directe vers data:) */
async function openDoc(doc: DocFile) {
  if (!doc.dataUrl) return;
  const blob = await (await fetch(doc.dataUrl)).blob();
  window.open(URL.createObjectURL(blob), "_blank", "noopener");
}

export function docsProvided(student: Student) {
  return DOC_KEYS.filter((k) => student.documents[k]).length;
}

export function DocumentsList({ student }: { student: Student }) {
  const { t } = useI18n();
  const labels = { birthCert: t.enroll.docBirth, photo: t.enroll.docPhoto, healthRecord: t.enroll.docHealth };

  return (
    <div className="space-y-2.5">
      {DOC_KEYS.map((key) => {
        const doc = student.documents[key];
        return (
          <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex min-w-0 items-center gap-3">
              {doc?.dataUrl && doc.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.dataUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-white/20" />
              ) : (
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${doc ? "bg-lime/10 text-lime" : "bg-white/5 text-white/30"}`}>
                  <FileText className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <span className="block text-sm font-bold">{labels[key]}</span>
                <span dir={doc ? "ltr" : undefined} className="block truncate text-[11px] text-white/45">
                  {doc ? `${doc.name} · ${formatSize(doc.size)}` : t.admin.notUploaded}
                </span>
                {doc && !doc.dataUrl && <span className="block text-[11px] text-amber-200/70">{t.admin.previewUnavailable}</span>}
              </div>
            </div>
            {doc?.dataUrl && (
              <button
                onClick={() => openDoc(doc)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-lime/40 bg-lime/10 px-3 py-2 text-xs font-bold text-lime hover:bg-lime hover:text-night"
              >
                <ExternalLink className="h-3.5 w-3.5" /> {t.admin.open}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

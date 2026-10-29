"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { useSchool, type ClassItem } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { SECTION_IDS, type SectionId } from "@/lib/school";
import { useAdminToast } from "./AdminShell";
import { btn, darkInput } from "./ui";

/** Création (cls absent) ou modification d'une classe */
export function ClassFormModal({
  open,
  cls,
  defaultSection = "primaire",
  onClose,
}: {
  open: boolean;
  cls?: ClassItem;
  defaultSection?: SectionId;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <Modal tone="dark" open={open} onClose={onClose} title={cls ? t.admin.classPage.editTitle : t.admin.newClass}>
      {open && <ClassForm key={cls?.id ?? "new"} cls={cls} defaultSection={defaultSection} onDone={onClose} />}
    </Modal>
  );
}

function ClassForm({ cls, defaultSection, onDone }: { cls?: ClassItem; defaultSection: SectionId; onDone: () => void }) {
  const { addClass, updateClass } = useSchool();
  const { t } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;

  const [name, setName] = useState(cls?.name ?? "");
  const [section, setSection] = useState<SectionId>(cls?.section ?? defaultSection);
  const [teacher, setTeacher] = useState(cls?.teacher ?? "");
  const [capacity, setCapacity] = useState(String(cls?.capacity ?? 30));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data = { name: name.trim(), section, teacher: teacher.trim() || undefined, capacity: Number(capacity) || undefined };
    if (cls) {
      await updateClass(cls.id, data);
      toast(a.classPage.updated);
    } else {
      await addClass(data);
      toast(a.classCreated(data.name));
    }
    onDone();
  };

  const label = "block text-xs font-semibold text-white/55";
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-sm">
      <label className={label}>
        {a.className} *
        <input required placeholder={a.classNamePh} value={name} onChange={(e) => setName(e.target.value)} className={`${darkInput} mt-1`} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>
          {a.classSection}
          <select value={section} onChange={(e) => setSection(e.target.value as SectionId)} className={`${darkInput} mt-1`}>
            {SECTION_IDS.map((id) => (
              <option key={id} value={id}>
                {t.labels.sections[id]}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          {a.capacity}
          <input type="number" min="1" dir="ltr" value={capacity} onChange={(e) => setCapacity(e.target.value)} className={`${darkInput} mt-1`} />
        </label>
      </div>
      <label className={label}>
        {a.teacher}
        <input placeholder={a.teacherPh} value={teacher} onChange={(e) => setTeacher(e.target.value)} className={`${darkInput} mt-1`} />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onDone} className={btn.ghost}>
          {a.cancel}
        </button>
        <button type="submit" className={btn.lime}>
          {cls ? a.save : a.createClass}
        </button>
      </div>
    </form>
  );
}

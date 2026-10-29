"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Modal } from "@/components/ui";
import { useSchool, type Student } from "@/context/SchoolContext";
import { useI18n } from "@/context/LanguageContext";
import { SECTION_IDS, type SectionId } from "@/lib/school";
import { useAdminToast } from "./AdminShell";
import { btn, darkInput } from "./ui";

export function StudentEditModal({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal tone="dark" open={student !== null} onClose={onClose} title={t.admin.editTitle} subtitle={student ? `${student.firstName} ${student.lastName}` : undefined}>
      {student && <EditForm key={student.id} student={student} onDone={onClose} />}
    </Modal>
  );
}

function EditForm({ student, onDone }: { student: Student; onDone: () => void }) {
  const { updateStudent, classes } = useSchool();
  const { t } = useI18n();
  const toast = useAdminToast();
  const a = t.admin;

  const [firstName, setFirstName] = useState(student.firstName);
  const [lastName, setLastName] = useState(student.lastName);
  const [birthDate, setBirthDate] = useState(student.birthDate);
  const [gender, setGender] = useState(student.gender);
  const [section, setSection] = useState<SectionId>(student.section);
  const [classId, setClassId] = useState(student.classId ?? "");
  const [healthNotes, setHealthNotes] = useState(student.healthNotes ?? "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !birthDate) return;
    const cls = classes.find((c) => c.id === classId);
    await updateStudent(student.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      gender,
      section,
      classId: cls && cls.section === section ? cls.id : undefined,
      healthNotes: healthNotes.trim() || undefined,
    });
    toast(a.profile.updated);
    onDone();
  };

  const label = "block text-xs font-semibold text-white/55";

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>
          {t.enroll.lastName}
          <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={`${darkInput} mt-1`} />
        </label>
        <label className={label}>
          {t.enroll.firstName}
          <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`${darkInput} mt-1`} />
        </label>
        <label className={label}>
          {t.enroll.birthDate}
          <input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={`${darkInput} mt-1 [color-scheme:dark]`} />
        </label>
        <label className={label}>
          {t.enroll.gender}
          <select value={gender} onChange={(e) => setGender(e.target.value as "M" | "F")} className={`${darkInput} mt-1`}>
            <option value="M">{t.labels.gender.M}</option>
            <option value="F">{t.labels.gender.F}</option>
          </select>
        </label>
        <label className={label}>
          {a.profile.section}
          <select value={section} onChange={(e) => setSection(e.target.value as SectionId)} className={`${darkInput} mt-1`}>
            {SECTION_IDS.map((id) => (
              <option key={id} value={id}>
                {t.labels.sections[id]}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          {a.profile.class}
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className={`${darkInput} mt-1`}>
            <option value="">{a.unassigned}</option>
            {classes
              .filter((c) => c.section === section)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      {section !== student.section && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
          <TriangleAlert className="h-4 w-4 shrink-0" /> {a.sectionWarning}
        </p>
      )}

      <label className={label}>
        {a.profile.health}
        <textarea rows={2} value={healthNotes} onChange={(e) => setHealthNotes(e.target.value)} className={`${darkInput} mt-1 resize-none`} />
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onDone} className={btn.ghost}>
          {a.cancel}
        </button>
        <button type="submit" className={btn.lime}>
          {a.save}
        </button>
      </div>
    </form>
  );
}

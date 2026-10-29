"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  loadDB,
  loadSessionUserId,
  nextReceiptNumber,
  resetDB,
  saveDB,
  saveSessionUserId,
  STORAGE_KEYS,
  today,
  uid,
  type ClassItem,
  type DB,
  type DocFile,
  type GradeItem,
  type NotificationItem,
  type Payment,
  type StudentRecord,
  type UserAccount,
} from "@/lib/db";
import { totalDueFor, type PaymentMethod, type PaymentType, type SectionId } from "@/lib/school";
import type { Dict } from "@/lib/i18n";

export type { UserAccount, Payment, NotificationItem, GradeItem, ClassItem, DocFile };

export interface Student extends StudentRecord {
  totalPaid: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}

export interface NewStudentInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "M" | "F";
  section: SectionId;
  healthNotes?: string;
  documents: StudentRecord["documents"];
}

// --------------------------------------------------------------------
// Store externe synchronisé avec localStorage (et entre onglets)
// --------------------------------------------------------------------

interface StoreState {
  db: DB;
  sessionId: string | null;
}

let state: StoreState | null = null;
const listeners = new Set<() => void>();

function ensureState(): StoreState {
  if (!state) state = { db: loadDB(), sessionId: loadSessionUserId() };
  return state;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.DB_KEY || e.key === STORAGE_KEYS.SESSION_KEY) {
      state = { db: loadDB(), sessionId: loadSessionUserId() };
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(recipe: (s: StoreState) => StoreState) {
  const next = recipe(ensureState());
  state = next;
  saveDB(next.db);
  saveSessionUserId(next.sessionId);
  emit();
}

const getServerSnapshot = () => null;

function currentUserOf(s: StoreState): UserAccount | null {
  const u = s.db.users.find((x) => x.id === s.sessionId);
  if (!u) return null;
  return { id: u.id, fullName: u.fullName, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt };
}

// --------------------------------------------------------------------
// Actions (asynchrones pour rester compatibles avec un futur backend)
// --------------------------------------------------------------------

async function registerParent(data: { fullName: string; email: string; phone: string; password: string }) {
  const email = data.email.toLowerCase().trim();
  const s = ensureState();
  if (s.db.users.some((u) => u.email === email)) throw new Error("email_exists");

  const user = {
    id: uid("usr"),
    fullName: data.fullName.trim(),
    email,
    phone: data.phone.trim(),
    role: "parent" as const,
    password: data.password,
    createdAt: today(),
  };
  const welcome: NotificationItem = { id: uid("ntf"), parentId: user.id, kind: "welcome", date: today(), isRead: false };

  update((st) => ({
    sessionId: user.id,
    db: { ...st.db, users: [...st.db.users, user], notifications: [welcome, ...st.db.notifications] },
  }));
  return currentUserOf(ensureState())!;
}

async function login(email: string, password: string) {
  const clean = email.toLowerCase().trim();
  const user = ensureState().db.users.find((u) => u.email === clean);
  if (!user) throw new Error("not_found");
  if (user.password !== password) throw new Error("wrong_password");
  update((st) => ({ ...st, sessionId: user.id }));
  return currentUserOf(ensureState())!;
}

function logout() {
  update((st) => ({ ...st, sessionId: null }));
}

async function addStudent(input: NewStudentInput) {
  const s = ensureState();
  const parent = currentUserOf(s);
  if (!parent) throw new Error("not_logged_in");

  const record: StudentRecord = {
    ...input,
    id: uid("stu"),
    parentId: parent.id,
    status: "en_attente_paiement",
    totalDue: totalDueFor(input.section),
    createdAt: today(),
  };
  const notif: NotificationItem = {
    id: uid("ntf"),
    parentId: parent.id,
    studentId: record.id,
    kind: "enrollment_received",
    date: today(),
    isRead: false,
  };
  update((st) => ({
    ...st,
    db: { ...st.db, students: [record, ...st.db.students], notifications: [notif, ...st.db.notifications] },
  }));
  return record;
}

async function confirmPayment(data: { studentId: string; amount: number; method: PaymentMethod; type: PaymentType }) {
  const s = ensureState();
  const student = s.db.students.find((x) => x.id === data.studentId);
  if (!student) throw new Error("generic");

  const payment: Payment = {
    id: uid("pay"),
    studentId: data.studentId,
    receiptNumber: nextReceiptNumber(s.db.payments),
    amount: data.amount,
    type: data.type,
    method: data.method,
    date: today(),
    validatedBy: currentUserOf(s)?.fullName ?? "Direction IQRA",
  };
  const notif: NotificationItem = {
    id: uid("ntf"),
    parentId: student.parentId,
    studentId: student.id,
    kind: "payment_confirmed",
    amount: data.amount,
    receiptNumber: payment.receiptNumber,
    date: today(),
    isRead: false,
  };
  update((st) => ({
    ...st,
    db: {
      ...st.db,
      payments: [payment, ...st.db.payments],
      students: st.db.students.map((x) => (x.id === student.id ? { ...x, status: "valide" } : x)),
      notifications: [notif, ...st.db.notifications],
    },
  }));
  return payment;
}

function remainingOf(db: DB, studentId: string) {
  const st = db.students.find((x) => x.id === studentId);
  if (!st) return 0;
  const paid = db.payments.filter((p) => p.studentId === studentId).reduce((a, p) => a + p.amount, 0);
  return Math.max(0, st.totalDue - paid);
}

function reminderFor(db: DB, studentId: string): NotificationItem | null {
  const st = db.students.find((x) => x.id === studentId);
  const remaining = remainingOf(db, studentId);
  if (!st || remaining <= 0) return null;
  return { id: uid("ntf"), parentId: st.parentId, studentId, kind: "reminder", amount: remaining, date: today(), isRead: false };
}

async function sendReminder(studentId: string) {
  const notif = reminderFor(ensureState().db, studentId);
  if (!notif) return;
  update((st) => ({ ...st, db: { ...st.db, notifications: [notif, ...st.db.notifications] } }));
}

async function sendAllReminders() {
  const db = ensureState().db;
  const notifs = db.students.map((s) => reminderFor(db, s.id)).filter((n): n is NotificationItem => n !== null);
  update((st) => ({ ...st, db: { ...st.db, notifications: [...notifs, ...st.db.notifications] } }));
  return notifs.length;
}

async function addGrade(input: Omit<GradeItem, "id" | "date">) {
  const student = ensureState().db.students.find((x) => x.id === input.studentId);
  if (!student) throw new Error("generic");
  const grade: GradeItem = { ...input, id: uid("grd"), date: today() };
  const notif: NotificationItem = {
    id: uid("ntf"),
    parentId: student.parentId,
    studentId: student.id,
    kind: "grade_published",
    subject: input.subject,
    date: today(),
    isRead: false,
  };
  update((st) => ({
    ...st,
    db: { ...st.db, grades: [grade, ...st.db.grades], notifications: [notif, ...st.db.notifications] },
  }));
}

async function addClass(name: string, section: SectionId) {
  const cls: ClassItem = { id: uid("cls"), name: name.trim(), section, academicYear: "2026/2027" };
  update((st) => ({ ...st, db: { ...st.db, classes: [...st.db.classes, cls] } }));
}

async function assignClass(studentId: string, classId: string | undefined) {
  update((st) => ({
    ...st,
    db: { ...st.db, students: st.db.students.map((x) => (x.id === studentId ? { ...x, classId } : x)) },
  }));
}

function markNotificationsRead(parentId: string) {
  update((st) => ({
    ...st,
    db: {
      ...st.db,
      notifications: st.db.notifications.map((n) => (n.parentId === parentId ? { ...n, isRead: true } : n)),
    },
  }));
}

function resetDemo() {
  const db = resetDB();
  update((st) => ({ db, sessionId: db.users.some((u) => u.id === st.sessionId) ? st.sessionId : null }));
}

const actions = {
  registerParent,
  login,
  logout,
  addStudent,
  confirmPayment,
  sendReminder,
  sendAllReminders,
  addGrade,
  addClass,
  assignClass,
  markNotificationsRead,
  resetDemo,
};

// --------------------------------------------------------------------
// Contexte React
// --------------------------------------------------------------------

interface SchoolContextType extends Readonly<typeof actions> {
  /** false pendant le rendu serveur / l'hydratation, avant lecture du localStorage */
  ready: boolean;
  currentUser: UserAccount | null;
  students: Student[];
  payments: Payment[];
  notifications: NotificationItem[];
  grades: GradeItem[];
  classes: ClassItem[];
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore<StoreState | null>(subscribe, ensureState, getServerSnapshot);

  const value = useMemo<SchoolContextType>(() => {
    if (!snapshot) {
      return {
        ...actions,
        ready: false,
        currentUser: null,
        students: [],
        payments: [],
        notifications: [],
        grades: [],
        classes: [],
      };
    }
    const { db } = snapshot;
    const students: Student[] = db.students.map((s) => {
      const parent = db.users.find((u) => u.id === s.parentId);
      return {
        ...s,
        totalPaid: db.payments.filter((p) => p.studentId === s.id).reduce((a, p) => a + p.amount, 0),
        parentName: parent?.fullName ?? "—",
        parentPhone: parent?.phone ?? "",
        parentEmail: parent?.email ?? "",
      };
    });
    return {
      ...actions,
      ready: true,
      currentUser: currentUserOf(snapshot),
      students,
      payments: db.payments,
      notifications: db.notifications,
      grades: db.grades,
      classes: db.classes,
    };
  }, [snapshot]);

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) throw new Error("useSchool must be used within a SchoolProvider");
  return context;
}

/** Traduit un code d'erreur levé par les actions (« email_exists »…) */
export function errorText(t: Dict, err: unknown) {
  const code = err instanceof Error ? err.message : "";
  return code in t.errors ? t.errors[code as keyof Dict["errors"]] : t.errors.generic;
}

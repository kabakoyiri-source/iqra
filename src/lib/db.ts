/**
 * Base de données locale (localStorage) avec jeu de données initial (seed).
 * Remplace Supabase pour la démo : toutes les fonctions du contexte passent par ici,
 * ce qui permettra de rebrancher un vrai backend sans toucher aux pages.
 */

import {
  totalDueFor,
  type PaymentMethod,
  type PaymentType,
  type SectionId,
  type SubjectId,
  type TermId,
} from "./school";

export type Role = "parent" | "admin";

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface StoredUser extends UserAccount {
  password: string;
}

export interface DocFile {
  name: string;
  type: string;
  size: number;
  /** Aperçu (data URL) — absent pour les fichiers de démonstration ou trop lourds */
  dataUrl?: string;
}

export type StudentStatus = "en_attente_paiement" | "valide" | "rejete";

export interface StudentRecord {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "M" | "F";
  section: SectionId;
  status: StudentStatus;
  classId?: string;
  healthNotes?: string;
  documents: {
    birthCert?: DocFile;
    photo?: DocFile;
    healthRecord?: DocFile;
  };
  totalDue: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  receiptNumber: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  date: string;
  validatedBy: string;
}

export type NotificationKind =
  | "welcome"
  | "enrollment_received"
  | "payment_confirmed"
  | "reminder"
  | "grade_published";

/** Les textes sont générés à l'affichage, dans la langue active */
export interface NotificationItem {
  id: string;
  parentId: string;
  studentId?: string;
  kind: NotificationKind;
  amount?: number;
  receiptNumber?: string;
  subject?: SubjectId;
  date: string;
  isRead: boolean;
}

export interface GradeItem {
  id: string;
  studentId: string;
  subject: SubjectId;
  score: number;
  maxScore: number;
  term: TermId;
  remarks?: string;
  date: string;
}

export interface ClassItem {
  id: string;
  name: string;
  section: SectionId;
  academicYear: string;
}

export interface DB {
  version: number;
  users: StoredUser[];
  students: StudentRecord[];
  payments: Payment[];
  notifications: NotificationItem[];
  grades: GradeItem[];
  classes: ClassItem[];
}

const DB_KEY = "iqra_db";
const SESSION_KEY = "iqra_session";
const DB_VERSION = 1;

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Date locale au format AAAA-MM-JJ */
export function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nextReceiptNumber(payments: Payment[]) {
  return `IQ-2026-${String(payments.length + 1).padStart(4, "0")}`;
}

// --------------------------------------------------------------------
// Seed — familles, élèves, paiements, notes et classes de démonstration
// --------------------------------------------------------------------

function demoDoc(name: string, type = "application/pdf", size = 240_000): DocFile {
  return { name, type, size };
}

function createSeed(): DB {
  const users: StoredUser[] = [
    {
      id: "usr-admin",
      fullName: "Direction IQRA",
      email: "admin@iqra.ml",
      phone: "+223 72 22 07 03",
      role: "admin",
      password: "admin123",
      createdAt: "2026-08-20",
    },
    {
      id: "usr-p1",
      fullName: "Fatoumata Diallo",
      email: "fatoumata.diallo@gmail.com",
      phone: "+223 76 45 12 30",
      role: "parent",
      password: "parent123",
      createdAt: "2026-09-01",
    },
    {
      id: "usr-p2",
      fullName: "Moussa Coulibaly",
      email: "moussa.coulibaly@gmail.com",
      phone: "+223 66 18 40 27",
      role: "parent",
      password: "parent123",
      createdAt: "2026-09-04",
    },
    {
      id: "usr-p3",
      fullName: "Awa Traoré",
      email: "awa.traore@gmail.com",
      phone: "+223 79 02 55 61",
      role: "parent",
      password: "parent123",
      createdAt: "2026-09-12",
    },
    {
      id: "usr-p4",
      fullName: "Boubacar Keïta",
      email: "boubacar.keita@gmail.com",
      phone: "+223 65 33 71 09",
      role: "parent",
      password: "parent123",
      createdAt: "2026-09-06",
    },
    {
      id: "usr-p5",
      fullName: "Kadiatou Sangaré",
      email: "kadiatou.sangare@gmail.com",
      phone: "+223 70 41 26 88",
      role: "parent",
      password: "parent123",
      createdAt: "2026-09-02",
    },
    {
      id: "usr-p6",
      fullName: "Seydou Konaté",
      email: "seydou.konate@gmail.com",
      phone: "+223 75 90 14 52",
      role: "parent",
      password: "parent123",
      createdAt: "2026-09-08",
    },
  ];

  const classes: ClassItem[] = [
    { id: "cls-1", name: "Petite section — القسم الصغير", section: "jardin", academicYear: "2026/2027" },
    { id: "cls-2", name: "Grande section — القسم الكبير", section: "jardin", academicYear: "2026/2027" },
    { id: "cls-3", name: "1ère année — السنة الأولى", section: "primaire", academicYear: "2026/2027" },
    { id: "cls-4", name: "4e année A — السنة الرابعة أ", section: "primaire", academicYear: "2026/2027" },
    { id: "cls-5", name: "6e année — السنة السادسة", section: "primaire", academicYear: "2026/2027" },
    { id: "cls-6", name: "8e année — السنة الثامنة", section: "college", academicYear: "2026/2027" },
  ];

  const student = (
    s: Omit<StudentRecord, "totalDue" | "documents"> & { documents?: StudentRecord["documents"] }
  ): StudentRecord => ({
    documents: {
      birthCert: demoDoc(`acte_naissance_${s.firstName.toLowerCase()}.pdf`),
      photo: demoDoc(`photo_${s.firstName.toLowerCase()}.jpg`, "image/jpeg", 180_000),
    },
    ...s,
    totalDue: totalDueFor(s.section),
  });

  const students: StudentRecord[] = [
    student({ id: "stu-1", parentId: "usr-p1", firstName: "Aïcha", lastName: "Diallo", birthDate: "2017-03-14", gender: "F", section: "primaire", status: "valide", classId: "cls-4", createdAt: "2026-09-01" }),
    student({ id: "stu-2", parentId: "usr-p1", firstName: "Ibrahim", lastName: "Diallo", birthDate: "2021-06-02", gender: "M", section: "jardin", status: "valide", classId: "cls-2", healthNotes: "Allergie légère à l'arachide", createdAt: "2026-09-01" }),
    student({ id: "stu-3", parentId: "usr-p2", firstName: "Oumar", lastName: "Coulibaly", birthDate: "2013-11-20", gender: "M", section: "college", status: "valide", classId: "cls-6", createdAt: "2026-09-04" }),
    student({ id: "stu-4", parentId: "usr-p2", firstName: "Mariam", lastName: "Coulibaly", birthDate: "2019-01-09", gender: "F", section: "primaire", status: "en_attente_paiement", createdAt: "2026-10-21" }),
    student({ id: "stu-5", parentId: "usr-p3", firstName: "Souleymane", lastName: "Traoré", birthDate: "2018-08-27", gender: "M", section: "primaire", status: "en_attente_paiement", createdAt: "2026-10-24" }),
    student({ id: "stu-6", parentId: "usr-p4", firstName: "Hawa", lastName: "Keïta", birthDate: "2022-02-15", gender: "F", section: "jardin", status: "valide", classId: "cls-1", createdAt: "2026-09-06" }),
    student({ id: "stu-7", parentId: "usr-p5", firstName: "Abdoulaye", lastName: "Sangaré", birthDate: "2015-05-30", gender: "M", section: "primaire", status: "valide", classId: "cls-5", createdAt: "2026-09-02" }),
    student({ id: "stu-8", parentId: "usr-p6", firstName: "Fanta", lastName: "Konaté", birthDate: "2014-12-12", gender: "F", section: "college", status: "valide", classId: "cls-6", createdAt: "2026-09-08" }),
  ];

  const pay = (
    n: number,
    studentId: string,
    amount: number,
    type: PaymentType,
    method: PaymentMethod,
    date: string
  ): Payment => ({
    id: `pay-${n}`,
    studentId,
    receiptNumber: `IQ-2026-${String(n).padStart(4, "0")}`,
    amount,
    type,
    method,
    date,
    validatedBy: "Direction IQRA",
  });

  const payments: Payment[] = [
    pay(1, "stu-1", 25000, "inscription", "orange_money", "2026-09-03"),
    pay(2, "stu-2", 25000, "inscription", "wave", "2026-09-03"),
    pay(3, "stu-7", 222500, "solde", "orange_money", "2026-09-04"),
    pay(4, "stu-3", 25000, "inscription", "especes", "2026-09-08"),
    pay(5, "stu-3", 20000, "tenues", "especes", "2026-09-08"),
    pay(6, "stu-6", 25000, "inscription", "moov_money", "2026-09-09"),
    pay(7, "stu-8", 25000, "inscription", "wave", "2026-09-10"),
    pay(8, "stu-2", 165000, "solde", "wave", "2026-09-15"),
    pay(9, "stu-1", 100000, "acompte", "especes", "2026-09-20"),
    pay(10, "stu-6", 60000, "acompte", "orange_money", "2026-09-28"),
    pay(11, "stu-3", 105000, "acompte", "orange_money", "2026-10-02"),
    pay(12, "stu-8", 80000, "acompte", "especes", "2026-10-05"),
  ].reverse();

  const grade = (
    id: number,
    studentId: string,
    subject: SubjectId,
    score: number,
    remarks: string,
    date = "2026-10-24"
  ): GradeItem => ({ id: `grd-${id}`, studentId, subject, score, maxScore: 20, term: "t1", remarks, date });

  const grades: GradeItem[] = [
    grade(1, "stu-1", "quran", 18, "حفظ متقن وتلاوة جميلة، بارك الله فيها"),
    grade(2, "stu-1", "arabic", 16.5, "تقدّم ملحوظ في القراءة والكتابة"),
    grade(3, "stu-1", "tawhid_fiqh", 18.5, "مواظبة ممتازة وفهم جيّد"),
    grade(4, "stu-1", "french", 15, "Bonne expression écrite, continue ainsi."),
    grade(5, "stu-1", "maths", 17, "Excellent raisonnement, très appliquée."),
    grade(6, "stu-2", "quran", 19, "ما شاء الله، حفظ سريع ونطق سليم"),
    grade(7, "stu-2", "french", 16, "Très bon éveil, enfant curieux et souriant."),
    grade(8, "stu-3", "quran", 15, "حفظ جيّد، يحتاج إلى مراجعة أكثر"),
    grade(9, "stu-3", "arabic", 14, "مستوى جيّد في القواعد"),
    grade(10, "stu-3", "french", 13.5, "Des efforts à poursuivre en rédaction."),
    grade(11, "stu-3", "maths", 16, "Très bon niveau, sérieux en classe."),
    grade(12, "stu-3", "sciences", 14.5, "Bonne participation."),
    grade(13, "stu-3", "english", 12, "Peut mieux faire à l'oral."),
    grade(14, "stu-7", "quran", 17.5, "حافظ متميّز، قدوة لزملائه"),
    grade(15, "stu-7", "maths", 18, "Excellent travail, félicitations."),
    grade(16, "stu-7", "sira_adab", 16, "أدب رفيع وسلوك حسن"),
  ];

  const notifications: NotificationItem[] = [
    { id: "ntf-1", parentId: "usr-p1", kind: "welcome", date: "2026-09-01", isRead: true },
    { id: "ntf-2", parentId: "usr-p1", studentId: "stu-1", kind: "payment_confirmed", amount: 100000, receiptNumber: "IQ-2026-0009", date: "2026-09-20", isRead: true },
    { id: "ntf-3", parentId: "usr-p1", studentId: "stu-1", kind: "grade_published", subject: "quran", date: "2026-10-24", isRead: false },
    { id: "ntf-4", parentId: "usr-p1", studentId: "stu-1", kind: "reminder", amount: 97500, date: "2026-10-26", isRead: false },
    { id: "ntf-5", parentId: "usr-p2", kind: "welcome", date: "2026-09-04", isRead: true },
    { id: "ntf-6", parentId: "usr-p2", studentId: "stu-4", kind: "enrollment_received", date: "2026-10-21", isRead: false },
    { id: "ntf-7", parentId: "usr-p2", studentId: "stu-3", kind: "reminder", amount: 105000, date: "2026-10-26", isRead: false },
  ];

  return { version: DB_VERSION, users, students, payments, notifications, grades, classes };
}

// --------------------------------------------------------------------
// Lecture / écriture
// --------------------------------------------------------------------

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed.version === DB_VERSION) return parsed;
    }
  } catch {
    // stockage indisponible ou corrompu : on repart du seed
  }
  const seed = createSeed();
  saveDB(seed);
  return seed;
}

/** Sauvegarde ; si le quota est dépassé, on retire les aperçus de documents et on réessaie */
export function saveDB(db: DB): boolean {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch {
    try {
      const light: DB = {
        ...db,
        students: db.students.map((s) => ({
          ...s,
          documents: Object.fromEntries(
            Object.entries(s.documents).map(([k, d]) => [k, d ? { ...d, dataUrl: undefined } : d])
          ),
        })),
      };
      localStorage.setItem(DB_KEY, JSON.stringify(light));
    } catch {
      // navigation privée ou stockage bloqué : les données restent en mémoire
    }
    return false;
  }
}

export function resetDB(): DB {
  const seed = createSeed();
  saveDB(seed);
  return seed;
}

export function loadSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function saveSessionUserId(id: string | null) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = { DB_KEY, SESSION_KEY };

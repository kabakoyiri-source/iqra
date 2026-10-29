/**
 * Base de données locale (localStorage) avec jeu de données initial (seed).
 * Remplace Supabase pour la démo : toutes les fonctions du contexte passent par ici,
 * ce qui permettra de rebrancher un vrai backend sans toucher aux pages.
 */

import {
  REGISTRATION_FEE,
  SUBJECTS_BY_SECTION,
  UNIFORM_FEE,
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
  /** Enseignant titulaire */
  teacher?: string;
  capacity?: number;
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
const DB_VERSION = 2;

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Date locale au format AAAA-MM-JJ */
export function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Numéro de reçu suivant, unique même après suppression d'élèves */
export function nextReceiptNumber(payments: Payment[]) {
  const max = payments.reduce((m, p) => Math.max(m, Number(p.receiptNumber.split("-").pop()) || 0), 0);
  return `IQ-2026-${String(max + 1).padStart(4, "0")}`;
}

// --------------------------------------------------------------------
// Seed — familles, élèves, paiements, notes et classes de démonstration
// --------------------------------------------------------------------

function demoDoc(name: string, type = "application/pdf", size = 240_000): DocFile {
  return { name, type, size };
}

/** Générateur pseudo-aléatoire déterministe (mêmes notes à chaque réinitialisation) */
function prng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const AR_SUBJECTS: SubjectId[] = ["quran", "arabic", "tawhid_fiqh", "sira_adab"];

/** Appréciations par tranche de note : arabe pour les matières arabes, français sinon */
const REMARKS = {
  ar: [
    ["عمل ممتاز، بارك الله في جهوده", "حفظ متقن وأداء رائع", "مستوى متميّز، واصل على هذا النحو"],
    ["جيّد جدًا، مواظبة واجتهاد", "تقدّم ملحوظ هذا الفصل", "عمل جيّد ومشاركة فعّالة"],
    ["مقبول، يحتاج إلى مزيد من المراجعة", "مستوى متوسط ويمكن تحقيق الأفضل"],
    ["ضعيف، يجب مضاعفة الجهد", "يحتاج إلى متابعة منتظمة في البيت"],
  ],
  fr: [
    ["Excellent travail, félicitations.", "Très bon niveau, élève sérieux.", "Remarquable, continue ainsi."],
    ["Bon travail, belle progression.", "Bien, élève appliqué.", "Résultats satisfaisants."],
    ["Assez bien, peut mieux faire.", "Des efforts à poursuivre."],
    ["Insuffisant, il faut se ressaisir.", "Travail irrégulier, à surveiller."],
  ],
};

/** Scénario de paiement d'un élève du seed */
type Plan = "full" | "reg" | "reg_acompte" | "reg_uni_acompte" | "none";

function createSeed(): DB {
  const parent = (id: string, fullName: string, email: string, phone: string, createdAt: string): StoredUser => ({
    id,
    fullName,
    email,
    phone,
    role: "parent",
    password: "parent123",
    createdAt,
  });

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
    parent("usr-p1", "Fatoumata Diallo", "fatoumata.diallo@gmail.com", "+223 76 45 12 30", "2026-09-01"),
    parent("usr-p2", "Moussa Coulibaly", "moussa.coulibaly@gmail.com", "+223 66 18 40 27", "2026-09-04"),
    parent("usr-p3", "Awa Traoré", "awa.traore@gmail.com", "+223 79 02 55 61", "2026-10-20"),
    parent("usr-p4", "Boubacar Keïta", "boubacar.keita@gmail.com", "+223 65 33 71 09", "2026-09-06"),
    parent("usr-p5", "Kadiatou Sangaré", "kadiatou.sangare@gmail.com", "+223 70 41 26 88", "2026-09-02"),
    parent("usr-p6", "Seydou Konaté", "seydou.konate@gmail.com", "+223 75 90 14 52", "2026-09-08"),
    parent("usr-p7", "Mariam Touré", "mariam.toure@gmail.com", "+223 76 12 98 34", "2026-09-03"),
    parent("usr-p8", "Amadou Cissé", "amadou.cisse@gmail.com", "+223 66 74 03 19", "2026-09-05"),
    parent("usr-p9", "Rokia Dembélé", "rokia.dembele@gmail.com", "+223 79 55 21 70", "2026-09-07"),
    parent("usr-p10", "Ibrahim Maïga", "ibrahim.maiga@gmail.com", "+223 65 08 47 92", "2026-09-09"),
    parent("usr-p11", "Assétou Sidibé", "assetou.sidibe@gmail.com", "+223 70 63 82 15", "2026-09-10"),
    parent("usr-p12", "Mamadou Doumbia", "mamadou.doumbia@gmail.com", "+223 76 27 59 03", "2026-09-11"),
    parent("usr-p13", "Oumou Sylla", "oumou.sylla@gmail.com", "+223 66 92 30 48", "2026-09-14"),
    parent("usr-p14", "Bakary Camara", "bakary.camara@gmail.com", "+223 75 16 44 81", "2026-09-15"),
  ];

  const classes: ClassItem[] = [
    { id: "cls-1", name: "Petite section — القسم الصغير", section: "jardin", academicYear: "2026/2027", teacher: "Mme Kanté", capacity: 20 },
    { id: "cls-2", name: "Grande section — القسم الكبير", section: "jardin", academicYear: "2026/2027", teacher: "Mme Diarra", capacity: 20 },
    { id: "cls-3", name: "1ère année — السنة الأولى", section: "primaire", academicYear: "2026/2027", teacher: "M. Ousmane Traoré", capacity: 30 },
    { id: "cls-4", name: "4e année A — السنة الرابعة أ", section: "primaire", academicYear: "2026/2027", teacher: "Mme Haïdara", capacity: 30 },
    { id: "cls-5", name: "6e année — السنة السادسة", section: "primaire", academicYear: "2026/2027", teacher: "Oustaz Bah", capacity: 30 },
    { id: "cls-6", name: "8e année — السنة الثامنة", section: "college", academicYear: "2026/2027", teacher: "M. Seydou Coulibaly", capacity: 35 },
  ];

  // [id, parent, prénom, nom, naissance, genre, cycle, classe, plan, acompte, santé]
  const rows: [string, string, string, string, string, "M" | "F", SectionId, string | null, Plan, number, string?][] = [
    ["stu-1", "usr-p1", "Aïcha", "Diallo", "2017-03-14", "F", "primaire", "cls-4", "reg_acompte", 100000],
    ["stu-2", "usr-p1", "Ibrahim", "Diallo", "2021-06-02", "M", "jardin", "cls-2", "full", 0, "Allergie légère à l'arachide"],
    ["stu-3", "usr-p2", "Oumar", "Coulibaly", "2013-11-20", "M", "college", "cls-6", "reg_uni_acompte", 105000],
    ["stu-4", "usr-p2", "Mariam", "Coulibaly", "2019-01-09", "F", "primaire", null, "none", 0],
    ["stu-5", "usr-p3", "Souleymane", "Traoré", "2018-08-27", "M", "primaire", null, "none", 0, "Asthme — inhalateur dans le cartable"],
    ["stu-6", "usr-p4", "Hawa", "Keïta", "2022-02-15", "F", "jardin", "cls-1", "reg_acompte", 60000],
    ["stu-7", "usr-p5", "Abdoulaye", "Sangaré", "2015-05-30", "M", "primaire", "cls-5", "full", 0],
    ["stu-8", "usr-p6", "Fanta", "Konaté", "2014-12-12", "F", "college", "cls-6", "reg_acompte", 80000],
    ["stu-9", "usr-p7", "Youssouf", "Touré", "2020-02-18", "M", "primaire", "cls-3", "reg_uni_acompte", 90000],
    ["stu-10", "usr-p7", "Kadidia", "Touré", "2017-07-05", "F", "primaire", "cls-4", "full", 0],
    ["stu-11", "usr-p8", "Bintou", "Cissé", "2022-09-21", "F", "jardin", "cls-1", "full", 0],
    ["stu-12", "usr-p8", "Moussa", "Cissé", "2015-01-11", "M", "primaire", "cls-5", "reg", 0],
    ["stu-13", "usr-p9", "Adama", "Dembélé", "2013-04-03", "M", "college", "cls-6", "reg_uni_acompte", 150000],
    ["stu-14", "usr-p9", "Salimata", "Dembélé", "2017-10-28", "F", "primaire", "cls-4", "reg_acompte", 75000],
    ["stu-15", "usr-p10", "Khadija", "Maïga", "2020-05-16", "F", "primaire", "cls-3", "full", 0],
    ["stu-16", "usr-p10", "Issa", "Maïga", "2021-03-08", "M", "jardin", "cls-2", "reg_acompte", 50000],
    ["stu-17", "usr-p11", "Lassana", "Sidibé", "2016-12-01", "M", "primaire", "cls-4", "reg", 0],
    ["stu-18", "usr-p11", "Nana", "Sidibé", "2014-06-19", "F", "college", "cls-6", "full", 0],
    ["stu-19", "usr-p12", "Hamza", "Doumbia", "2019-11-23", "M", "primaire", "cls-3", "reg_acompte", 60000],
    ["stu-20", "usr-p12", "Fatim", "Doumbia", "2022-07-30", "F", "jardin", "cls-1", "reg_uni_acompte", 40000, "Port de lunettes"],
    ["stu-21", "usr-p13", "Ousmane", "Sylla", "2015-08-09", "M", "primaire", "cls-5", "reg_uni_acompte", 120000],
    ["stu-22", "usr-p14", "Aminata", "Camara", "2020-01-27", "F", "primaire", "cls-3", "reg_acompte", 80000],
    ["stu-23", "usr-p14", "Sekou", "Camara", "2012-10-14", "M", "college", null, "none", 0],
  ];

  const parentCreated = (pid: string) => users.find((u) => u.id === pid)!.createdAt;
  const methods: PaymentMethod[] = ["orange_money", "especes", "wave", "moov_money"];

  const students: StudentRecord[] = [];
  const rawPayments: Omit<Payment, "id" | "receiptNumber">[] = [];

  rows.forEach(([id, parentId, firstName, lastName, birthDate, gender, section, classId, plan, acompte, health], i) => {
    const pending = plan === "none";
    const createdAt = pending ? addDays(parentCreated(parentId), parentId === "usr-p2" ? 47 : 4) : parentCreated(parentId);
    const slug = firstName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const totalDue = totalDueFor(section);
    students.push({
      id,
      parentId,
      firstName,
      lastName,
      birthDate,
      gender,
      section,
      status: pending ? "en_attente_paiement" : "valide",
      classId: classId ?? undefined,
      healthNotes: health,
      documents: {
        birthCert: demoDoc(`acte_naissance_${slug}.pdf`),
        photo: demoDoc(`photo_${slug}.jpg`, "image/jpeg", 180_000),
        ...(i % 3 === 0 ? { healthRecord: demoDoc(`carnet_vaccination_${slug}.pdf`, "application/pdf", 320_000) } : {}),
      },
      totalDue,
      createdAt,
    });

    if (pending) return;
    const method = methods[i % methods.length];
    const pay = (type: PaymentType, amount: number, days: number, m: PaymentMethod = method) =>
      rawPayments.push({ studentId: id, amount, type, method: m, date: addDays(createdAt, days), validatedBy: "Direction IQRA" });

    pay("inscription", REGISTRATION_FEE, 2);
    if (plan === "full") pay("solde", totalDue - REGISTRATION_FEE, 9 + (i % 5));
    if (plan === "reg_uni_acompte") pay("tenues", UNIFORM_FEE[section], 2, "especes");
    if (plan === "reg_acompte" || plan === "reg_uni_acompte") pay("acompte", acompte, 18 + (i % 9));
  });

  // Reçus numérotés dans l'ordre chronologique, affichés du plus récent au plus ancien
  const payments: Payment[] = rawPayments
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p, n) => ({ ...p, id: `pay-${n + 1}`, receiptNumber: `IQ-2026-${String(n + 1).padStart(4, "0")}` }))
    .reverse();

  // Notes du 1er trimestre pour chaque élève affecté à une classe
  const rand = prng(2026);
  const grades: GradeItem[] = [];
  students
    .filter((s) => s.classId)
    .forEach((s) => {
      const level = 9.5 + rand() * 8.5;
      SUBJECTS_BY_SECTION[s.section].forEach((subject) => {
        const score = Math.max(4, Math.min(20, Math.round((level + (rand() - 0.5) * 6) * 2) / 2));
        const band = score >= 16 ? 0 : score >= 13 ? 1 : score >= 10 ? 2 : 3;
        const pool = REMARKS[AR_SUBJECTS.includes(subject) ? "ar" : "fr"][band];
        grades.push({
          id: `grd-${grades.length + 1}`,
          studentId: s.id,
          subject,
          score,
          maxScore: 20,
          term: "t1",
          remarks: pool[Math.floor(rand() * pool.length)],
          date: addDays("2026-10-20", Math.floor(rand() * 6)),
        });
      });
    });

  const paidOf = (sid: string) => payments.filter((p) => p.studentId === sid).reduce((a, p) => a + p.amount, 0);
  const remainingOf = (s: StudentRecord) => s.totalDue - paidOf(s.id);

  const notifications: NotificationItem[] = [];
  const notify = (n: Omit<NotificationItem, "id">) => notifications.push({ ...n, id: `ntf-${notifications.length + 1}` });

  users
    .filter((u) => u.role === "parent")
    .forEach((u) => notify({ parentId: u.id, kind: "welcome", date: u.createdAt, isRead: true }));
  students.forEach((s) => {
    if (s.status === "en_attente_paiement") {
      notify({ parentId: s.parentId, studentId: s.id, kind: "enrollment_received", date: s.createdAt, isRead: false });
      return;
    }
    const last = payments.find((p) => p.studentId === s.id);
    if (last) {
      notify({
        parentId: s.parentId,
        studentId: s.id,
        kind: "payment_confirmed",
        amount: last.amount,
        receiptNumber: last.receiptNumber,
        date: last.date,
        isRead: true,
      });
    }
    if (s.classId) notify({ parentId: s.parentId, studentId: s.id, kind: "grade_published", subject: "quran", date: "2026-10-25", isRead: false });
    if (remainingOf(s) > 0 && ["stu-1", "stu-3", "stu-12", "stu-17"].includes(s.id)) {
      notify({ parentId: s.parentId, studentId: s.id, kind: "reminder", amount: remainingOf(s), date: "2026-10-26", isRead: false });
    }
  });
  notifications.sort((a, b) => b.date.localeCompare(a.date));

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

/**
 * Données de référence du Complexe Scolaire IQRA.
 * Les textes affichés (FR / AR) vivent dans `lib/i18n.ts` ; ici uniquement les
 * valeurs communes aux deux langues (contacts, montants, identifiants).
 *
 * ⚠️ Montants et dates = valeurs de démonstration, à confirmer par l'école.
 */

export const SCHOOL = {
  name: "IQRA",
  year: "2026/2027",
  phones: ["+223 72 22 07 03", "+223 70 99 10 00"],
  whatsapp: "22372220703",
  email: "complexescolaireiqra@gmail.com",
  instagram: "complexescolaireiqra",
} as const;

export const SECTION_IDS = ["jardin", "primaire", "college"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Scolarité annuelle par cycle (FCFA) */
export const TUITION: Record<SectionId, number> = {
  jardin: 150000,
  primaire: 180000,
  college: 210000,
};

/** Frais d'inscription (FCFA) */
export const REGISTRATION_FEE = 25000;

/** Tenues scolaires — 2 tenues (FCFA) */
export const UNIFORM_FEE: Record<SectionId, number> = {
  jardin: 15000,
  primaire: 17500,
  college: 20000,
};

export function totalDueFor(section: SectionId) {
  return TUITION[section] + REGISTRATION_FEE + UNIFORM_FEE[section];
}

export const SUBJECT_IDS = [
  "quran",
  "arabic",
  "tawhid_fiqh",
  "sira_adab",
  "french",
  "maths",
  "sciences",
  "english",
] as const;
export type SubjectId = (typeof SUBJECT_IDS)[number];

export const TERM_IDS = ["t1", "t2", "t3"] as const;
export type TermId = (typeof TERM_IDS)[number];

export const PAYMENT_TYPES = ["inscription", "acompte", "solde", "tenues"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_METHODS = ["especes", "orange_money", "wave", "moov_money"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CAMP_POSTERS = [
  { src: "/camp/vacances-qui-marquent.jpg", key: "vacances" },
  { src: "/camp/pourquoi-le-camp.jpg", key: "pourquoi" },
  { src: "/camp/programme-educatif.jpg", key: "programme" },
  { src: "/camp/inscriptions-ouvertes.jpg", key: "inscriptions" },
] as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${SCHOOL.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string) {
  return `tel:${phone.replaceAll(" ", "")}`;
}

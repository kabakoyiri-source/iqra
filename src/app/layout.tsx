import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Baloo_Bhaijaan_2, Cairo, Amiri, Aref_Ruqaa } from "next/font/google";
import { SchoolProvider } from "@/context/SchoolContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { DEFAULT_LANG, DICTIONARIES, LANG_COOKIE, isLang, type Lang } from "@/lib/i18n";
import "./globals.css";

const baloo = Baloo_Bhaijaan_2({
  variable: "--font-baloo",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700", "800"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
});

const ruqaa = Aref_Ruqaa({
  variable: "--font-ruqaa",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = DICTIONARIES[await getLang()];
  // Le site a son propre sélecteur de langue : on empêche la traduction
  // automatique du navigateur, qui réécrit le DOM et bloque le retour à l'arabe.
  return { title: meta.title, description: meta.description, other: { google: "notranslate" } };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      translate="no"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${baloo.variable} ${cairo.variable} ${amiri.variable} ${ruqaa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLang={lang}>
          <SchoolProvider>{children}</SchoolProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

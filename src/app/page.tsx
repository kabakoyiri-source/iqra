import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Sections } from "@/components/landing/Sections";
import { Values } from "@/components/landing/Values";
import { Programme } from "@/components/landing/Programme";
import { Camp } from "@/components/landing/Camp";
import { Pricing } from "@/components/landing/Pricing";
import { Admissions } from "@/components/landing/Admissions";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Sections />
        <Values />
        <Programme />
        <Camp />
        <Pricing />
        <Admissions />
      </main>
      <Footer />
    </>
  );
}

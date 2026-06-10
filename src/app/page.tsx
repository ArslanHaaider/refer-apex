import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { LogoCloud } from "@/components/landing/logo-cloud";
import { ProblemStatement } from "@/components/landing/problem-statement";
import { PlatformShowcase } from "@/components/landing/platform-showcase";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LogoCloud />
        <ProblemStatement />
        <PlatformShowcase />
        <Pricing />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}

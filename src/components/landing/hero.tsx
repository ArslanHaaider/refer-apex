import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { TRUST_BADGES } from "@/lib/landing-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HighlightHeadlineAccent } from "@/components/landing/highlight-headline-accent";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-emerald-50/50 py-16 lg:py-24">
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[32rem] w-[32rem] rounded-full bg-emerald-200/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.2fr)] lg:gap-8 xl:gap-12">
          <div className="relative z-10 max-w-xl lg:max-w-none">
            <h1
              className="max-w-[34rem] text-[40px] font-bold leading-[1.1] tracking-tight text-balance text-charcoal sm:text-[48px]"
              aria-label="The Only Growth Engine That Your Practice Will Ever Need"
            >
              The Only <HighlightHeadlineAccent /> That Your Practice Will
              Ever Need
            </h1>
            <p className="mt-6 max-w-lg text-lg font-normal leading-relaxed text-gray-500">
              Put your growth on autopilot. Our AI seamlessly collects reviews,
              drives referrals, and brings clients back—with zero extra work for
              your team.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex flex-col items-start gap-2">
                <Button.PrimaryLink href="#pricing" size="lg" className="group">
                Book Demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button.PrimaryLink>
              </div>
              <Button.OutlineLink href="#cta" size="lg" className="sm:mt-0">
                Get Started
              </Button.OutlineLink>
            </div>
            <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
              {TRUST_BADGES.filter((badge) => !badge.startsWith("Trusted by")).map((badge) => (
                <li key={badge} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10">
                    <Check className="h-3 w-3 text-emerald" strokeWidth={3} />
                  </span>
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative -mx-4 sm:-mx-0 lg:mx-0 lg:-mr-8 xl:-mr-16 2xl:-mr-24">
            <div
              className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-[2rem] bg-gradient-to-br from-emerald-100/60 via-blue-50/40 to-transparent blur-2xl"
              aria-hidden="true"
            />

            <div className="relative w-full motion-safe:animate-hero-pop lg:w-[115%] lg:max-w-none xl:w-[120%]">
              <Image
                src="/images/landing/hero-dashboard.png"
                alt="Iqrava dashboard overview showing review stats, growth chart, and sentiment analysis"
                width={1376}
                height={768}
                priority
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="h-auto w-full drop-shadow-[0_28px_56px_rgba(16,185,129,0.18)]"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

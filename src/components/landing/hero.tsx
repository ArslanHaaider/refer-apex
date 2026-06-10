import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { TRUST_BADGES } from "@/lib/landing-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-emerald-50/50 py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-charcoal sm:text-[48px]">
              Turn Every Client Visit Into More Reviews, Referrals, and Repeat
              Bookings
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              AI-powered automation that helps med spas collect more reviews,
              generate referrals, and bring clients back — without adding to
              your team&apos;s workload.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button.PrimaryLink href="#pricing" size="lg" className="group">
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button.PrimaryLink>
              <Button.OutlineLink href="#cta" size="lg">
                Book Demo
              </Button.OutlineLink>
            </div>
            <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
              {TRUST_BADGES.map((badge) => (
                <li key={badge} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10">
                    <Check className="h-3 w-3 text-emerald" strokeWidth={3} />
                  </span>
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-md">
              <Image
                src="/images/landing/hero-dashboard.svg"
                alt="ReferApex dashboard overview showing review stats and growth chart"
                width={800}
                height={600}
                priority
                className="h-auto w-full"
              />
            </div>

            <div className="absolute -bottom-4 -right-2 w-48 rounded-xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-md sm:-right-4 sm:w-56">
              <p className="text-xs font-medium text-gray-600">Sentiment Analysis</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray="92 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-charcoal">92%</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald">Positive</p>
                  <p className="text-xs text-gray-600">Last 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import Image from "next/image";
import { Check, TrendingUp } from "lucide-react";
import {
  PLATFORM_FEATURES,
  PLATFORM_STATS,
  TIMELINE_STEPS,
} from "@/lib/landing-data";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function PlatformShowcase() {
  return (
    <Section.Root className="bg-gradient-to-br from-blue-50/50 to-emerald-50/50">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="relative lg:col-span-3">
            <Section.Eyebrow>All-in-One Platform</Section.Eyebrow>
            <Section.Heading className="text-[28px] sm:text-[32px]">
              One Dashboard for Your Entire Client Journey
            </Section.Heading>
            <ul className="mt-6 space-y-3">
              {PLATFORM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-gray-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">New Referral</p>
                    <p className="text-2xl font-bold text-emerald">+2</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-emerald" />
                </div>
                <svg className="mt-2 h-8 w-full" viewBox="0 0 120 32" preserveAspectRatio="none">
                  <polyline
                    points="0,28 20,24 40,20 60,18 80,12 100,8 120,4"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="rounded-xl border border-gray-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-md">
                <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-charcoal">AED 124,850</p>
                <p className="mt-1 text-xs text-emerald">+12% this month</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-md">
              <Image
                src="/images/landing/reviews-screen.svg"
                alt="ReferApex reviews management screen"
                width={960}
                height={600}
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-md">
              <h3 className="text-lg font-semibold text-charcoal">Client Timeline</h3>
              <p className="mt-1 text-sm text-gray-600">Sarah M. — Hydrafacial</p>
              <ol className="mt-6 space-y-0">
                {TIMELINE_STEPS.map((step, index) => {
                  const isLast = index === TIMELINE_STEPS.length - 1;
                  const isCompleted = step.status === "completed";
                  const isCurrent = step.status === "current";

                  return (
                    <li key={step.label} className="relative flex gap-3 pb-6 last:pb-0">
                      {!isLast ? (
                        <span
                          className={`absolute left-[11px] top-6 h-full w-0.5 ${
                            isCompleted ? "bg-emerald" : "bg-gray-200"
                          }`}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-emerald text-white"
                            : isCurrent
                              ? "border-2 border-emerald bg-white"
                              : "border-2 border-gray-200 bg-white"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          <span
                            className={`h-2 w-2 rounded-full ${isCurrent ? "bg-emerald" : "bg-gray-200"}`}
                          />
                        )}
                      </span>
                      <div className="pt-0.5">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent ? "text-emerald" : "text-charcoal"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-gray-200/60 bg-white p-6 shadow-lg sm:grid-cols-4 sm:gap-8 sm:p-8">
          {PLATFORM_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-emerald sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section.Root>
  );
}

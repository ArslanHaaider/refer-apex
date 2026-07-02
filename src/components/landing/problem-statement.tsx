 "use client";

import { useEffect, useRef, useState } from "react";
import { PROBLEMS, PROBLEM_STATS } from "@/lib/landing-data";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function ProblemStatement() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const problemRefs = useRef<Array<HTMLElement | null>>([]);
  const kpiRef = useRef<HTMLDListElement | null>(null);
  const [activeProblemCount, setActiveProblemCount] = useState(0);
  const [kpiActive, setKpiActive] = useState(false);

  useEffect(() => {
    const updateActiveStates = () => {
      if (!sectionRef.current) return;

      const viewportHeight = window.innerHeight;
      const triggerLine = viewportHeight * 0.38;
      const perCardScrollDistance = Math.max(
        90,
        Math.min(140, viewportHeight * 0.14),
      );
      const kpiActivationOffset = 36;
      const firstCard = problemRefs.current[0];

      if (!firstCard) return;

      const firstCardTriggerScrollY =
        window.scrollY + firstCard.getBoundingClientRect().top - triggerLine;
      const scrollPastTrigger = window.scrollY - firstCardTriggerScrollY;

      const nextActiveProblemCount =
        scrollPastTrigger < 0
          ? 0
          : Math.min(
              PROBLEMS.length,
              Math.floor(scrollPastTrigger / perCardScrollDistance) + 1,
            );
      setActiveProblemCount(nextActiveProblemCount);

      if (!kpiRef.current) return;
      const hasLastProblemActivated = nextActiveProblemCount >= PROBLEMS.length;
      const kpiThresholdScroll =
        PROBLEMS.length * perCardScrollDistance + kpiActivationOffset;
      // Trigger KPI cards together shortly after the final problem card is active.
      setKpiActive(hasLastProblemActivated && scrollPastTrigger >= kpiThresholdScroll);
    };

    let rafId = 0;
    const onScrollOrResize = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        updateActiveStates();
        rafId = 0;
      });
    };

    updateActiveStates();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <Section.Root
      id="problems"
      ref={sectionRef}
      className="relative overflow-x-clip border-t border-gray-200/60 bg-gradient-to-br from-off-white via-white to-emerald-50/40 py-24"
    >
      <div
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] lg:gap-20">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Section.Eyebrow className="mb-3">The Challenge</Section.Eyebrow>
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">
              <span className="text-charcoal">Growth gaps </span>
              <span className="bg-gradient-to-r from-emerald to-emerald-dark bg-clip-text text-transparent">
                cost more than acquisition
              </span>
            </h2>
            <Section.Body className="max-w-md text-gray-600">
              Satisfied clients and strong outcomes are already there. What most
              practices lack is the structure to turn that goodwill into
              referrals, rebookings, and measurable revenue.
            </Section.Body>
          </aside>

          <div className="space-y-3">
            {PROBLEMS.map((problem, index) => {
              const isActive = activeProblemCount > index;

              return (
              <article
                key={problem.title}
                ref={(element) => {
                  problemRefs.current[index] = element;
                }}
                className={`group relative overflow-hidden rounded-2xl border px-5 py-6 backdrop-blur-sm transition-all duration-300 sm:px-6 sm:py-7 ${
                  isActive
                    ? "-translate-y-1 border-emerald/25 bg-white shadow-lg shadow-emerald/8"
                    : "border-gray-200/70 bg-white/60"
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 w-1 origin-top rounded-r-full bg-gradient-to-b from-emerald to-emerald-dark transition-transform duration-300 ${
                    isActive ? "scale-y-100" : "scale-y-0"
                  }`}
                  aria-hidden="true"
                />

                <div className="flex gap-5 sm:gap-7">
                  <span
                    aria-hidden="true"
                    className={`w-8 shrink-0 pt-0.5 text-sm font-semibold tabular-nums transition-all duration-300 sm:w-10 ${
                      isActive ? "scale-110 text-emerald" : "text-gray-300"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-base font-semibold transition-colors duration-300 sm:text-lg ${
                        isActive ? "text-emerald" : "text-charcoal"
                      }`}
                    >
                      {problem.title}
                    </h3>
                    <p
                      className={`mt-2 max-w-2xl text-sm leading-relaxed transition-colors duration-300 sm:text-base ${
                        isActive ? "text-gray-600/90" : "text-gray-600"
                      }`}
                    >
                      {problem.description}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`hidden shrink-0 self-center text-emerald transition-all duration-300 sm:inline ${
                      isActive ? "translate-x-0.5 opacity-100" : "opacity-0"
                    }`}
                  >
                    →
                  </span>
                </div>
              </article>
              );
            })}
          </div>
        </div>

        <dl
          ref={kpiRef}
          className="mt-14 grid gap-4 border-t border-gray-200/80 pt-10 sm:grid-cols-3"
        >
          {PROBLEM_STATS.map((stat) => {
            const isActive = kpiActive;

            return (
              <div
                key={stat.label}
                className={`rounded-xl border px-4 py-4 transition-all duration-300 ${
                  isActive
                    ? "-translate-y-0.5 border-emerald/20 bg-white shadow-md shadow-emerald/5"
                    : "border-gray-200/70 bg-white/70"
                }`}
              >
                <dt
                  className={`text-2xl font-semibold tracking-tight transition-colors duration-300 ${
                    isActive ? "text-emerald" : "text-charcoal"
                  }`}
                >
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm leading-snug text-gray-600">
                  {stat.label}
                </dd>
              </div>
            );
          })}
        </dl>
      </Container>
    </Section.Root>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Brain,
  CalendarX,
  EyeOff,
  MessageSquareWarning,
  PhoneMissed,
  Puzzle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PROBLEMS } from "@/lib/landing-data";
import { Container } from "@/components/ui/container";

const iconMap: Record<(typeof PROBLEMS)[number]["icon"], LucideIcon> = {
  brain: Brain,
  "eye-off": EyeOff,
  "calendar-x": CalendarX,
  "message-square-warning": MessageSquareWarning,
  "phone-missed": PhoneMissed,
  puzzle: Puzzle,
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function ProblemStatement() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { ref: headerRef, inView: headerInView } = useInView(0.4);
  const { ref: gridRef, inView: gridInView } = useInView(0.08);

  return (
    <section
      id="problems"
      className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-emerald-50/30 py-20"
    >
      {/* Decorative blobs — same language as Hero */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-emerald-200/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        {/* Header */}
        <div
          ref={headerRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
            headerInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/10 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-emerald uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
            The Problem
          </span>
          <h2 className="mt-6 text-[36px] font-bold leading-[1.1] tracking-tight text-charcoal sm:text-[44px]">
            Stop leaving your growth
            <br className="hidden sm:block" /> to chance.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-gray-500">
            Every missed referral and quiet return visit is revenue slipping through your fingers.
          </p>
        </div>

        {/* Cards grid */}
        <div
          ref={gridRef}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PROBLEMS.map((problem, index) => {
            const Icon = iconMap[problem.icon];
            const isActive = activeIndex === index;
            const isDimmed = activeIndex !== null && !isActive;

            return (
              <article
                key={problem.title}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`group relative cursor-default overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
                  gridInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                } ${
                  isActive
                    ? "-translate-y-1.5 border-emerald/40 shadow-[0_8px_40px_-8px_rgba(16,185,129,0.22)]"
                    : isDimmed
                      ? "border-gray-100 opacity-60"
                      : "border-gray-200/80 shadow-sm hover:border-gray-300"
                }`}
                style={{ transitionDelay: gridInView ? `${index * 80}ms` : "0ms" }}
              >
                {/* Faded background number */}
                <span
                  className="pointer-events-none absolute -right-1 -top-2 select-none text-8xl font-extrabold leading-none text-gray-100"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="relative mb-5 inline-flex">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive ? "bg-emerald/15" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-300 ${
                        isActive ? "text-emerald" : "text-gray-400"
                      }`}
                      strokeWidth={1.75}
                    />
                  </div>
                  {isActive && (
                    <span
                      className="absolute inset-0 animate-ping rounded-xl bg-emerald/20 motion-reduce:hidden"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <h3
                  className={`text-base font-semibold leading-snug transition-colors duration-300 ${
                    isActive ? "text-emerald" : "text-charcoal"
                  }`}
                >
                  {problem.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  {problem.description}
                </p>

                {/* Sliding emerald accent at bottom */}
                <div
                  className={`absolute bottom-0 left-0 h-0.5 w-full origin-left rounded-full bg-emerald transition-transform duration-500 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                  aria-hidden="true"
                />
              </article>
            );
          })}
        </div>

        {/* Stats row */}
        <div
          className={`mt-12 grid grid-cols-3 divide-x divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-700 delay-500 motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
            gridInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {(
            [
              { value: "73%", label: "of clients never refer without a prompt" },
              { value: "2.4×", label: "more bookings with automated follow-ups" },
              { value: "$6,200", label: "avg. annual revenue lost per inactive client" },
            ] as const
          ).map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center gap-1 px-4 py-6 text-center"
            >
              <span className="text-2xl font-bold text-emerald sm:text-3xl">{stat.value}</span>
              <span className="text-xs leading-snug text-gray-500 sm:text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

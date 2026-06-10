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
import { Section } from "@/components/ui/section";

const iconMap: Record<(typeof PROBLEMS)[number]["icon"], LucideIcon> = {
  brain: Brain,
  "eye-off": EyeOff,
  "calendar-x": CalendarX,
  "message-square-warning": MessageSquareWarning,
  "phone-missed": PhoneMissed,
  puzzle: Puzzle,
};

export function ProblemStatement() {
  return (
    <Section.Root id="problems" className="bg-white">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Section.Eyebrow>The Problem</Section.Eyebrow>
          <Section.Heading>
            Your strongest growth channel is running on autopilot — and not in a
            good way
          </Section.Heading>
          <Section.Body className="text-center">
            Every missed referral, every quiet return visit that never happens,
            and every lead that slips into voicemail isn&apos;t just a lost
            opportunity — it&apos;s revenue that was already within reach.
          </Section.Body>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PROBLEMS.map((problem) => {
            const Icon = iconMap[problem.icon];
            return (
              <article
                key={problem.title}
                className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10">
                  <Icon className="h-5 w-5 text-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal">{problem.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  {problem.description}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </Section.Root>
  );
}

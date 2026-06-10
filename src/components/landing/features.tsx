import {
  BarChart3,
  Calendar,
  MessageCircle,
  Shield,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FEATURES } from "@/lib/landing-data";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const iconMap: Record<(typeof FEATURES)[number]["icon"], LucideIcon> = {
  star: Star,
  shield: Shield,
  "message-circle": MessageCircle,
  users: Users,
  calendar: Calendar,
  "bar-chart": BarChart3,
};

export function Features() {
  return (
    <Section.Root id="features" className="bg-white">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Section.Eyebrow>Features</Section.Eyebrow>
          <Section.Heading>Everything You Need to Grow Your Practice</Section.Heading>
          <Section.Body className="text-center">
            From first review request to repeat booking, ReferApex automates the
            client journey so your team can focus on treatments.
          </Section.Body>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10">
                  <Icon className="h-5 w-5 text-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal">{feature.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </Section.Root>
  );
}

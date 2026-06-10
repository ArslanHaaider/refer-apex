"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  BarChart3,
  Calendar,
  Check,
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FEATURE_ITEMS } from "@/lib/landing-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  AiResponsesMockup,
  AnalyticsMockup,
  ReferralAutomationMockup,
  RepeatCampaignsMockup,
  ReviewGatekeepingMockup,
  ReviewRequestsMockup,
} from "./feature-mockups";

const iconMap: Record<(typeof FEATURE_ITEMS)[number]["icon"], LucideIcon> = {
  "message-circle": MessageCircle,
  shield: Shield,
  sparkles: Sparkles,
  users: Users,
  calendar: Calendar,
  "bar-chart": BarChart3,
};

const mockupMap: Record<
  (typeof FEATURE_ITEMS)[number]["mockup"],
  ComponentType<{ className?: string }>
> = {
  "review-requests": ReviewRequestsMockup,
  "review-gatekeeping": ReviewGatekeepingMockup,
  "ai-responses": AiResponsesMockup,
  "referral-automation": ReferralAutomationMockup,
  "repeat-campaigns": RepeatCampaignsMockup,
  analytics: AnalyticsMockup,
};

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold, rootMargin: "-10% 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

type FeatureRowProps = {
  feature: (typeof FEATURE_ITEMS)[number];
  index: number;
  onActive: (index: number) => void;
};

function FeatureRow({ feature, index, onActive }: FeatureRowProps) {
  const { ref, inView } = useInView();
  const isReversed = index % 2 === 1;
  const Icon = iconMap[feature.icon];
  const Mockup = mockupMap[feature.mockup];

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  const revealBase =
    "transition-all duration-700 ease-out motion-reduce:translate-x-0 motion-reduce:opacity-100";
  const textReveal = inView
    ? "translate-x-0 opacity-100"
    : isReversed
      ? "translate-x-8 opacity-0"
      : "-translate-x-8 opacity-0";
  const mockupReveal = inView
    ? "translate-x-0 opacity-100"
    : isReversed
      ? "-translate-x-8 opacity-0"
      : "translate-x-8 opacity-0";

  return (
    <div
      ref={ref}
      id={`feature-${feature.number}`}
      className="relative py-20 first:pt-0 last:pb-0"
    >
      <span
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-[10rem] font-bold leading-none text-gray-200/50 sm:text-[12rem] lg:text-[14rem] ${
          isReversed ? "right-0" : "left-0"
        }`}
        aria-hidden="true"
      >
        {feature.number}
      </span>

      <div
        className={`relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
          isReversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className={`${revealBase} ${textReveal}`}>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald text-white">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-2xl font-semibold text-charcoal">{feature.title}</h3>
          <p className="mt-3 text-base leading-relaxed text-gray-600">{feature.description}</p>
          <ul className="mt-6 space-y-3">
            {feature.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5 text-sm text-gray-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald/10">
                  <Check className="h-3 w-3 text-emerald" strokeWidth={3} />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${revealBase} delay-150 ${mockupReveal}`}>
          <Mockup />
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Section.Root
      id="features"
      className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-emerald-50/50"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Section.Eyebrow>Features</Section.Eyebrow>
          <Section.Heading>Everything You Need to Grow Your Practice</Section.Heading>
          <Section.Body className="text-center">
            From first review request to repeat booking, ReferApex automates the
            client journey so your team can focus on treatments.
          </Section.Body>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-600">
            Scroll to explore
            <ChevronDown className="h-4 w-4 motion-safe:animate-bounce" />
          </p>
        </div>

        <div className="relative mt-16 lg:mt-20">
          <aside
            className="pointer-events-none absolute top-0 left-0 hidden h-full w-12 lg:block xl:w-16"
            aria-label="Feature progress"
          >
            <div className="sticky top-32 flex h-[calc(100vh-8rem)] flex-col items-center">
              <div className="relative flex flex-1 flex-col items-center">
                <div className="absolute top-0 bottom-0 w-px bg-gray-200" />
                {FEATURE_ITEMS.map((item, i) => (
                  <div
                    key={item.number}
                    className="relative z-10 flex flex-1 flex-col items-center justify-center"
                  >
                    <span
                      className={`flex h-3 w-3 rounded-full transition-colors duration-300 ${
                        i <= activeIndex ? "bg-emerald" : "bg-gray-200"
                      }`}
                    />
                    <span
                      className={`mt-1 text-[10px] font-medium transition-colors duration-300 ${
                        i === activeIndex ? "text-emerald" : "text-gray-200"
                      }`}
                    >
                      {item.number}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-[10px] font-medium tracking-wide text-gray-600 uppercase">
                Your growth journey
              </p>
            </div>
          </aside>

          <div className="lg:pl-16 xl:pl-20">
            {FEATURE_ITEMS.map((feature, index) => (
              <FeatureRow
                key={feature.number}
                feature={feature}
                index={index}
                onActive={setActiveIndex}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-3xl bg-emerald px-6 py-10 text-center sm:px-12 sm:py-12">
          <h3 className="text-2xl font-semibold text-white sm:text-[28px]">
            Ready to Transform Your Practice?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/90">
            Start your free 14-day trial and see how ReferApex automates your
            entire growth engine.
          </p>
          <Button.PrimaryLink
            href="#pricing"
            size="lg"
            className="group mt-6 bg-white text-emerald hover:bg-off-white"
          >
            Start Your Free Trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button.PrimaryLink>
        </div>
      </Container>
    </Section.Root>
  );
}

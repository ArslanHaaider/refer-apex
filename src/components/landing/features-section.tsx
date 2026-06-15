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
  activeIndex: number;
  onActive: (index: number) => void;
};

function FeatureRow({ feature, index, activeIndex, onActive }: FeatureRowProps) {
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
      <div
        className="pointer-events-none absolute top-1/2 -left-12 z-20 hidden w-12 -translate-y-1/2 flex-col items-center lg:flex xl:-left-16 xl:w-16"
        aria-hidden={index !== activeIndex}
      >
        <span
          className={`flex h-4 w-4 rounded-full transition-colors duration-300 ${
            index <= activeIndex ? "bg-emerald" : "bg-gray-200"
          }`}
        />
        <span
          className={`mt-1.5 text-xs font-medium transition-colors duration-300 ${
            index === activeIndex ? "text-emerald" : "text-gray-400"
          }`}
        >
          {feature.number}
        </span>
      </div>

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
            className="pointer-events-none absolute top-0 bottom-0 left-0 hidden w-12 lg:block xl:w-16"
            aria-label="Feature progress"
          >
            <div className="absolute top-0 bottom-8 left-1/2 w-0.5 -translate-x-1/2 bg-gray-200" />
            <p className="absolute bottom-0 left-0 w-full text-center text-[10px] font-medium tracking-wide text-gray-600 uppercase">
              Your growth journey
            </p>
          </aside>

          <div className="lg:pl-16 xl:pl-20">
            {FEATURE_ITEMS.map((feature, index) => (
              <FeatureRow
                key={feature.number}
                feature={feature}
                index={index}
                activeIndex={activeIndex}
                onActive={setActiveIndex}
              />
            ))}
          </div>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-3xl bg-emerald px-6 py-10 text-center sm:px-12 sm:py-12">
          <div
            className="pointer-events-none absolute -top-16 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-12 left-1/4 h-40 w-40 rounded-full bg-emerald-dark/30 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <p className="mb-3 text-sm font-medium tracking-widest text-white/80 uppercase">
              Get started
            </p>
            <h3 className="mx-auto max-w-xl text-[28px] font-semibold leading-tight tracking-tight text-white sm:text-[32px]">
              Ready to Transform Your Practice?
            </h3>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/90">
              See how ReferApex automates reviews, referrals, and repeat
              bookings from one dashboard.
            </p>
            <Button.OutlineLink
              href="#cta"
              size="lg"
              className="group mt-6 border-0 bg-white text-emerald hover:bg-off-white"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button.OutlineLink>
            <p className="mt-4 text-sm text-white/80">
              Your team should be doing treatments, not chasing reviews — let
              us handle the follow-ups.
            </p>
          </div>
        </div>
      </Container>
    </Section.Root>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Activity, Check, Radar, RefreshCw, Share2, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AI_AGENTS, AI_TEAM_SECTION, type AiAgent } from "@/lib/ai-agents-data";
import { AGENT_VISUAL_MAP } from "./ai-agent-visuals";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const AGENT_ICONS: Record<AiAgent["id"], LucideIcon> = {
  scout: Radar,
  guardian: ShieldCheck,
  echo: Sparkles,
  connector: Share2,
  revive: RefreshCw,
  pulse: Activity,
};

const ACCENT_TEXT: Record<AiAgent["accent"], string> = {
  emerald: "text-emerald",
  amber: "text-amber-600",
  blue: "text-blue-600",
  violet: "text-violet-600",
  rose: "text-rose-600",
};

const ACCENT_ICON_BADGE: Record<AiAgent["accent"], string> = {
  emerald: "bg-emerald text-white",
  amber: "bg-amber-500 text-white",
  blue: "bg-blue-600 text-white",
  violet: "bg-violet-600 text-white",
  rose: "bg-rose-500 text-white",
};

const ACCENT_CHECK_BADGE: Record<AiAgent["accent"], string> = {
  emerald: "bg-emerald/10 text-emerald",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  violet: "bg-violet-100 text-violet-600",
  rose: "bg-rose-100 text-rose-600",
};

function useAgentInView(threshold = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin: "-20% 0px -20% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

type AgentBlockProps = {
  agent: AiAgent;
  index: number;
  onActive: (index: number) => void;
};

function AgentBlock({ agent, index, onActive }: AgentBlockProps) {
  const { ref, inView } = useAgentInView();
  const Icon = AGENT_ICONS[agent.id];
  const Visual = AGENT_VISUAL_MAP[agent.id];

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <div
      ref={ref}
      id={`ai-agent-${agent.id}`}
      className="flex min-h-[70vh] scroll-mt-28 flex-col justify-center py-14 first:pt-0 lg:min-h-[85vh] lg:py-0"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 24 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${ACCENT_ICON_BADGE[agent.accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p
          className={`text-xs font-bold tracking-[0.15em] uppercase ${ACCENT_TEXT[agent.accent]}`}
        >
          {agent.name} &middot; {agent.role}
        </p>
        <h3 className="mt-3 max-w-lg text-2xl font-semibold leading-snug tracking-tight text-charcoal sm:text-[28px]">
          {agent.tagline}
        </h3>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600">
          {agent.description}
        </p>

        <ul className="mt-6 space-y-2.5">
          {agent.responsibilities.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${ACCENT_CHECK_BADGE[agent.accent]}`}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="mt-10 lg:hidden">
        <Visual agent={agent} active={inView} />
      </div>
    </div>
  );
}

function AgentRail({ activeIndex }: { activeIndex: number }) {
  return (
    <aside className="absolute top-0 bottom-0 left-0 hidden w-10 lg:block">
      <nav aria-label="AI agents" className="sticky top-1/2 -translate-y-1/2">
        <ol className="relative flex flex-col items-center gap-6">
          <span
            className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-gray-200"
            aria-hidden="true"
          />
          {AI_AGENTS.map((agent, i) => (
            <li key={agent.id} className="relative">
              <a
                href={`#ai-agent-${agent.id}`}
                aria-current={i === activeIndex ? "true" : undefined}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 ${
                  i === activeIndex
                    ? "border-emerald bg-emerald text-white"
                    : i < activeIndex
                      ? "border-emerald/40 bg-white text-emerald"
                      : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {agent.number}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}

export function AiTeamSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeAgent = AI_AGENTS[activeIndex];
  const ActiveVisual = AGENT_VISUAL_MAP[activeAgent.id];

  return (
    <MotionConfig reducedMotion="user">
      <Section.Root
        id="features"
        className="relative bg-gradient-to-b from-white via-off-white to-white"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/3 left-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 rounded-full bg-blue-100/30 blur-3xl" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <Section.Eyebrow>{AI_TEAM_SECTION.eyebrow}</Section.Eyebrow>
            <Section.Heading>{AI_TEAM_SECTION.heading}</Section.Heading>
            <Section.Body className="text-center">{AI_TEAM_SECTION.description}</Section.Body>
          </div>

          <div className="relative mt-16 grid gap-10 lg:mt-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <AgentRail activeIndex={activeIndex} />

            <div className="lg:pl-14">
              {AI_AGENTS.map((agent, index) => (
                <AgentBlock
                  key={agent.id}
                  agent={agent}
                  index={index}
                  onActive={setActiveIndex}
                />
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-28 flex h-[560px] items-center justify-center">
                <AnimatePresence mode="wait">
                  <ActiveVisual key={activeAgent.id} agent={activeAgent} active />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Container>
      </Section.Root>
    </MotionConfig>
  );
}

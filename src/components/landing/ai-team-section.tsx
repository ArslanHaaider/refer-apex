"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CalendarCheck, Check } from "lucide-react";
import { AI_AGENTS, AI_TEAM_SECTION, JOURNEY_START } from "@/lib/ai-agents-data";
import { AGENT_ICONS } from "./ai-journey/agent-icons";
import { JourneyDetail } from "./ai-journey/journey-detail";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const COUNT = AI_AGENTS.length;
/** Scroll distance (in viewport heights) each agent stays on screen while the section is pinned. */
const VH_PER_STEP = 0.7;
/** Sticky offset: clears the 64px site header plus breathing room. */
const PIN_TOP = 80;

function nodeClasses(state: "done" | "active" | "upcoming") {
  if (state === "active") return "border-emerald bg-emerald text-white shadow-lg shadow-emerald/30";
  if (state === "done") return "border-emerald bg-emerald-50 text-emerald";
  return "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-charcoal";
}

export function AiTeamSection() {
  const [active, setActive] = useState(0);
  const pinRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const agent = AI_AGENTS[active];

  /** Desktop: the section pins and scroll position picks the agent; then normal scrolling resumes. */
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const pin = pinRef.current;
      const sticky = stickyRef.current;
      if (!pin || !sticky || !desktop.matches) return;
      const rect = pin.getBoundingClientRect();
      const travel = rect.height - sticky.offsetHeight - PIN_TOP;
      const progress = Math.min(1, Math.max(0, (PIN_TOP - rect.top) / Math.max(travel, 1)));
      setActive(Math.min(COUNT - 1, Math.floor(progress * COUNT)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /** Desktop: scroll to the middle of an agent's slice of the pinned range. Mobile: just open it. */
  const goTo = useCallback((index: number) => {
    const pin = pinRef.current;
    const sticky = stickyRef.current;
    if (pin && sticky && window.matchMedia("(min-width: 1024px)").matches) {
      const travel = pin.offsetHeight - sticky.offsetHeight - PIN_TOP;
      const top = pin.getBoundingClientRect().top + window.scrollY - PIN_TOP + ((index + 0.5) / COUNT) * travel;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setActive(index);
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = Math.min(COUNT - 1, Math.max(0, active + delta));
    goTo(next);
    tabRefs.current[next]?.focus();
  };

  const progress = ((active + 1) / COUNT) * 100;

  return (
    <MotionConfig reducedMotion="user">
      <Section.Root id="features" className="bg-atmosphere relative">
        <Container>
          {/* The tall wrapper creates the scroll runway; the sticky child stays pinned inside it. */}
          <div
            ref={pinRef}
            className="relative lg:h-[var(--pin-h)]"
            style={{ "--pin-h": `calc(100vh + ${(COUNT - 1) * VH_PER_STEP * 100}vh)` } as React.CSSProperties}
          >
            <div ref={stickyRef} className="lg:sticky" style={{ top: PIN_TOP }}>
              {/* Heading lives inside the pinned block so it stays visible while the agents step through. */}
              <div className="mx-auto max-w-3xl text-center">
                <Section.Eyebrow className="lg:mb-2">{AI_TEAM_SECTION.eyebrow}</Section.Eyebrow>
                <Section.Heading className="lg:!text-[40px]">{AI_TEAM_SECTION.heading}</Section.Heading>
                <Section.Body className="text-center lg:mt-3 lg:[@media(max-height:820px)]:hidden">
                  {AI_TEAM_SECTION.description}
                </Section.Body>
              </div>

              <div className="mt-10 lg:mt-7">
              {/* Desktop: horizontal journey track */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div
                    className="absolute top-6 h-0.5 rounded-full bg-gray-200"
                    style={{ left: "calc(100% / 14)", right: "calc(100% / 14)" }}
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-emerald transition-[width] duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div
                    role="tablist"
                    aria-label="AI agents in a client's journey"
                    onKeyDown={onKeyDown}
                    className="relative grid grid-cols-7"
                  >
                    <div className="flex flex-col items-center px-1 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald bg-emerald-50 text-emerald">
                        <CalendarCheck className="h-5 w-5" />
                      </span>
                      <span className="t-label mt-3 text-[10px] text-gray-500">Start</span>
                      <span className="mt-1 text-sm font-medium text-charcoal">{JOURNEY_START.step}</span>
                    </div>

                    {AI_AGENTS.map((item, index) => {
                      const Icon = AGENT_ICONS[item.id];
                      const state = index === active ? "active" : index < active ? "done" : "upcoming";
                      return (
                        <div key={item.id} className="flex flex-col items-center px-1 text-center">
                          <button
                            ref={(el) => {
                              tabRefs.current[index] = el;
                            }}
                            type="button"
                            role="tab"
                            id={`journey-tab-${item.id}`}
                            aria-selected={index === active}
                            aria-controls="journey-panel"
                            tabIndex={index === active ? 0 : -1}
                            onClick={() => goTo(index)}
                            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${nodeClasses(state)}`}
                          >
                            {state === "done" ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                            {state === "active" ? (
                              <span
                                className="absolute -inset-1.5 animate-ping rounded-full border border-accent/60 [animation-duration:2.4s] motion-reduce:hidden"
                                aria-hidden
                              />
                            ) : null}
                          </button>
                          <span className="t-label mt-3 text-[10px] text-gray-500">
                            {item.number} &middot; {item.name}
                          </span>
                          <span className={`mt-1 text-sm font-medium transition-colors ${index === active ? "text-charcoal" : "text-gray-500"}`}>
                            {item.step}
                          </span>
                          {item.id === "guardian" ? (
                            <span className="mt-1.5 text-[10px] text-gray-400">
                              &#8599; Google review &middot; &#8600; private
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  id="journey-panel"
                  role="tabpanel"
                  aria-labelledby={`journey-tab-${agent.id}`}
                  className="card mt-8 min-h-[22rem] p-8"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <JourneyDetail agent={agent} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <p className="t-label mt-3 text-center text-[10px] text-gray-400" aria-hidden>
                  Step {active + 1} of {COUNT} &middot; keep scrolling
                </p>
              </div>

              {/* Mobile / tablet: vertical timeline with accordion (no pinning) */}
              <ol className="relative lg:hidden">
                <span className="absolute bottom-6 left-6 top-6 w-0.5 -translate-x-1/2 bg-gray-200" aria-hidden />
                <li className="relative flex items-center gap-4 pb-6">
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-emerald bg-emerald-50 text-emerald">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-charcoal">{JOURNEY_START.step}</span>
                </li>
                {AI_AGENTS.map((item, index) => {
                  const Icon = AGENT_ICONS[item.id];
                  const open = index === active;
                  return (
                    <li key={item.id} className="relative pb-6 last:pb-0">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => goTo(index)}
                        className="flex w-full items-center gap-4 text-left"
                      >
                        <span className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${nodeClasses(open ? "active" : "upcoming")}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="t-label block text-[10px] text-gray-500">
                            {item.number} &middot; {item.name}
                          </span>
                          <span className="font-medium text-charcoal">{item.step}</span>
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="card mt-4 p-5 sm:ml-16">
                              <JourneyDetail agent={item} />
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ol>
              </div>
            </div>
          </div>
        </Container>
      </Section.Root>
    </MotionConfig>
  );
}

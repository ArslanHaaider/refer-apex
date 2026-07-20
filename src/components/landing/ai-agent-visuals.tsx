"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Radar, Send, Sparkles } from "lucide-react";
import type { AiAgent } from "@/lib/ai-agents-data";

const ACCENT_STYLES: Record<
  AiAgent["accent"],
  { badge: string; glow: string; particle: string }
> = {
  emerald: {
    badge: "bg-emerald/10 text-emerald",
    glow: "shadow-[0_30px_80px_-25px_rgba(16,185,129,0.45)]",
    particle: "bg-emerald/40",
  },
  amber: {
    badge: "bg-amber-100 text-amber-600",
    glow: "shadow-[0_30px_80px_-25px_rgba(217,119,6,0.4)]",
    particle: "bg-amber-400/40",
  },
  blue: {
    badge: "bg-blue-100 text-blue-600",
    glow: "shadow-[0_30px_80px_-25px_rgba(37,99,235,0.4)]",
    particle: "bg-blue-400/40",
  },
  violet: {
    badge: "bg-violet-100 text-violet-600",
    glow: "shadow-[0_30px_80px_-25px_rgba(124,58,237,0.4)]",
    particle: "bg-violet-400/40",
  },
  rose: {
    badge: "bg-rose-100 text-rose-600",
    glow: "shadow-[0_30px_80px_-25px_rgba(225,29,72,0.4)]",
    particle: "bg-rose-400/40",
  },
};

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${(i * 29 + 8) % 100}%`,
  top: `${(i * 41 + 12) % 100}%`,
  delay: (i % 5) * 0.5,
  duration: 5 + (i % 4),
}));

function useCycle(length: number, active: boolean, intervalMs: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [active, length, intervalMs]);
  return index;
}

function useLoopKey(active: boolean, intervalMs: number) {
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setKey((k) => k + 1), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return key;
}

function useCountUp(target: number, active: boolean, durationMs = 1300, resetKey: number | string = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, durationMs, resetKey]);
  return value;
}

function useTypewriter(text: string, active: boolean, speedMs = 20) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setCount((c) => (c < text.length ? c + 1 : c));
    }, speedMs);
    return () => clearInterval(id);
  }, [active, text, speedMs]);
  return text.slice(0, count);
}

function FloatingParticles({ accent }: { accent: AiAgent["accent"] }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]"
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className={`absolute h-1.5 w-1.5 rounded-full motion-safe:animate-particle-float ${ACCENT_STYLES[accent].particle}`}
          style={{
            left: p.left,
            top: p.top,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

type VisualProps = { agent: AiAgent; active: boolean };

function VisualShell({
  agent,
  badgeLabel,
  children,
}: {
  agent: AiAgent;
  badgeLabel?: string;
  children: ReactNode;
}) {
  const accent = ACCENT_STYLES[agent.accent];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 backdrop-blur-xl sm:p-8 ${accent.glow}`}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/50 via-transparent to-transparent"
        aria-hidden="true"
      />
      <FloatingParticles accent={agent.accent} />

      <div className="mb-6 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          {badgeLabel ?? `${agent.name} · Live`}
        </span>
        <span className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">
          AI Agent
        </span>
      </div>

      {children}
    </motion.div>
  );
}

const SCOUT_STEPS = [
  { label: "Appointment Completed", icon: CheckCircle2 },
  { label: "AI Detects Completion", icon: Radar },
  { label: "Personalized Review Request", icon: Sparkles },
  { label: "Delivered", icon: Send },
];

function ScoutVisual({ agent, active }: VisualProps) {
  const step = useCycle(SCOUT_STEPS.length + 1, active, 1100);
  const showNotification = step === SCOUT_STEPS.length;

  return (
    <VisualShell agent={agent}>
      <div className="space-y-4">
        {SCOUT_STEPS.map((s, i) => {
          const Icon = s.icon;
          const isDone = step > i;
          const isCurrent = step === i;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                  isDone
                    ? "border-emerald bg-emerald text-white"
                    : isCurrent
                      ? "border-emerald bg-emerald/10 text-emerald"
                      : "border-gray-200 bg-white text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isDone || isCurrent ? "text-charcoal" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </p>
                {i < SCOUT_STEPS.length - 1 && (
                  <span className="mt-2 block h-0.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <span
                      className={`block h-full bg-emerald transition-all duration-700 ease-out ${
                        step > i ? "w-full" : "w-0"
                      }`}
                    />
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex flex-wrap gap-2 pt-1">
          {["SMS", "WhatsApp", "Email"].map((channel) => (
            <span
              key={channel}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-500 ${
                step >= 3
                  ? "border-emerald/40 bg-emerald/10 text-emerald"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              {channel}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald/30 bg-emerald/10 p-3"
          >
            <span className="text-sm" aria-hidden="true">
              {"⭐⭐⭐⭐⭐"}
            </span>
            <p className="text-xs font-medium text-charcoal">
              Sarah just left a Google Review
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </VisualShell>
  );
}

const SENTIMENT_EMOJIS = ["😞", "😐", "🙂", "😊", "🤩"];

function GuardianVisual({ agent, active }: VisualProps) {
  const cycle = useCycle(2, active, 3600);
  const isHappy = cycle === 0;
  const highlightIndex = isHappy ? 4 : 0;

  return (
    <VisualShell agent={agent}>
      <p className="mb-4 text-xs font-medium tracking-wide text-gray-500 uppercase">
        Sentiment Scan
      </p>
      <div className="relative flex justify-between gap-1 overflow-hidden rounded-2xl border border-gray-100 bg-off-white/60 p-3">
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-transparent via-white/80 to-transparent motion-safe:animate-scan-beam"
          aria-hidden="true"
        />
        {SENTIMENT_EMOJIS.map((emoji, i) => (
          <span
            key={emoji}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-all duration-500 ${
              i === highlightIndex
                ? "scale-110 bg-white shadow-md ring-2 ring-emerald/40"
                : "opacity-40"
            }`}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div
          className={`rounded-2xl border p-4 transition-all duration-500 ${
            isHappy
              ? "border-emerald/40 bg-emerald/10 shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]"
              : "border-gray-100 bg-white opacity-40"
          }`}
        >
          <p className="text-xs font-semibold text-emerald">Google Reviews</p>
          <p className="mt-1 text-[11px] text-gray-500">Public praise, amplified</p>
        </div>
        <div
          className={`rounded-2xl border p-4 transition-all duration-500 ${
            !isHappy
              ? "border-amber-300/50 bg-amber-50 shadow-[0_0_30px_-10px_rgba(217,119,6,0.45)]"
              : "border-gray-100 bg-white opacity-40"
          }`}
        >
          <p className="text-xs font-semibold text-amber-600">Private Feedback</p>
          <p className="mt-1 text-[11px] text-gray-500">Caught before it&apos;s public</p>
        </div>
      </div>
    </VisualShell>
  );
}

const ECHO_REPLY =
  "Thank you so much, Sarah! We're thrilled you loved your Hydrafacial and can't wait to see you again soon.";

function EchoVisual({ agent, active }: VisualProps) {
  const cycle = useCycle(3, active, 2400);
  const typed = useTypewriter(ECHO_REPLY, active, 18);
  const posted = cycle === 2;

  return (
    <VisualShell agent={agent}>
      <div className="rounded-2xl border border-gray-100 bg-off-white/70 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm" aria-hidden="true">
            {"⭐⭐⭐⭐⭐"}
          </span>
          <p className="text-xs font-semibold text-charcoal">Amazing Hydrafacial!</p>
        </div>
        <p className="mt-1 text-[11px] text-gray-500">Google Review &middot; 2h ago</p>
      </div>

      <div className="mt-4 min-h-[76px] rounded-2xl border border-gray-100 bg-white p-4">
        <p className="mb-1 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
          Echo is replying
        </p>
        <p className="text-xs leading-relaxed text-charcoal">
          {typed}
          {typed.length < ECHO_REPLY.length && (
            <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-emerald align-middle" />
          )}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500">
          Regenerate
        </span>
        <span
          className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-300 ${
            cycle >= 1 ? "bg-emerald text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          Approve
          {cycle === 1 && (
            <Sparkles className="absolute -top-3 -right-3 h-4 w-4 text-emerald motion-safe:animate-ping" />
          )}
        </span>
        <span
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-300 ${
            posted ? "bg-charcoal text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          {posted ? "Posted ✓" : "Post"}
        </span>
      </div>
    </VisualShell>
  );
}

const REFERRAL_NODES = [
  { name: "Emma", revenue: 450 },
  { name: "Layla", revenue: 320 },
  { name: "Ahmed", revenue: 700 },
];

function ReferralNode({
  node,
  active,
  delay,
}: {
  node: { name: string; revenue: number };
  active: boolean;
  delay: number;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  const revenue = useCountUp(node.revenue, show, 900);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="h-4 w-0.5 bg-violet-200" />
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-500 ${
          show
            ? "border-violet-400 bg-violet-100 text-violet-700 shadow-[0_0_20px_-6px_rgba(124,58,237,0.5)]"
            : "border-gray-100 bg-white text-gray-300"
        }`}
      >
        {node.name.slice(0, 2)}
      </span>
      <span
        className={`text-[11px] font-semibold text-emerald transition-opacity duration-500 ${
          show ? "opacity-100" : "opacity-0"
        }`}
      >
        +${revenue}
      </span>
    </div>
  );
}

function ConnectorVisual({ agent, active }: VisualProps) {
  const loopKey = useLoopKey(active, 5200);
  const total = REFERRAL_NODES.reduce((sum, n) => sum + n.revenue, 0);
  const totalRevenue = useCountUp(total, active, 1800, loopKey);

  return (
    <VisualShell agent={agent}>
      <div key={loopKey} className="flex flex-col items-center">
        <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700">
          Sarah M.
        </span>
        <span className="my-2 h-6 w-0.5 bg-gradient-to-b from-violet-300 to-transparent" />
        <div className="grid w-full grid-cols-3 gap-3">
          {REFERRAL_NODES.map((node, i) => (
            <ReferralNode key={node.name} node={node} active={active} delay={i * 350} />
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-gray-100 bg-off-white/70 p-3 text-center">
        <p className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">
          Attributed Revenue
        </p>
        <p className="mt-1 text-xl font-bold text-emerald">${totalRevenue.toLocaleString()}</p>
      </div>
    </VisualShell>
  );
}

const REVIVE_DAYS = ["Day 0", "Day 7", "Day 14", "Day 30"];

function ReviveVisual({ agent, active }: VisualProps) {
  const step = useCycle(REVIVE_DAYS.length + 1, active, 1300);

  return (
    <VisualShell agent={agent}>
      <div>
        <div className="flex items-center justify-between">
          {REVIVE_DAYS.map((day, i) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`h-3 w-3 rounded-full transition-colors duration-500 ${
                  i <= step ? "bg-rose-500" : "bg-gray-200"
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  i <= step ? "text-charcoal" : "text-gray-400"
                }`}
              >
                {day}
              </span>
            </div>
          ))}
        </div>
        <div className="relative -mt-6 mb-4 h-0.5 w-full bg-gray-100">
          <span
            className="absolute h-full bg-rose-400 transition-all duration-700 ease-out"
            style={{ width: `${(Math.min(step, REVIVE_DAYS.length - 1) / (REVIVE_DAYS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex justify-end">
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-[85%] rounded-2xl rounded-tr-sm bg-rose-500 px-4 py-2.5 text-xs text-white shadow-md"
              >
                Hi Sarah 👋 Ready for another treatment?
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3 flex justify-end">
          <AnimatePresence>
            {step >= 2 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex rounded-lg bg-charcoal px-3 py-1.5 text-xs font-semibold text-white"
              >
                Book Now
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </VisualShell>
  );
}

function PulseVisual({ agent, active }: VisualProps) {
  const loopKey = useLoopKey(active, 7000);
  const revenue = useCountUp(18400, active, 1400, loopKey);
  const rating = useCountUp(49, active, 1200, loopKey);
  const referrals = useCountUp(126, active, 1300, loopKey);

  return (
    <VisualShell agent={agent} badgeLabel="Pulse · Analyzing...">
      <div key={loopKey} className="grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-2xl border border-gray-100 bg-off-white/70 p-4">
          <p className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">
            Review Growth
          </p>
          <svg className="mt-2 h-16 w-full" viewBox="0 0 200 60" preserveAspectRatio="none">
            <motion.polyline
              key={loopKey}
              points="0,50 30,42 60,45 90,26 120,30 150,14 180,18 200,6"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: active ? 1 : 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
          </svg>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-off-white/70 p-4 text-center">
          <p className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">
            Revenue
          </p>
          <p className="mt-1 text-lg font-bold text-charcoal">${revenue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-off-white/70 p-4 text-center">
          <p className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">
            Google Rating
          </p>
          <p className="mt-1 text-lg font-bold text-charcoal">{(rating / 10).toFixed(1)}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-gray-100 bg-off-white/70 p-4">
          <p className="mb-2 text-[10px] font-medium tracking-widest text-gray-400 uppercase">
            Referrals ({referrals})
          </p>
          <div className="flex h-10 items-end gap-1.5">
            {[30, 55, 40, 70, 50, 85, 65].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t bg-emerald/70 transition-all duration-700"
                style={{ height: active ? `${h}%` : "4%" }}
              />
            ))}
          </div>
        </div>
      </div>
    </VisualShell>
  );
}

export const AGENT_VISUAL_MAP: Record<AiAgent["id"], ComponentType<VisualProps>> = {
  scout: ScoutVisual,
  guardian: GuardianVisual,
  echo: EchoVisual,
  connector: ConnectorVisual,
  revive: ReviveVisual,
  pulse: PulseVisual,
};

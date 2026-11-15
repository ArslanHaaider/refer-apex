import { ArrowRight, Check, Star } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import type { AiAgent } from "@/lib/ai-agents-data";

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-px" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl rounded-bl-md bg-emerald px-4 py-3 text-sm leading-relaxed text-white">
      {children}
    </p>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="t-label inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
      {children}
    </span>
  );
}

function ReviewAsk() {
  return (
    <div className="space-y-3">
      <Chip>Sent 2h after the visit</Chip>
      <Bubble>
        Hi Emma, thanks for visiting Serenity Spa today! How was your facial? Tap to share a quick
        review &rarr;
      </Bubble>
      <p className="flex items-center gap-1.5 text-xs text-gray-500">
        <Check className="h-3.5 w-3.5 text-emerald" strokeWidth={3} /> Delivered
      </p>
    </div>
  );
}

function Sentiment() {
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
        &ldquo;How was your visit?&rdquo; <span className="text-gray-400">&mdash; reads the reply</span>
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-emerald/30 bg-emerald-50 px-3.5 py-3">
          <Stars count={5} />
          <ArrowRight className="h-4 w-4 text-emerald" />
          <span className="text-sm font-semibold text-emerald">Google review</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-3">
          <Stars count={2} />
          <ArrowRight className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-accent">Private feedback</span>
        </div>
      </div>
    </div>
  );
}

function Reply() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gray-50 p-3.5">
        <Stars count={5} />
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          &ldquo;Felt brand new after my facial. Already told two friends!&rdquo;
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-emerald/40 p-3.5">
        <p className="t-label text-[10px] text-emerald">Drafted in your voice</p>
        <p className="mt-1.5 text-sm leading-relaxed text-charcoal">
          Thank you, Emma! We loved having you in, and can&rsquo;t wait to see you again soon.
        </p>
      </div>
      <span className="inline-flex h-9 items-center rounded-lg bg-emerald px-4 text-xs font-semibold text-white">
        Publish reply
      </span>
    </div>
  );
}

function Referral() {
  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-gray-100 px-3 py-2 font-mono text-[11px] text-gray-600">
        iqrava.link/emma-k
      </p>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {["SM", "NB", "JT"].map((initials, i) => (
            <span
              key={initials}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold ${
                i === 0 ? "bg-accent-soft text-accent" : i === 1 ? "bg-emerald-100 text-emerald" : "bg-gray-100 text-gray-600"
              }`}
            >
              {initials}
            </span>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal">3 friends booked</p>
          <p className="text-xs text-gray-500">Reward sent automatically</p>
        </div>
      </div>
    </div>
  );
}

function Return() {
  return (
    <div className="space-y-3">
      <Chip>6 weeks since last visit</Chip>
      <Bubble>
        Hi Emma, it&rsquo;s been a little while since your facial. Ready for your next glow?
      </Bubble>
      <span className="inline-flex h-9 items-center rounded-lg border border-emerald px-4 text-xs font-semibold text-emerald">
        Book now
      </span>
    </div>
  );
}

function Insights() {
  const rows = [
    { label: "Reviews", value: "↑ 41%" },
    { label: "Referrals", value: "↑ 32%" },
    { label: "Repeat bookings", value: "↑ 18%" },
  ];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 200 60" className="h-16 w-full overflow-visible" aria-hidden>
        <path
          d="M0 50 C25 46, 40 40, 60 38 S100 28, 120 24 S160 12, 200 6"
          fill="none"
          stroke="#0f6b57"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          className="chart-line"
        />
        <circle cx="200" cy="6" r="4" fill="#ff6b3d" stroke="#fff" strokeWidth="2" />
      </svg>
      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{row.label}</span>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald">
              <CountUp value={row.value} delay={200} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MOMENTS: Record<AiAgent["id"], () => React.JSX.Element> = {
  scout: ReviewAsk,
  guardian: Sentiment,
  echo: Reply,
  connector: Referral,
  revive: Return,
  pulse: Insights,
};

export function Moment({ agentId }: { agentId: AiAgent["id"] }) {
  const Preview = MOMENTS[agentId];
  return (
    <div className="card w-full max-w-sm p-5">
      <Preview />
      <p className="t-label mt-4 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
        Illustrative example
      </p>
    </div>
  );
}

import { Check } from "lucide-react";
import type { AiAgent } from "@/lib/ai-agents-data";
import { Moment } from "./moments";

export function JourneyDetail({ agent }: { agent: AiAgent }) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-12">
      <div>
        <p className="t-label text-accent">
          {agent.name} &middot; {agent.role}
        </p>
        <h3 className="mt-3 max-w-lg text-3xl font-light leading-tight tracking-[-0.02em] text-charcoal sm:text-[34px]">
          {agent.tagline}
        </h3>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600">{agent.description}</p>
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {agent.responsibilities.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center md:justify-end">
        <Moment agentId={agent.id} />
      </div>
    </div>
  );
}

import { Activity, Radar, RefreshCw, Share2, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AiAgent } from "@/lib/ai-agents-data";

export const AGENT_ICONS: Record<AiAgent["id"], LucideIcon> = {
  scout: Radar,
  guardian: ShieldCheck,
  echo: Sparkles,
  connector: Share2,
  revive: RefreshCw,
  pulse: Activity,
};

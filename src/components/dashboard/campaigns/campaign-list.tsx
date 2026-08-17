"use client";

import { Mail, Megaphone, MessageCircle, Pause, Play, Send, Sparkles } from "lucide-react";
import type { ChannelMode, ReferralCampaign } from "@/lib/referrals/types";
import { StatusBadge } from "./status-badge";

const CHANNEL_ICON: Record<ChannelMode, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  both: Sparkles,
};

type CampaignListProps = {
  campaigns: ReferralCampaign[];
  busy: string | null;
  onActivate: (id: string) => void;
  onPause: (id: string) => void;
  onDispatch: (id: string) => void;
};

export function CampaignList({ campaigns, busy, onActivate, onPause, onDispatch }: CampaignListProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-charcoal">Your campaigns</h2>

      {campaigns.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-off-white text-gray-400">
            <Megaphone className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="mt-3 text-sm font-medium text-charcoal">No campaigns yet</p>
          <p className="mt-1 text-sm text-gray-500">Create your first campaign above to start reaching referrers.</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {campaigns.map((campaign) => {
            const ChannelIcon = CHANNEL_ICON[campaign.channelMode];
            return (
              <li
                key={campaign.id}
                className="flex flex-col justify-between rounded-xl border border-gray-100 bg-off-white/60 p-4 transition hover:border-gray-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                        <ChannelIcon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <p className="truncate font-semibold text-charcoal">{campaign.name}</p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={campaign.status} />
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs text-gray-500">
                    {campaign.channelMode === "both" ? "Email + WhatsApp" : campaign.channelMode}
                    {" · "}
                    <span className="font-medium text-gray-700">
                      {campaign.discountType === "percent"
                        ? `${campaign.discountValue}%`
                        : `$${campaign.discountValue}`}{" "}
                      off
                    </span>
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {campaign.status !== "active" ? (
                    <button
                      type="button"
                      onClick={() => onActivate(campaign.id)}
                      disabled={busy === `status-${campaign.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-dark disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Activate
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onDispatch(campaign.id)}
                        disabled={busy === `dispatch-${campaign.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-dark disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {busy === `dispatch-${campaign.id}` ? "Sending…" : "Send now"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onPause(campaign.id)}
                        disabled={busy === `status-${campaign.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-white disabled:opacity-50"
                      >
                        <Pause className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Pause
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

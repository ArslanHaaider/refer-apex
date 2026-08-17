"use client";

import { AlertCircle, Mail, MessageCircle, Rocket, Save, Send, Sparkles } from "lucide-react";
import type { ChannelMode, DiscountType } from "@/lib/referrals/types";

const CHANNEL_ICON: Record<ChannelMode, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  both: Sparkles,
};

const CHANNEL_LABEL: Record<ChannelMode, string> = {
  email: "Email only",
  whatsapp: "WhatsApp only",
  both: "Email + WhatsApp",
};

type StepReviewProps = {
  name: string;
  channelMode: ChannelMode;
  discountType: DiscountType;
  discountValue: number;
  discountDescription: string;
  emailSubject: string;
  sheetName: string;
  eligibleCount: number;
  busy: string | null;
  error: string | null;
  onSaveDraft: () => void;
  onActivate: () => void;
  onActivateAndSend: () => void;
};

export function StepReview({
  name,
  channelMode,
  discountType,
  discountValue,
  discountDescription,
  emailSubject,
  sheetName,
  eligibleCount,
  busy,
  error,
  onSaveDraft,
  onActivate,
  onActivateAndSend,
}: StepReviewProps) {
  const ChannelIcon = CHANNEL_ICON[channelMode];
  const discountLabel = discountType === "percent" ? `${discountValue}%` : `$${discountValue}`;
  const anyBusy = busy === "draft" || busy === "activate" || busy === "activate-send";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-off-white/60 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald shadow-sm">
            <ChannelIcon className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="truncate font-semibold text-charcoal">{name || "Untitled campaign"}</p>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <SummaryItem label="Channel" value={CHANNEL_LABEL[channelMode]} />
          <SummaryItem label="Discount" value={`${discountLabel} — ${discountDescription || "no description"}`} />
          <SummaryItem label="Email subject" value={emailSubject || "—"} />
          <SummaryItem label="Data source" value={sheetName || "—"} />
          <SummaryItem label="Eligible contacts" value={String(eligibleCount)} />
        </dl>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Activating checks that your Google Sheet is connected and mapped, and that WhatsApp
        credentials are set if your channel includes WhatsApp.
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={anyBusy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-off-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" strokeWidth={1.75} />
          {busy === "draft" ? "Saving…" : "Save as draft"}
        </button>
        <button
          type="button"
          onClick={onActivate}
          disabled={anyBusy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald px-4 py-2 text-sm font-semibold text-emerald transition hover:bg-emerald/5 disabled:opacity-50"
        >
          <Rocket className="h-4 w-4" strokeWidth={1.75} />
          {busy === "activate" ? "Activating…" : "Activate"}
        </button>
        <button
          type="button"
          onClick={onActivateAndSend}
          disabled={anyBusy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-dark disabled:opacity-50"
        >
          <Send className="h-4 w-4" strokeWidth={1.75} />
          {busy === "activate-send" ? "Sending…" : "Activate & send now"}
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-charcoal">{value}</dd>
    </div>
  );
}

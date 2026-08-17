"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Mail, MessageCircle, Sparkles } from "lucide-react";
import type { ChannelMode } from "@/lib/referrals/types";

type StepChannelsProps = {
  channelMode: ChannelMode;
  onChannelModeChange: (v: ChannelMode) => void;
  whatsappConnected: boolean;
  whatsappDisplayPhoneNumber: string | null;
};

const CHANNEL_OPTIONS: Array<{ value: ChannelMode; label: string; hint: string; icon: typeof Mail }> = [
  { value: "email", label: "Email", hint: "Send via email only", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", hint: "Send via WhatsApp only", icon: MessageCircle },
  { value: "both", label: "Both", hint: "Email and WhatsApp", icon: Sparkles },
];

export function StepChannels({
  channelMode,
  onChannelModeChange,
  whatsappConnected,
  whatsappDisplayPhoneNumber,
}: StepChannelsProps) {
  const needsWhatsapp = channelMode === "whatsapp" || channelMode === "both";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {CHANNEL_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
          const active = channelMode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChannelModeChange(value)}
              className={`flex flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left transition ${
                active
                  ? "border-emerald bg-emerald/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-off-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  active ? "bg-emerald text-white" : "bg-off-white text-gray-500"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className={`text-sm font-semibold ${active ? "text-emerald" : "text-charcoal"}`}>
                {label}
              </span>
              <span className="text-xs text-gray-500">{hint}</span>
            </button>
          );
        })}
      </div>

      {needsWhatsapp ? (
        whatsappConnected ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald/5 px-4 py-3 text-sm text-emerald">
            <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            WhatsApp connected{whatsappDisplayPhoneNumber ? `: ${whatsappDisplayPhoneNumber}` : ""}
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>
              WhatsApp isn&apos;t connected yet. Connect it once in{" "}
              <Link href="/dashboard/settings" className="font-semibold underline">
                Settings
              </Link>{" "}
              to send WhatsApp messages.
            </span>
          </div>
        )
      ) : null}
    </div>
  );
}

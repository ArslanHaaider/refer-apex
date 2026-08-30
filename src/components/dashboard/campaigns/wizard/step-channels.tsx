"use client";

import { Mail } from "lucide-react";
import type { ChannelMode } from "@/lib/referrals/types";

type StepChannelsProps = {
  channelMode: ChannelMode;
  onChannelModeChange: (v: ChannelMode) => void;
};

const CHANNEL_OPTIONS: Array<{ value: ChannelMode; label: string; hint: string; icon: typeof Mail }> = [
  { value: "email", label: "Email", hint: "Send via email only", icon: Mail },
];

export function StepChannels({
  channelMode,
  onChannelModeChange,
}: StepChannelsProps) {
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
    </div>
  );
}

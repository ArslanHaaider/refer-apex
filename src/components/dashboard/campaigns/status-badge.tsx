import type { CampaignStatus } from "@/lib/referrals/types";

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-emerald/10 text-emerald",
  paused: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active" ? "bg-emerald" : status === "paused" ? "bg-amber-500" : "bg-gray-400"
        }`}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

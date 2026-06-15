import { Calendar, Star, UserPlus } from "lucide-react";
import type { StatCardData } from "@/lib/dashboard/overview-data";

const iconMap = {
  star: Star,
  rating: Star,
  referrals: UserPlus,
  bookings: Calendar,
} as const;

type StatCardProps = {
  data: StatCardData;
};

export function StatCard({ data }: StatCardProps) {
  const Icon = iconMap[data.icon];

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-600">{data.title}</p>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-charcoal">
        {data.value}
        {data.icon === "rating" ? (
          <Star
            className="ml-1.5 inline h-5 w-5 fill-emerald text-emerald"
            aria-hidden
          />
        ) : null}
      </p>
      <p
        className={`mt-2 text-sm font-medium ${
          data.trendUp ? "text-emerald" : "text-red-500"
        }`}
      >
        {data.trend}
      </p>
    </article>
  );
}

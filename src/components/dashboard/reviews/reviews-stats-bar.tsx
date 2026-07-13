import type { ReactNode } from "react";
import { Star, CheckCircle, Clock } from "lucide-react";

type ReviewsStatsBarProps = {
  totalCount: number;
  averageRating: number;
  repliedCount: number;
  shownCount: number;
};

type StatItem = {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  accent: string;
};

export function ReviewsStatsBar({
  totalCount,
  averageRating,
  repliedCount,
  shownCount,
}: ReviewsStatsBarProps) {
  const unrepliedCount = shownCount - repliedCount;
  const replyRate =
    shownCount > 0 ? Math.round((repliedCount / shownCount) * 100) : 0;

  const stats: StatItem[] = [
    {
      label: "Total Reviews",
      value: totalCount.toLocaleString(),
      sub: `${shownCount} loaded`,
      icon: <Star className="h-[18px] w-[18px]" strokeWidth={1.75} />,
      accent: "bg-emerald/10 text-emerald",
    },
    {
      label: "Average Rating",
      value: averageRating.toFixed(1),
      sub: "out of 5",
      icon: <Star className="h-[18px] w-[18px]" strokeWidth={1.75} />,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      label: "Replied",
      value: repliedCount.toString(),
      sub: `${replyRate}% reply rate`,
      icon: <CheckCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />,
      accent: "bg-emerald/10 text-emerald",
    },
    {
      label: "Awaiting Reply",
      value: unrepliedCount.toString(),
      sub: unrepliedCount > 0 ? "needs attention" : "all caught up",
      icon: <Clock className="h-[18px] w-[18px]" strokeWidth={1.75} />,
      accent:
        unrepliedCount > 0 ? "bg-red-50 text-red-500" : "bg-emerald/10 text-emerald",
    },
  ];

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${stat.accent}`}
            >
              {stat.icon}
            </span>
          </div>
          <p className="mt-3 flex items-end gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-charcoal">
              {stat.value}
            </span>
            {stat.label === "Average Rating" ? (
              <Star
                className="mb-1 h-5 w-5 fill-amber-400 text-amber-400"
                aria-hidden
              />
            ) : null}
          </p>
          {stat.sub ? (
            <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

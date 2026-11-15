import { Calendar, Star, ThumbsUp, UserPlus } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import type { StatCardData } from "@/lib/dashboard/overview-data";

const iconMap = {
  star: Star,
  rating: ThumbsUp,
  referrals: UserPlus,
  bookings: Calendar,
} as const;

type StatCardProps = {
  data: StatCardData;
  index?: number;
};

export function StatCard({ data, index = 0 }: StatCardProps) {
  const Icon = iconMap[data.icon];
  const delay = index * 90 + 150;

  return (
    <article
      className="card rise flex flex-col gap-2.5 p-[18px] pb-4"
      style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-gray-600">{data.title}</p>
        <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-emerald-50 text-emerald">
          <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
        </span>
      </div>
      <p className="flex items-center gap-1.5 font-display text-[42px] font-normal leading-none tracking-[-0.02em] text-charcoal">
        <CountUp value={data.value} delay={delay} />
        {data.icon === "rating" ? (
          <Star className="h-[22px] w-[22px] fill-amber-400 text-amber-400" aria-hidden />
        ) : null}
      </p>
      <p className="flex items-center gap-1.5 text-xs text-gray-500">
        <span
          className={`rounded-[5px] px-1.5 py-0.5 font-semibold ${
            data.deltaUp ? "bg-emerald-50 text-emerald" : "bg-accent-soft text-accent"
          }`}
        >
          <CountUp value={`${data.deltaUp ? "↑" : "↓"} ${data.delta}`} delay={delay} />
        </span>
        vs last month
      </p>
    </article>
  );
}

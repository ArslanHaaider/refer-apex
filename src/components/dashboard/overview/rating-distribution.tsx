import type { RatingBar } from "@/lib/dashboard/overview-data";

type RatingDistributionProps = {
  bars: RatingBar[];
};

const toneClasses = {
  emerald: "bg-emerald",
  amber: "bg-amber-400",
  red: "bg-red-400",
} as const;

export function RatingDistribution({ bars }: RatingDistributionProps) {
  const maxCount = Math.max(...bars.map((bar) => bar.count));

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
      <h2 className="text-base font-semibold text-charcoal">
        Rating Distribution
      </h2>
      <ul className="mt-5 space-y-3">
        {bars.map((bar) => {
          const width = `${(bar.count / maxCount) * 100}%`;

          return (
            <li key={bar.stars} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3">
              <span className="text-sm font-medium text-gray-600">
                {bar.stars} ★
              </span>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${toneClasses[bar.tone]}`}
                  style={{ width }}
                />
              </div>
              <span className="text-right text-sm font-semibold text-charcoal">
                {bar.count}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

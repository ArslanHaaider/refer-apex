import { Star } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import type { RatingBar } from "@/lib/dashboard/overview-data";

type RatingDistributionProps = {
  bars: RatingBar[];
};

/** Deep pine for 5★, fading through mint to amber and coral for the low ratings. */
const BAR_COLORS: Record<number, string> = {
  5: "#0f6b57",
  4: "#3f8a72",
  3: "#8bbcab",
  2: "#f2a93b",
  1: "#ff6b3d",
};

const BAR_START = 450;
const BAR_STEP = 110;
const BAR_DURATION = 1300;

export function RatingDistribution({ bars }: RatingDistributionProps) {
  const total = bars.reduce((sum, bar) => sum + bar.count, 0);
  const average = bars.reduce((sum, bar) => sum + bar.stars * bar.count, 0) / total;
  const filledStars = Math.round(average);

  return (
    <article
      className="card rise flex flex-col gap-3.5 px-[22px] py-5 lg:col-span-2"
      style={{ "--d": "380ms" } as React.CSSProperties}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[21px] font-normal tracking-[-0.01em] text-charcoal">
          Rating Distribution
        </h2>
        <p className="t-label text-[10px] text-gray-400">
          <CountUp value={total} delay={BAR_START} duration={BAR_DURATION} /> reviews
        </p>
      </div>

      <p className="flex items-baseline gap-2">
        <span className="t-num text-5xl leading-none text-charcoal">
          <CountUp value={average.toFixed(1)} delay={BAR_START} duration={BAR_DURATION} />
        </span>
        <span className="flex gap-0.5" aria-label={`${average.toFixed(1)} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-[18px] w-[18px] ${
                i < filledStars ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
              }`}
              aria-hidden
            />
          ))}
        </span>
      </p>

      <ul className="dist-list mt-1 flex flex-col gap-1">
        {bars.map((bar, index) => {
          const delay = BAR_START + index * BAR_STEP;
          const width = (bar.count / total) * 100;
          const color = BAR_COLORS[bar.stars] ?? BAR_COLORS[3];

          return (
            <li
              key={bar.stars}
              className="dist-row grid grid-cols-[2rem_1fr_2.75rem] items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-xs"
            >
              <span className="flex items-center gap-1 font-semibold text-charcoal">
                {bar.stars}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
              </span>

              <div className="relative h-2 rounded-full bg-gray-100">
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
                  style={{ width: `${Math.max(width, 1.5)}%` }}
                >
                  <div
                    className="grow-x bar-fill h-full w-full rounded-full"
                    style={{
                      backgroundColor: color,
                      "--d": `${delay}ms`,
                      "--dur": `${BAR_DURATION}ms`,
                    } as React.CSSProperties}
                  />
                </div>
                <span
                  aria-hidden
                  className="chart-fade absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${Math.max(width, 1.5)}%`,
                    "--d": `${delay + 1200}ms`,
                  } as React.CSSProperties}
                >
                  <span
                    className="bar-tip block h-2 w-2 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: color }}
                  />
                </span>
              </div>

              <span className="text-right font-semibold tabular-nums text-charcoal">
                <CountUp value={bar.count} delay={delay} duration={BAR_DURATION} />
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

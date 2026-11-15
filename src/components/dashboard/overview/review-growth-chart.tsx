"use client";

import { useState } from "react";
import { CountUp } from "@/components/ui/count-up";
import type { GrowthRange, GrowthSeries } from "@/lib/dashboard/overview-data";

type ReviewGrowthChartProps = {
  total: number;
  ranges: Record<GrowthRange, GrowthSeries>;
};

const RANGES: GrowthRange[] = ["7D", "30D", "90D"];
const WIDTH = 620;
const HEIGHT = 250;
const PAD = { top: 20, right: 20, bottom: 50, left: 40 };
const CHART_W = WIDTH - PAD.left - PAD.right;
const CHART_H = HEIGHT - PAD.top - PAD.bottom;

function formatTick(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return String(Math.round(value));
}

function niceMax(value: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.ceil(value / magnitude / 2) * magnitude * 2;
}

/** Smooth line through the points (Catmull-Rom converted to cubic beziers). */
function smoothPath(pts: [number, number][]): string {
  return pts.reduce((path, [x, y], i) => {
    if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const [x0, y0] = pts[i - 2] ?? pts[i - 1];
    const [x1, y1] = pts[i - 1];
    const [x3, y3] = pts[i + 1] ?? pts[i];
    const c1x = x1 + (x - x0) / 6;
    const c1y = y1 + (y - y0) / 6;
    const c2x = x - (x3 - x1) / 6;
    const c2y = y - (y3 - y1) / 6;
    return `${path} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, "");
}

export function ReviewGrowthChart({ total, ranges }: ReviewGrowthChartProps) {
  const [range, setRange] = useState<GrowthRange>("30D");
  const { points, previous, labels } = ranges[range];

  const max = niceMax(Math.max(...points));
  const baseY = PAD.top + CHART_H;
  const toXY = (values: number[]): [number, number][] =>
    values.map((v, i) => [
      PAD.left + (i / (values.length - 1)) * CHART_W,
      PAD.top + CHART_H - (v / max) * CHART_H,
    ]);

  const current = toXY(points);
  const prior = toXY(previous);
  const linePath = smoothPath(current);
  const [lastX, lastY] = current[current.length - 1];
  const areaPath = `${linePath} L ${lastX.toFixed(1)} ${baseY} L ${PAD.left} ${baseY} Z`;
  const ticks = [0, 1 / 3, 2 / 3, 1];

  return (
    <article
      className="card rise flex flex-col gap-3 px-[22px] py-5 lg:col-span-3"
      style={{ "--d": "300ms" } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-[21px] font-normal tracking-[-0.01em] text-charcoal">Review Growth</h2>
        <div
          role="tablist"
          aria-label="Date range"
          className="ml-auto flex gap-0.5 rounded-lg bg-gray-100 p-[3px] text-[11px] font-semibold"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 transition-all ${
                range === r
                  ? "bg-white text-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-gray-500 hover:text-charcoal"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* key restarts the draw-in animation whenever the range changes */}
      <div className="relative" key={range}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block w-full overflow-visible"
          role="img"
          aria-label={`Review growth over ${range}, ${total.toLocaleString()} total reviews`}
        >
          <defs>
            <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f6b57" stopOpacity="0.22" />
              <stop offset="1" stopColor="#0f6b57" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => {
            const y = PAD.top + CHART_H * (1 - tick);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y}
                  y2={y}
                  stroke={tick === 0 ? "#d6ccb8" : "#e4ddcf"}
                  strokeDasharray={tick === 0 ? undefined : "4 5"}
                />
                <text
                  x={0}
                  y={y + 4}
                  fontSize="10"
                  fill="#a39b8a"
                  fontFamily="var(--font-jetbrains), monospace"
                >
                  {formatTick(max * tick)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#growth-fill)" className="chart-fade" />
          <path
            d={smoothPath(prior)}
            fill="none"
            stroke="#ff6b3d"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="1 5"
            className="chart-fade"
            style={{ "--d": "0.5s" } as React.CSSProperties}
          />
          <path
            d={linePath}
            pathLength={1}
            fill="none"
            stroke="#0f6b57"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chart-line"
          />

          <g className="chart-fade" style={{ "--d": "1.3s" } as React.CSSProperties}>
            <line x1={lastX} x2={lastX} y1={lastY} y2={baseY} stroke="#0f6b57" strokeOpacity="0.25" />
            <circle cx={lastX} cy={lastY} r="10" fill="#0f6b57" fillOpacity="0.15" />
            <circle cx={lastX} cy={lastY} r="5" fill="#0f6b57" stroke="#fff" strokeWidth="2" />
          </g>

          {labels.map((label, i) => {
            const x = PAD.left + (i / (labels.length - 1)) * CHART_W;
            const anchor = i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle";
            return (
              <text
                key={label}
                x={x}
                y={baseY + 24}
                textAnchor={anchor}
                fontSize="10"
                fill="#a39b8a"
                fontFamily="var(--font-jetbrains), monospace"
              >
                {label}
              </text>
            );
          })}
        </svg>

        <div
          className="chart-fade pointer-events-none absolute whitespace-nowrap rounded-lg bg-charcoal px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
          style={{
            left: `${(lastX / WIDTH) * 100}%`,
            top: `${(lastY / HEIGHT) * 100}%`,
            transform: "translate(-100%, calc(-100% - 14px)) translateX(14px)",
            "--d": "1.4s",
          } as React.CSSProperties}
        >
          <CountUp value={total} delay={300} duration={1600} /> Total Reviews
        </div>
      </div>

      <div className="flex gap-[18px] text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-3.5 rounded-sm bg-emerald" />
          This month
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-3.5 rounded-sm bg-accent opacity-70" />
          Last month
        </span>
      </div>
    </article>
  );
}

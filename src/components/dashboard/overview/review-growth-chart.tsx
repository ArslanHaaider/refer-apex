type ReviewGrowthChartProps = {
  total: number;
  points: number[];
  labels: string[];
};

const WIDTH = 560;
const HEIGHT = 220;
const PADDING = { top: 24, right: 16, bottom: 32, left: 8 };

function buildPath(points: number[], max: number): string {
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  return points
    .map((value, index) => {
      const x = PADDING.left + (index / (points.length - 1)) * chartW;
      const y = PADDING.top + chartH - (value / max) * chartH;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(points: number[], max: number): string {
  const line = buildPath(points, max);
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;
  const baseY = PADDING.top + chartH;
  const endX = PADDING.left + chartW;

  return `${line} L ${endX.toFixed(1)} ${baseY} L ${PADDING.left} ${baseY} Z`;
}

export function ReviewGrowthChart({
  total,
  points,
  labels,
}: ReviewGrowthChartProps) {
  const max = Math.max(...points) * 1.05;
  const linePath = buildPath(points, max);
  const areaPath = buildAreaPath(points, max);
  const lastX = WIDTH - PADDING.right;
  const lastY =
    PADDING.top +
    (HEIGHT - PADDING.top - PADDING.bottom) -
    (points[points.length - 1] / max) *
      (HEIGHT - PADDING.top - PADDING.bottom);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-3">
      <h2 className="text-base font-semibold text-charcoal">Review Growth</h2>
      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full min-w-[320px]"
          role="img"
          aria-label={`Review growth chart showing ${total.toLocaleString()} total reviews`}
        >
          <defs>
            <linearGradient id="review-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((tick) => {
            const y =
              PADDING.top +
              (HEIGHT - PADDING.top - PADDING.bottom) * (1 - tick);
            return (
              <line
                key={tick}
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
              />
            );
          })}

          <path d={areaPath} fill="url(#review-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx={lastX} cy={lastY} r="5" fill="#10b981" />
          <rect
            x={lastX - 72}
            y={lastY - 38}
            width="144"
            height="28"
            rx="8"
            fill="#1a1a1a"
          />
          <text
            x={lastX}
            y={lastY - 20}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="600"
          >
            {total.toLocaleString()} Total Reviews
          </text>

          {labels.map((label, index) => {
            const x =
              PADDING.left +
              (index / (labels.length - 1)) *
                (WIDTH - PADDING.left - PADDING.right);
            return (
              <text
                key={label}
                x={x}
                y={HEIGHT - 8}
                textAnchor="middle"
                fill="#4b5563"
                fontSize="10"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </article>
  );
}

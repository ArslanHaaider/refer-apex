import type { UserRole } from "@/lib/auth/types";

export type StatCardData = {
  title: string;
  value: string;
  /** Change vs last month, e.g. "41%" or "0.3". */
  delta: string;
  deltaUp: boolean;
  icon: "star" | "rating" | "referrals" | "bookings";
};

export type RatingBar = {
  stars: number;
  count: number;
};

export type GrowthRange = "7D" | "30D" | "90D";

export type GrowthSeries = {
  points: number[];
  previous: number[];
  labels: string[];
};

export type LatestReview = {
  name: string;
  rating: number;
  text: string;
  tone: "mint" | "peach" | "sand";
};

export type OverviewData = {
  dateRange: string;
  stats: StatCardData[];
  reviewGrowth: {
    total: number;
    ranges: Record<GrowthRange, GrowthSeries>;
  };
  ratingDistribution: RatingBar[];
  latestReviews: LatestReview[];
};

/** Deterministic cumulative curve that ends exactly at `total`. */
function curve(total: number, count: number, floor: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const eased = 1 - Math.pow(1 - t, 1.6);
    const wiggle = Math.sin(i * 1.7) * 0.012 * (1 - t);
    const share = floor + (1 - floor) * eased + wiggle;
    return i === count - 1 ? total : Math.round(total * share);
  });
}

function buildGrowth(total: number): OverviewData["reviewGrowth"] {
  const make = (count: number, floor: number, labels: string[]): GrowthSeries => {
    const points = curve(total, count, floor);
    return {
      points,
      labels,
      previous: points.map((value, i) =>
        Math.max(0, Math.round(value * (0.5 + 0.1 * (i / (count - 1))) - total * 0.04)),
      ),
    };
  };

  return {
    total,
    ranges: {
      "7D": make(7, 0.9, ["May 25", "May 27", "May 29", "May 31"]),
      "30D": make(14, 0.14, ["May 1", "May 8", "May 15", "May 22", "May 29"]),
      "90D": make(18, 0.05, ["Mar 3", "Apr 1", "Apr 30", "May 29"]),
    },
  };
}

const LATEST_REVIEWS: LatestReview[] = [
  { name: "Emma L.", rating: 5, text: "Best hot-stone massage in town\u2026", tone: "mint" },
  { name: "James R.", rating: 5, text: "Booked again already. Spotless.", tone: "peach" },
  { name: "Aisha K.", rating: 4, text: "Lovely staff, calming space.", tone: "sand" },
];

const ADMIN_OVERVIEW: OverviewData = {
  dateRange: "May 1 \u2013 May 31, 2026",
  stats: [
    { title: "Total Reviews", value: "1,248", delta: "41%", deltaUp: true, icon: "star" },
    { title: "Average Rating", value: "4.9", delta: "0.3", deltaUp: true, icon: "rating" },
    { title: "New Referrals", value: "356", delta: "32%", deltaUp: true, icon: "referrals" },
    { title: "Repeat Bookings", value: "693", delta: "18%", deltaUp: true, icon: "bookings" },
  ],
  reviewGrowth: buildGrowth(1248),
  ratingDistribution: [
    { stars: 5, count: 874 },
    { stars: 4, count: 250 },
    { stars: 3, count: 75 },
    { stars: 2, count: 37 },
    { stars: 1, count: 12 },
  ],
  latestReviews: LATEST_REVIEWS,
};

const USER_OVERVIEW: OverviewData = {
  dateRange: "May 1 \u2013 May 31, 2026",
  stats: [
    { title: "Total Reviews", value: "284", delta: "18%", deltaUp: true, icon: "star" },
    { title: "Average Rating", value: "4.8", delta: "0.2", deltaUp: true, icon: "rating" },
    { title: "New Referrals", value: "42", delta: "12%", deltaUp: true, icon: "referrals" },
    { title: "Repeat Bookings", value: "96", delta: "24%", deltaUp: true, icon: "bookings" },
  ],
  reviewGrowth: buildGrowth(284),
  ratingDistribution: [
    { stars: 5, count: 198 },
    { stars: 4, count: 58 },
    { stars: 3, count: 18 },
    { stars: 2, count: 7 },
    { stars: 1, count: 3 },
  ],
  latestReviews: LATEST_REVIEWS,
};

export function getOverviewData(role: UserRole): OverviewData {
  return role === "admin" ? ADMIN_OVERVIEW : USER_OVERVIEW;
}

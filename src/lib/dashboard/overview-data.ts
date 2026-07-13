import type { UserRole } from "@/lib/auth/types";

export type StatCardData = {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: "star" | "rating" | "referrals" | "bookings";
};

export type RatingBar = {
  stars: number;
  count: number;
  tone: "emerald" | "amber" | "red";
};

export type OverviewData = {
  dateRange: string;
  stats: StatCardData[];
  reviewGrowth: {
    total: number;
    points: number[];
    labels: string[];
  };
  ratingDistribution: RatingBar[];
};

const ADMIN_OVERVIEW: OverviewData = {
  dateRange: "May 1 – May 31, 2024",
  stats: [
    {
      title: "Total Reviews",
      value: "1,248",
      trend: "+47% vs last month",
      trendUp: true,
      icon: "star",
    },
    {
      title: "Average Rating",
      value: "4.9",
      trend: "+0.3 vs last month",
      trendUp: true,
      icon: "rating",
    },
    {
      title: "New Referrals",
      value: "356",
      trend: "+32% vs last month",
      trendUp: true,
      icon: "referrals",
    },
    {
      title: "Repeat Bookings",
      value: "683",
      trend: "+68% vs last month",
      trendUp: true,
      icon: "bookings",
    },
  ],
  reviewGrowth: {
    total: 1248,
    points: [420, 510, 580, 640, 720, 810, 890, 960, 1050, 1120, 1180, 1248],
    labels: ["May 1", "May 5", "May 9", "May 13", "May 17", "May 21", "May 25", "May 29"],
  },
  ratingDistribution: [
    { stars: 5, count: 892, tone: "emerald" },
    { stars: 4, count: 246, tone: "emerald" },
    { stars: 3, count: 78, tone: "emerald" },
    { stars: 2, count: 21, tone: "amber" },
    { stars: 1, count: 11, tone: "red" },
  ],
};

const USER_OVERVIEW: OverviewData = {
  dateRange: "May 1 – May 31, 2024",
  stats: [
    {
      title: "Total Reviews",
      value: "284",
      trend: "+18% vs last month",
      trendUp: true,
      icon: "star",
    },
    {
      title: "Average Rating",
      value: "4.8",
      trend: "+0.2 vs last month",
      trendUp: true,
      icon: "rating",
    },
    {
      title: "New Referrals",
      value: "42",
      trend: "+12% vs last month",
      trendUp: true,
      icon: "referrals",
    },
    {
      title: "Repeat Bookings",
      value: "96",
      trend: "+24% vs last month",
      trendUp: true,
      icon: "bookings",
    },
  ],
  reviewGrowth: {
    total: 284,
    points: [95, 110, 125, 140, 158, 175, 192, 210, 228, 245, 265, 284],
    labels: ["May 1", "May 5", "May 9", "May 13", "May 17", "May 21", "May 25", "May 29"],
  },
  ratingDistribution: [
    { stars: 5, count: 198, tone: "emerald" },
    { stars: 4, count: 58, tone: "emerald" },
    { stars: 3, count: 18, tone: "emerald" },
    { stars: 2, count: 7, tone: "amber" },
    { stars: 1, count: 3, tone: "red" },
  ],
};

export function getOverviewData(role: UserRole): OverviewData {
  return role === "admin" ? ADMIN_OVERVIEW : USER_OVERVIEW;
}

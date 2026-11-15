import { DashboardHeader } from "@/components/dashboard/header";
import { LatestReviews } from "@/components/dashboard/overview/latest-reviews";
import { RatingDistribution } from "@/components/dashboard/overview/rating-distribution";
import { ReviewGrowthChart } from "@/components/dashboard/overview/review-growth-chart";
import { StatCard } from "@/components/dashboard/overview/stat-card";
import { requireUser } from "@/lib/auth/get-user";
import { getOverviewData } from "@/lib/dashboard/overview-data";

export default async function OverviewPage() {
  const user = await requireUser();
  const data = getOverviewData(user.role);
  const firstName = (user.fullName || user.email.split("@")[0]).split(" ")[0];

  return (
    <>
      <DashboardHeader
        title={`Welcome back, ${firstName}`}
        dateRange={data.dateRange}
        showExport={user.role === "admin"}
        role={user.role}
      />

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat, index) => (
          <StatCard key={stat.title} data={stat} index={index} />
        ))}
      </div>

      <div className="mt-3.5 grid gap-3.5 lg:grid-cols-5">
        <ReviewGrowthChart total={data.reviewGrowth.total} ranges={data.reviewGrowth.ranges} />
        <RatingDistribution bars={data.ratingDistribution} />
      </div>

      <div className="mt-3.5">
        <LatestReviews reviews={data.latestReviews} />
      </div>
    </>
  );
}

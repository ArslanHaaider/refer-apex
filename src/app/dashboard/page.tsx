import { DashboardHeader } from "@/components/dashboard/header";
import { RatingDistribution } from "@/components/dashboard/overview/rating-distribution";
import { ReviewGrowthChart } from "@/components/dashboard/overview/review-growth-chart";
import { StatCard } from "@/components/dashboard/overview/stat-card";
import { requireUser } from "@/lib/auth/get-user";
import { getOverviewData } from "@/lib/dashboard/overview-data";

export default async function OverviewPage() {
  const user = await requireUser();
  const data = getOverviewData(user.role);

  return (
    <>
      <DashboardHeader
        title="Overview"
        dateRange={data.dateRange}
        showExport={user.role === "admin"}
        role={user.role}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <ReviewGrowthChart
          total={data.reviewGrowth.total}
          points={data.reviewGrowth.points}
          labels={data.reviewGrowth.labels}
        />
        <RatingDistribution bars={data.ratingDistribution} />
      </div>
    </>
  );
}

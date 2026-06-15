import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <PlaceholderPage
      title="Analytics"
      description="Deep-dive into conversion funnels, channel performance, and location comparisons."
    />
  );
}

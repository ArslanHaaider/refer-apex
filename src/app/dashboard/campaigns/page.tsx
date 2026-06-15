import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function CampaignsPage() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <PlaceholderPage
      title="Campaigns"
      description="Create and manage review request and referral campaigns across all spa locations."
    />
  );
}

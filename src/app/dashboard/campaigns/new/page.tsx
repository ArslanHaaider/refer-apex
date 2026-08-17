import { CampaignWizard } from "@/components/dashboard/campaigns/campaign-wizard";
import { requireUser } from "@/lib/auth/get-user";

export default async function NewCampaignPage() {
  await requireUser();
  return <CampaignWizard />;
}

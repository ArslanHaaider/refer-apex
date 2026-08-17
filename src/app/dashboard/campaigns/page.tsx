import { CampaignsShell } from "@/components/dashboard/campaigns/campaigns-shell";
import { requireUser } from "@/lib/auth/get-user";

export default async function CampaignsPage() {
  await requireUser();
  return <CampaignsShell />;
}

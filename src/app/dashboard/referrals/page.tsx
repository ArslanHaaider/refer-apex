import { ReferralsShell } from "@/components/dashboard/referrals/referrals-shell";
import { requireUser } from "@/lib/auth/get-user";

export default async function ReferralsPage() {
  await requireUser();
  return <ReferralsShell />;
}

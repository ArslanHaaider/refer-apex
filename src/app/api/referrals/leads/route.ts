import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { getFunnelMetrics, listReferralLeads } from "@/lib/referrals/analytics";

export async function GET(request: NextRequest) {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const campaignId = new URL(request.url).searchParams.get("campaignId") ?? undefined;

  try {
    const [leads, metrics] = await Promise.all([
      listReferralLeads(supabase, auth.userId, campaignId),
      getFunnelMetrics(supabase, auth.userId, campaignId),
    ]);

    return NextResponse.json({ leads, metrics });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load leads" },
      { status: 500 },
    );
  }
}

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { listReferralRequests } from "@/lib/referrals/analytics";

export async function GET(request: NextRequest) {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const campaignId = new URL(request.url).searchParams.get("campaignId") ?? undefined;

  try {
    const requests = await listReferralRequests(supabase, auth.userId, campaignId);
    return NextResponse.json({ requests });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load requests" },
      { status: 500 },
    );
  }
}

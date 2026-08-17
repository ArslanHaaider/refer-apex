import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  enqueueCampaignSends,
  processQueuedRequests,
} from "@/lib/referrals/dispatch";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`campaigns:dispatch:${auth.userId}`, 10, 60_000);
  if (limited) return limited;

  const { data: campaign } = await supabase
    .from("referral_campaigns")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (campaign.status !== "active") {
    return NextResponse.json(
      { error: "Campaign must be active before dispatching." },
      { status: 400 },
    );
  }

  try {
    const queued = await enqueueCampaignSends(supabase, auth.userId, id);
    const processed = await processQueuedRequests(supabase, auth.userId, id);
    return NextResponse.json({
      queued: queued.created,
      sent: processed.sent,
      failed: processed.failed,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Dispatch failed" },
      { status: 500 },
    );
  }
}

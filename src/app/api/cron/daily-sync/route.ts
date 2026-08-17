import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { runSheetSync } from "@/lib/referrals/sync";
import { enqueueCampaignSends, processQueuedRequests } from "@/lib/referrals/dispatch";

/**
 * Daily cron endpoint.
 * Protect with CRON_SECRET header: Authorization: Bearer <CRON_SECRET>
 * Configure in vercel.json or external scheduler.
 */
function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  // Vercel Cron sends this header on scheduled invocations.
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron === "1" && process.env.VERCEL === "1") return true;

  return false;
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const useMock = process.env.GOOGLE_SHEETS_MOCK !== "false";

  const { data: connections, error } = await supabase
    .from("google_sheet_connections")
    .select("user_id")
    .eq("status", "connected");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const syncResults: Array<{ userId: string; status: string }> = [];
  const dispatchResults: Array<{ userId: string; campaignId: string; sent: number; failed: number }> =
    [];

  for (const connection of connections ?? []) {
    const result = await runSheetSync(supabase, connection.user_id, { useMock });
    syncResults.push({ userId: connection.user_id, status: result.status });

    if (result.status !== "succeeded") continue;

    const { data: campaigns } = await supabase
      .from("referral_campaigns")
      .select("id")
      .eq("user_id", connection.user_id)
      .eq("status", "active");

    for (const campaign of campaigns ?? []) {
      await enqueueCampaignSends(supabase, connection.user_id, campaign.id);
      const sent = await processQueuedRequests(supabase, connection.user_id, campaign.id);
      dispatchResults.push({
        userId: connection.user_id,
        campaignId: campaign.id,
        sent: sent.sent,
        failed: sent.failed,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    synced: syncResults.length,
    syncResults,
    dispatchResults,
  });
}

export async function GET(request: Request) {
  return POST(request);
}

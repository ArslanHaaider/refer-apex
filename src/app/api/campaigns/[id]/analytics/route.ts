import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { getFunnelMetrics } from "@/lib/referrals/analytics";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const { data: campaign } = await supabase
    .from("referral_campaigns")
    .select("id")
    .eq("id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const metrics = await getFunnelMetrics(supabase, auth.userId, id);
  return NextResponse.json({ metrics });
}

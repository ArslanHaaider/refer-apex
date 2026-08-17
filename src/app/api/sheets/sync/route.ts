import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { runSheetSync } from "@/lib/referrals/sync";

const USE_MOCK = process.env.GOOGLE_SHEETS_MOCK !== "false";

export async function POST() {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`sheets:sync:${auth.userId}`, 5, 60_000);
  if (limited) return limited;

  const result = await runSheetSync(supabase, auth.userId, { useMock: USE_MOCK });

  if (result.status === "failed") {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}

export async function GET() {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from("sheet_sync_runs")
    .select(
      "id, status, rows_scanned, rows_upserted, rows_skipped, error_message, started_at, finished_at",
    )
    .eq("user_id", auth.userId)
    .order("started_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ runs: data ?? [] });
}

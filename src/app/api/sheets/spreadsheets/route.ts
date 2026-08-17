import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { MOCK_SHEET_SPREADSHEETS } from "@/lib/referrals/mock-sheet-data";

const USE_MOCK = process.env.GOOGLE_SHEETS_MOCK !== "false";

export async function GET() {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`sheets:list:${auth.userId}`, 30, 60_000);
  if (limited) return limited;

  if (USE_MOCK) {
    return NextResponse.json({ spreadsheets: MOCK_SHEET_SPREADSHEETS });
  }

  return NextResponse.json(
    {
      error:
        "Spreadsheet listing is disabled in limited-access mode. Provide a specific Google Sheet URL or ID.",
    },
    { status: 410 },
  );
}

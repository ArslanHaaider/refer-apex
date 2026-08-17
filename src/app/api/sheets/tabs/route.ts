import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getSpreadsheetMeta } from "@/lib/referrals/google-sheets-api";
import { MOCK_SHEET_TABS } from "@/lib/referrals/mock-sheet-data";

const USE_MOCK = process.env.GOOGLE_SHEETS_MOCK !== "false";

export async function GET(request: NextRequest) {
  const spreadsheetId = new URL(request.url).searchParams.get("spreadsheetId");
  if (!spreadsheetId) {
    return NextResponse.json({ error: "spreadsheetId is required" }, { status: 400 });
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`sheets:tabs:${auth.userId}`, 30, 60_000);
  if (limited) return limited;

  if (USE_MOCK) {
    return NextResponse.json({
      title: "Demo Patients",
      sheets: MOCK_SHEET_TABS,
    });
  }

  try {
    const result = await getSpreadsheetMeta(spreadsheetId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load sheet tabs";
    if (/403|404/.test(message)) {
      return NextResponse.json(
        {
          error:
            "We could not access this sheet. Share it with the service-account email as Viewer, then try again.",
        },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: message },
      { status: 502 },
    );
  }
}

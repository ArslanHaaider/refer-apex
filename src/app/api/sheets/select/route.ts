import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { updateSheetSelection } from "@/lib/referrals/sheet-connection";
import { getSpreadsheetMeta } from "@/lib/referrals/google-sheets-api";
import type { ColumnMapping } from "@/lib/referrals/types";

const USE_MOCK = process.env.GOOGLE_SHEETS_MOCK !== "false";

function isValidMapping(mapping: unknown): mapping is ColumnMapping {
  if (!mapping || typeof mapping !== "object") return false;
  const m = mapping as Record<string, unknown>;
  return (
    typeof m.full_name === "string" &&
    typeof m.phone === "string" &&
    typeof m.email === "string" &&
    typeof m.last_service_date === "string"
  );
}

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`sheets:select:${auth.userId}`, 20, 60_000);
  if (limited) return limited;

  let body: {
    spreadsheetId?: string;
    spreadsheetTitle?: string;
    sheetName?: string;
    columnMapping?: unknown;
    eligibilityDays?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.spreadsheetId ||
    !body.spreadsheetTitle ||
    !body.sheetName ||
    !isValidMapping(body.columnMapping) ||
    typeof body.eligibilityDays !== "number" ||
    !Number.isFinite(body.eligibilityDays) ||
    body.eligibilityDays < 0
  ) {
    return NextResponse.json(
      {
        error:
          "spreadsheetId, spreadsheetTitle, sheetName, eligibilityDays, and columnMapping (full_name, phone, email, last_service_date) are required",
      },
      { status: 400 },
    );
  }

  try {
    let ownerEmail: string | null = null;
    if (!USE_MOCK) {
      const meta = await getSpreadsheetMeta(body.spreadsheetId);
      ownerEmail = meta.ownerEmail;
    }
    await updateSheetSelection(supabase, auth.userId, {
      spreadsheetId: body.spreadsheetId,
      spreadsheetTitle: body.spreadsheetTitle,
      sheetName: body.sheetName,
      columnMapping: body.columnMapping,
      eligibilityDays: body.eligibilityDays,
      sheetOwnerEmail: ownerEmail,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save selection" },
      { status: 500 },
    );
  }
}

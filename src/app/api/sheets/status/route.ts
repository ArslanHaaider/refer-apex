import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { getEligibilityDays } from "@/lib/referrals/eligibility";
import { getSheetConnection } from "@/lib/referrals/sheet-connection";
import { getServiceAccountEmail } from "@/lib/referrals/google-sheets-api";
import type { SheetConnectionStatus } from "@/lib/referrals/types";

const USE_MOCK = process.env.GOOGLE_SHEETS_MOCK !== "false";

export async function GET(): Promise<NextResponse<SheetConnectionStatus | { error: string }>> {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  try {
    const connection = await getSheetConnection(supabase, auth.userId);
    const serviceAccountEmail = getServiceAccountEmail();

    if (!connection) {
      if (!USE_MOCK && serviceAccountEmail) {
        return NextResponse.json({
          connected: true,
          email: null,
          serviceAccountEmail,
          eligibilityDays: getEligibilityDays(),
          spreadsheetId: null,
          spreadsheetTitle: null,
          sheetName: null,
          columnMapping: {
            full_name: "full_name",
            phone: "phone",
            email: "email",
            last_service_date: "last_service_date",
          },
          lastSyncAt: null,
          lastSyncError: null,
          status: "connected",
          isMock: USE_MOCK,
        });
      }
      return NextResponse.json({
        connected: false,
        email: null,
        serviceAccountEmail,
        eligibilityDays: getEligibilityDays(),
        spreadsheetId: null,
        spreadsheetTitle: null,
        sheetName: null,
        columnMapping: null,
        lastSyncAt: null,
        lastSyncError: null,
        status: null,
        isMock: USE_MOCK,
      });
    }

    return NextResponse.json({
      connected: true,
      email: connection.googleAccountEmail,
      serviceAccountEmail,
      eligibilityDays: connection.eligibilityDays,
      spreadsheetId: connection.spreadsheetId,
      spreadsheetTitle: connection.spreadsheetTitle,
      sheetName: connection.sheetName,
      columnMapping: connection.columnMapping,
      lastSyncAt: connection.lastSyncAt,
      lastSyncError: connection.lastSyncError,
      status: connection.status,
      isMock: USE_MOCK,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Status failed" },
      { status: 500 },
    );
  }
}

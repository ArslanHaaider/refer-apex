import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { encryptToken } from "@/lib/security/token-crypto";
import { getEligibilityDays } from "@/lib/referrals/eligibility";
import { getServiceAccountEmail } from "@/lib/referrals/google-sheets-api";

const USE_MOCK = process.env.GOOGLE_SHEETS_MOCK !== "false";

export async function POST() {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`sheets:connect:${auth.userId}`, 10, 60_000);
  if (limited) return limited;

  if (!USE_MOCK) {
    const serviceEmail = getServiceAccountEmail();
    if (!serviceEmail) {
      return NextResponse.json(
        {
          error:
            "Service-account credentials are missing. Set GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON or GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL + GOOGLE_SHEETS_SERVICE_ACCOUNT_PRIVATE_KEY.",
        },
        { status: 500 },
      );
    }

    const { error } = await supabase.from("google_sheet_connections").upsert({
      user_id: auth.userId,
      google_account_email: serviceEmail,
      encrypted_access_token: encryptToken("service-account-token"),
      encrypted_refresh_token: encryptToken("service-account-token"),
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      eligibility_days: getEligibilityDays(),
      status: "connected",
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      connected: true,
      email: serviceEmail,
      isMock: false,
    });
  }

  // Mock connection row so the rest of the flow works without Google OAuth.
  const { error } = await supabase.from("google_sheet_connections").upsert({
    user_id: auth.userId,
    google_account_email: "demo@referapex.local",
    encrypted_access_token: encryptToken("mock-access-token"),
    encrypted_refresh_token: encryptToken("mock-refresh-token"),
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    expires_at: new Date(Date.now() + 3600_000).toISOString(),
      eligibility_days: getEligibilityDays(),
    spreadsheet_id: "mock-spreadsheet",
    spreadsheet_title: "Demo Patients",
    sheet_name: "Clients",
    column_mapping: {
      full_name: "full_name",
      phone: "phone",
      email: "email",
      last_service_date: "last_service_date",
      referred_by_contact_id: "referred_by_contact_id",
      referral_code: "referral_code",
      booking_status: "booking_status",
    },
    status: "connected",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    connected: true,
    email: "demo@referapex.local",
    isMock: true,
  });
}

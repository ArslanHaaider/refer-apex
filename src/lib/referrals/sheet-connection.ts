import type { createClient } from "@/utils/supabase/server";
import { encryptToken } from "@/lib/security/token-crypto";
import { getEligibilityDays } from "./eligibility";
import { getServiceAccountEmail } from "./google-sheets-api";
import type { ColumnMapping } from "./types";

type SupabaseServerClient = ReturnType<typeof createClient>;
const SERVICE_ACCOUNT_TOKEN_PLACEHOLDER = "service-account-token";

export type SheetConnectionRow = {
  googleAccountEmail: string | null;
  eligibilityDays: number;
  spreadsheetId: string | null;
  spreadsheetTitle: string | null;
  sheetName: string | null;
  columnMapping: ColumnMapping;
  status: "connected" | "needs_reauth" | "disconnected";
  lastSyncAt: string | null;
  lastSyncError: string | null;
};

const DEFAULT_MAPPING: ColumnMapping = {
  full_name: "full_name",
  phone: "phone",
  email: "email",
  last_service_date: "last_service_date",
};

function parseColumnMapping(raw: unknown): ColumnMapping {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_MAPPING;
  }

  const obj = raw as Record<string, unknown>;
  return {
    full_name: typeof obj.full_name === "string" ? obj.full_name : "full_name",
    phone: typeof obj.phone === "string" ? obj.phone : "phone",
    email: typeof obj.email === "string" ? obj.email : "email",
    last_service_date:
      typeof obj.last_service_date === "string"
        ? obj.last_service_date
        : "last_service_date",
    referred_by_contact_id:
      typeof obj.referred_by_contact_id === "string"
        ? obj.referred_by_contact_id
        : undefined,
    referral_code:
      typeof obj.referral_code === "string" ? obj.referral_code : undefined,
    booking_status:
      typeof obj.booking_status === "string" ? obj.booking_status : undefined,
  };
}

function parseEligibilityDays(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    return Math.floor(raw);
  }
  return getEligibilityDays();
}

function requireServiceAccountEmail(): string {
  const email = getServiceAccountEmail();
  if (!email) {
    throw new Error(
      "Service-account credentials are not configured. Set GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON or GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL + GOOGLE_SHEETS_SERVICE_ACCOUNT_PRIVATE_KEY.",
    );
  }
  return email;
}

export async function ensureSheetConnectionSeed(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<void> {
  const email = requireServiceAccountEmail();

  const { error } = await supabase.from("google_sheet_connections").upsert({
    user_id: userId,
    google_account_email: email,
    encrypted_access_token: encryptToken(SERVICE_ACCOUNT_TOKEN_PLACEHOLDER),
    encrypted_refresh_token: encryptToken(SERVICE_ACCOUNT_TOKEN_PLACEHOLDER),
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    eligibility_days: getEligibilityDays(),
    status: "connected",
  });

  if (error) {
    throw new Error(`Failed to create sheet connection record: ${error.message}`);
  }
}

export async function getSheetConnection(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<SheetConnectionRow | null> {
  const { data, error } = await supabase
    .from("google_sheet_connections")
    .select(
      "google_account_email, eligibility_days, spreadsheet_id, spreadsheet_title, sheet_name, column_mapping, status, last_sync_at, last_sync_error",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load sheet connection: ${error.message}`);
  }

  if (!data) return null;

  return {
    googleAccountEmail: data.google_account_email,
    eligibilityDays: parseEligibilityDays(data.eligibility_days),
    spreadsheetId: data.spreadsheet_id,
    spreadsheetTitle: data.spreadsheet_title,
    sheetName: data.sheet_name,
    columnMapping: parseColumnMapping(data.column_mapping),
    status: data.status,
    lastSyncAt: data.last_sync_at,
    lastSyncError: data.last_sync_error,
  };
}

export async function updateSheetSelection(
  supabase: SupabaseServerClient,
  userId: string,
  selection: {
    spreadsheetId: string;
    spreadsheetTitle: string;
    sheetName: string;
    columnMapping: ColumnMapping;
    eligibilityDays: number;
    sheetOwnerEmail?: string | null;
  },
): Promise<void> {
  const email = requireServiceAccountEmail();
  const { error } = await supabase.from("google_sheet_connections").upsert({
    user_id: userId,
    google_account_email: selection.sheetOwnerEmail ?? email,
    encrypted_access_token: encryptToken(SERVICE_ACCOUNT_TOKEN_PLACEHOLDER),
    encrypted_refresh_token: encryptToken(SERVICE_ACCOUNT_TOKEN_PLACEHOLDER),
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    eligibility_days: Math.max(0, Math.floor(selection.eligibilityDays)),
    status: "connected",
    spreadsheet_id: selection.spreadsheetId,
    spreadsheet_title: selection.spreadsheetTitle,
    sheet_name: selection.sheetName,
    column_mapping: selection.columnMapping,
    last_sync_error: null,
  });

  if (error) {
    throw new Error(`Failed to update sheet selection: ${error.message}`);
  }
}

export async function markSheetSynced(
  supabase: SupabaseServerClient,
  userId: string,
  errorMessage: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("google_sheet_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_error: errorMessage,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to mark sheet synced: ${error.message}`);
  }
}

export async function deleteSheetConnection(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("google_sheet_connections")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete sheet connection: ${error.message}`);
  }
}

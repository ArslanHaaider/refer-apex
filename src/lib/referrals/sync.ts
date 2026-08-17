import { createHash } from "node:crypto";
import type { createClient } from "@/utils/supabase/server";
import type { createAdminClient } from "@/utils/supabase/admin";
import { fetchSheetValues } from "./google-sheets-api";
import {
  getSheetConnection,
  markSheetSynced,
  type SheetConnectionRow,
} from "./sheet-connection";
import { isContactEligible, isValidServiceDate, normalizeEmail, normalizePhone } from "./eligibility";
import { writeReferralEvent } from "./events";
import type { BookingStatus, ColumnMapping } from "./types";
import { getMockSheetValues } from "./mock-sheet-data";

type AnySupabase =
  | ReturnType<typeof createClient>
  | ReturnType<typeof createAdminClient>;

export type SyncResult = {
  runId: string;
  status: "succeeded" | "failed";
  rowsScanned: number;
  rowsUpserted: number;
  rowsSkipped: number;
  errorMessage: string | null;
};

type ParsedRow = {
  fullName: string;
  phone: string;
  email: string;
  lastServiceDate: string;
  referredByContactId: string | null;
  referralCode: string | null;
  bookingStatus: BookingStatus;
  rowHash: string;
};

function headerIndexMap(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headers.forEach((h, i) => {
    map.set(h.trim().toLowerCase(), i);
  });
  return map;
}

function cellAt(row: string[], index: number | undefined): string {
  if (index === undefined) return "";
  return (row[index] ?? "").trim();
}

function parseBookingStatus(raw: string): BookingStatus {
  const value = raw.trim().toLowerCase();
  if (value === "booked" || value === "attended" || value === "paid") {
    return value;
  }
  return "none";
}

function parseRows(
  values: string[][],
  mapping: ColumnMapping,
): { parsed: ParsedRow[]; skipped: number } {
  if (values.length < 2) {
    return { parsed: [], skipped: 0 };
  }

  const headers = values[0].map((h) => h.trim());
  const index = headerIndexMap(headers);

  const required = [
    mapping.full_name,
    mapping.phone,
    mapping.email,
    mapping.last_service_date,
  ];
  for (const col of required) {
    if (!index.has(col.trim().toLowerCase())) {
      throw new Error(`Missing required column in sheet: ${col}`);
    }
  }

  const nameIdx = index.get(mapping.full_name.trim().toLowerCase());
  const phoneIdx = index.get(mapping.phone.trim().toLowerCase());
  const emailIdx = index.get(mapping.email.trim().toLowerCase());
  const dateIdx = index.get(mapping.last_service_date.trim().toLowerCase());
  const referredIdx = mapping.referred_by_contact_id
    ? index.get(mapping.referred_by_contact_id.trim().toLowerCase())
    : undefined;
  const codeIdx = mapping.referral_code
    ? index.get(mapping.referral_code.trim().toLowerCase())
    : undefined;
  const bookingIdx = mapping.booking_status
    ? index.get(mapping.booking_status.trim().toLowerCase())
    : undefined;

  const parsed: ParsedRow[] = [];
  let skipped = 0;

  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    const fullName = cellAt(row, nameIdx);
    const phone = normalizePhone(cellAt(row, phoneIdx));
    const email = normalizeEmail(cellAt(row, emailIdx));
    const lastServiceDate = cellAt(row, dateIdx);

    if (!fullName || !phone || !email || !isValidServiceDate(lastServiceDate)) {
      skipped += 1;
      continue;
    }

    const referredByContactId = cellAt(row, referredIdx) || null;
    const referralCode = cellAt(row, codeIdx) || null;
    const bookingStatus = parseBookingStatus(cellAt(row, bookingIdx));
    const rowHash = createHash("sha256")
      .update(
        [fullName, phone, email, lastServiceDate, referredByContactId, referralCode, bookingStatus].join(
          "|",
        ),
      )
      .digest("hex");

    parsed.push({
      fullName,
      phone,
      email,
      lastServiceDate,
      referredByContactId,
      referralCode,
      bookingStatus,
      rowHash,
    });
  }

  return { parsed, skipped };
}

async function upsertContact(
  supabase: AnySupabase,
  userId: string,
  row: ParsedRow,
  eligibilityDays: number,
): Promise<"upserted" | "unchanged"> {
  const isEligible = isContactEligible(row.lastServiceDate, new Date(), eligibilityDays);

  // Prefer phone match, then email match (both unique per user).
  const { data: byPhone } = await supabase
    .from("client_contacts")
    .select("id, source_row_hash")
    .eq("user_id", userId)
    .eq("phone", row.phone)
    .maybeSingle();

  const existing =
    byPhone ??
    (
      await supabase
        .from("client_contacts")
        .select("id, source_row_hash")
        .eq("user_id", userId)
        .eq("email", row.email)
        .maybeSingle()
    ).data;

  if (existing?.source_row_hash === row.rowHash) {
    await supabase
      .from("client_contacts")
      .update({
        is_eligible: isEligible,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return "unchanged";
  }

  const payload = {
    user_id: userId,
    full_name: row.fullName,
    phone: row.phone,
    email: row.email,
    last_service_date: row.lastServiceDate,
    source_row_hash: row.rowHash,
    referral_code: row.referralCode,
    booking_status: row.bookingStatus,
    is_eligible: isEligible,
    last_synced_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("client_contacts")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("client_contacts").insert(payload);
    if (error) throw new Error(error.message);
  }

  return "upserted";
}

async function loadSheetValues(
  connection: SheetConnectionRow,
  useMock: boolean,
): Promise<string[][]> {
  if (useMock) {
    return getMockSheetValues();
  }

  if (!connection.spreadsheetId || !connection.sheetName) {
    throw new Error("Spreadsheet and sheet tab must be selected before syncing.");
  }

  return fetchSheetValues(connection.spreadsheetId, connection.sheetName);
}

export async function runSheetSync(
  supabase: AnySupabase,
  userId: string,
  options: { useMock?: boolean } = {},
): Promise<SyncResult> {
  const useMock = options.useMock ?? process.env.GOOGLE_SHEETS_MOCK !== "false";

  const { data: run, error: runError } = await supabase
    .from("sheet_sync_runs")
    .insert({
      user_id: userId,
      status: "running",
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(`Failed to create sync run: ${runError?.message ?? "unknown"}`);
  }

  let rowsScanned = 0;
  let rowsUpserted = 0;
  let rowsSkipped = 0;

  try {
    const connection = await getSheetConnection(
      supabase as ReturnType<typeof createClient>,
      userId,
    );
    if (!connection) {
      throw new Error(
        "Google Sheets data source is not connected yet. Verify and save the shared sheet first.",
      );
    }

    const values = await loadSheetValues(connection, useMock);
    const { parsed, skipped } = parseRows(values, connection.columnMapping);
    rowsScanned = Math.max(values.length - 1, 0);
    rowsSkipped = skipped;

    const eligibilityDays = connection.eligibilityDays;

    for (const row of parsed) {
      const result = await upsertContact(supabase, userId, row, eligibilityDays);
      if (result === "upserted") rowsUpserted += 1;
    }

    await supabase
      .from("sheet_sync_runs")
      .update({
        status: "succeeded",
        rows_scanned: rowsScanned,
        rows_upserted: rowsUpserted,
        rows_skipped: rowsSkipped,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    await markSheetSynced(
      supabase as ReturnType<typeof createClient>,
      userId,
      null,
    );

    await writeReferralEvent(supabase, {
      userId,
      eventType: "audience_imported",
      metadata: { rowsScanned, rowsUpserted, rowsSkipped },
      idempotencyKey: `audience_imported:${run.id}`,
    });

    return {
      runId: run.id,
      status: "succeeded",
      rowsScanned,
      rowsUpserted,
      rowsSkipped,
      errorMessage: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";

    await supabase
      .from("sheet_sync_runs")
      .update({
        status: "failed",
        rows_scanned: rowsScanned,
        rows_upserted: rowsUpserted,
        rows_skipped: rowsSkipped,
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    try {
      await markSheetSynced(
        supabase as ReturnType<typeof createClient>,
        userId,
        message,
      );
    } catch {
      // ignore mark failure in error path
    }

    return {
      runId: run.id,
      status: "failed",
      rowsScanned,
      rowsUpserted,
      rowsSkipped,
      errorMessage: message,
    };
  }
}

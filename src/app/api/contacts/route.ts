import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import type { ClientContact } from "@/lib/referrals/types";

export async function GET() {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from("client_contacts")
    .select(
      "id, full_name, phone, email, last_service_date, is_eligible, booking_status, referral_code, created_at",
    )
    .eq("user_id", auth.userId)
    .order("last_service_date", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const contacts: ClientContact[] = (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    lastServiceDate: row.last_service_date,
    isEligible: row.is_eligible,
    bookingStatus: row.booking_status,
    referralCode: row.referral_code,
    createdAt: row.created_at,
  }));

  const eligibleCount = contacts.filter((c) => c.isEligible).length;

  return NextResponse.json({ contacts, eligibleCount, total: contacts.length });
}

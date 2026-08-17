import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { deleteSheetConnection } from "@/lib/referrals/sheet-connection";

export async function POST() {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`sheets:disconnect:${auth.userId}`, 10, 60_000);
  if (limited) return limited;

  try {
    await deleteSheetConnection(supabase, auth.userId);
    return NextResponse.json({ disconnected: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Disconnect failed" },
      { status: 500 },
    );
  }
}

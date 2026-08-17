import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { deleteWhatsappConnection } from "@/lib/referrals/whatsapp-connection";

const USE_MOCK = process.env.WHATSAPP_MOCK !== "false";

export async function POST(): Promise<NextResponse> {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`whatsapp:disconnect:${auth.userId}`, 10, 60_000);
  if (limited) return limited;

  if (USE_MOCK) {
    // Nothing is persisted in mock mode — the client just resets its own state.
    return NextResponse.json({ connected: false });
  }

  // Meta has no simple revoke endpoint for Embedded Signup tokens; just drop
  // the stored connection.
  await deleteWhatsappConnection(supabase, auth.userId);

  return NextResponse.json({ connected: false });
}

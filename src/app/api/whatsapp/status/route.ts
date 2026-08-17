import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getWhatsappConnection } from "@/lib/referrals/whatsapp-connection";
import type { WhatsappConnectionStatus } from "@/lib/referrals/types";

const USE_MOCK = process.env.WHATSAPP_MOCK !== "false";

export async function GET(): Promise<NextResponse<WhatsappConnectionStatus | { error: string }>> {
  if (USE_MOCK) {
    return NextResponse.json({
      connected: false,
      displayPhoneNumber: null,
      verifiedName: null,
      status: null,
      isMock: true,
    });
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`whatsapp:status:${auth.userId}`, 60, 60_000);
  if (limited) return limited;

  const connection = await getWhatsappConnection(supabase, auth.userId);

  return NextResponse.json({
    connected: connection !== null && connection.status === "connected",
    displayPhoneNumber: connection?.displayPhoneNumber ?? null,
    verifiedName: connection?.verifiedName ?? null,
    status: connection?.status ?? null,
    isMock: false,
  });
}

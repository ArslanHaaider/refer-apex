import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Mock-only endpoint. In real mode, connect via the Embedded Signup popup,
// which posts to /api/whatsapp/signup instead.
const USE_MOCK = process.env.WHATSAPP_MOCK !== "false";

export async function POST() {
  if (!USE_MOCK) {
    return NextResponse.json(
      { error: "Use the Embedded Signup flow in real mode" },
      { status: 400 },
    );
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`whatsapp:connect:${auth.userId}`, 10, 60_000);
  if (limited) return limited;

  return NextResponse.json({
    connected: true,
    displayPhoneNumber: "+1 555 010 0100",
    verifiedName: "Demo Spa",
    status: "connected",
    isMock: true,
  });
}

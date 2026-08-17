import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  fetchPhoneNumberInfo,
  subscribeAppToWaba,
} from "@/lib/referrals/whatsapp-api";
import { saveWhatsappConnection } from "@/lib/referrals/whatsapp-connection";

// Real Embedded Signup completion. Only active when WHATSAPP_MOCK=false.
const USE_MOCK = process.env.WHATSAPP_MOCK !== "false";

export async function POST(request: Request) {
  if (USE_MOCK) {
    return NextResponse.json(
      { error: "Mock mode is active. Use POST /api/whatsapp/connect instead." },
      { status: 400 },
    );
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`whatsapp:signup:${auth.userId}`, 5, 60_000);
  if (limited) return limited;

  let body: { code?: string; wabaId?: string; phoneNumberId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.code || !body.wabaId || !body.phoneNumberId) {
    return NextResponse.json(
      { error: "code, wabaId, and phoneNumberId are required" },
      { status: 400 },
    );
  }

  try {
    const shortLived = await exchangeCodeForToken(body.code);
    const longLived = await exchangeForLongLivedToken(shortLived.accessToken);
    await subscribeAppToWaba(body.wabaId, longLived.accessToken);
    const phoneInfo = await fetchPhoneNumberInfo(body.phoneNumberId, longLived.accessToken);

    await saveWhatsappConnection(supabase, auth.userId, {
      accessToken: longLived.accessToken,
      expiresIn: longLived.expiresIn,
      wabaId: body.wabaId,
      phoneNumberId: body.phoneNumberId,
      displayPhoneNumber: phoneInfo.displayPhoneNumber,
      verifiedName: phoneInfo.verifiedName,
    });

    return NextResponse.json({
      connected: true,
      displayPhoneNumber: phoneInfo.displayPhoneNumber,
      verifiedName: phoneInfo.verifiedName,
      status: "connected",
      isMock: false,
    });
  } catch (err) {
    console.error("WhatsApp Embedded Signup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to complete WhatsApp connection. Please try again." },
      { status: 500 },
    );
  }
}

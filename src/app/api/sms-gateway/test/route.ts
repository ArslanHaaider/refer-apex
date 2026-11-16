import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { loadGatewayForUser, markGatewayNeedsAttention } from "@/lib/sms/gateway";
import { sendTextbeeSms } from "@/lib/sms/textbee";

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`sms-gateway:test:${auth.userId}`, 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { toPhone } = (body ?? {}) as Record<string, unknown>;
  if (typeof toPhone !== "string" || !/^\+\d{8,15}$/.test(toPhone.trim())) {
    return NextResponse.json(
      { error: "Enter your phone number in international format, e.g. +15551234567." },
      { status: 400 },
    );
  }

  const gateway = await loadGatewayForUser(auth.userId);
  if (!gateway) {
    return NextResponse.json({ error: "Connect your SMS gateway first." }, { status: 400 });
  }

  const result = await sendTextbeeSms(gateway, {
    to: toPhone.trim(),
    body: "Refer Apex test message. Your SMS gateway is working.",
  });

  if (!result.ok) {
    if (result.auth) {
      await markGatewayNeedsAttention(auth.userId, "TextBee rejected the API key. Reconnect your gateway.");
    }
    return NextResponse.json({ error: result.error }, { status: result.auth ? 400 : 502 });
  }

  await createAdminClient()
    .from("sms_gateways")
    .update({ last_test_at: new Date().toISOString() })
    .eq("user_id", auth.userId);

  // The gateway flips to "connected" when the first delivery webhook arrives.
  return NextResponse.json({ ok: true });
}

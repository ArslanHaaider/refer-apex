import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { connectGateway } from "@/lib/sms/gateway";

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`sms-gateway:connect:${auth.userId}`, 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { apiKey, deviceId, defaultCountry } = (body ?? {}) as Record<string, unknown>;

  if (typeof apiKey !== "string" || apiKey.trim().length < 8 || apiKey.length > 200) {
    return NextResponse.json({ error: "A valid TextBee API key is required." }, { status: 400 });
  }
  if (deviceId !== undefined && (typeof deviceId !== "string" || deviceId.length > 100)) {
    return NextResponse.json({ error: "Invalid device id." }, { status: 400 });
  }
  if (defaultCountry !== undefined && (typeof defaultCountry !== "string" || !/^[A-Za-z]{2}$/.test(defaultCountry))) {
    return NextResponse.json({ error: "Country must be a 2-letter code." }, { status: 400 });
  }

  const result = await connectGateway({
    userId: auth.userId,
    apiKey: apiKey.trim(),
    deviceId: deviceId as string | undefined,
    defaultCountry: typeof defaultCountry === "string" ? defaultCountry.toUpperCase() : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, deviceName: result.deviceName, status: "pending_test" });
}

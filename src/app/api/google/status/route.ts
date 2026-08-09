import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getGoogleConnection } from "@/lib/reviews/google-connection";
import type { StatusPayload } from "@/lib/reviews/types";

// Default: mock ON. Set GOOGLE_MOCK=false in .env.local to enable real API.
const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET(): Promise<NextResponse<StatusPayload | { error: string }>> {
  if (USE_MOCK) {
    return NextResponse.json({ connected: false, email: null, isMock: true });
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`google:status:${auth.userId}`, 60, 60_000);
  if (limited) return limited;

  const connection = await getGoogleConnection(supabase, auth.userId);

  return NextResponse.json({
    connected: connection !== null,
    email: connection?.googleAccountEmail ?? null,
    isMock: false,
  });
}

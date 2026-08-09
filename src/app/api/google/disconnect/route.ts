import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { deleteGoogleConnection, getGoogleConnection } from "@/lib/reviews/google-connection";
import { revokeToken } from "@/lib/reviews/google-business-api";

const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function POST(): Promise<NextResponse> {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`google:disconnect:${auth.userId}`, 10, 60_000);
  if (limited) return limited;

  if (USE_MOCK) {
    // Nothing is persisted in mock mode — the client just resets its own state.
    return NextResponse.json({ connected: false });
  }

  const connection = await getGoogleConnection(supabase, auth.userId);

  if (connection) {
    try {
      await revokeToken(connection.refreshToken);
    } catch (err) {
      console.error("Google token revoke failed:", err instanceof Error ? err.message : err);
    }
    await deleteGoogleConnection(supabase, auth.userId);
  }

  return NextResponse.json({ connected: false });
}

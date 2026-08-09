import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getGoogleConnection } from "@/lib/reviews/google-connection";
import { revokeToken } from "@/lib/reviews/google-business-api";

export async function POST(): Promise<NextResponse> {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`account:delete:${auth.userId}`, 5, 60 * 60_000);
  if (limited) return limited;

  const connection = await getGoogleConnection(supabase, auth.userId);
  if (connection) {
    try {
      await revokeToken(connection.refreshToken);
    } catch (err) {
      console.error("Google token revoke failed during account deletion:", err instanceof Error ? err.message : err);
    }
  }

  // Deleting the auth user cascades to `profiles` and `google_connections`
  // (both FK auth.users with ON DELETE CASCADE) — no separate row cleanup needed.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(auth.userId);

  if (error) {
    console.error("Account deletion failed:", error.message);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  await supabase.auth.signOut();

  return NextResponse.json({ deleted: true });
}

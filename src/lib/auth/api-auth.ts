import { NextResponse } from "next/server";
import type { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = ReturnType<typeof createClient>;

/**
 * Auth guard for API routes (as opposed to `requireUser`, which redirects and
 * is meant for pages). Returns the caller's userId, or a 401 NextResponse to
 * return as-is.
 */
export async function requireApiUser(
  supabase: SupabaseServerClient,
): Promise<
  | { userId: string; error?: undefined }
  | { userId?: undefined; error: NextResponse<{ error: string }> }
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { userId: user.id };
}

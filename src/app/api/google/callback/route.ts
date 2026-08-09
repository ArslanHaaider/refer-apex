import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { exchangeCodeForTokens } from "@/lib/reviews/google-business-api";
import { saveGoogleConnection } from "@/lib/reviews/google-connection";

// Real OAuth callback. Only active when GOOGLE_MOCK=false.
const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

function redirectClearingState(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url));
  // The state cookie is single-use: clear it on every exit path (success or
  // error) so a stale value can never be validated against a later request.
  response.cookies.delete("google_oauth_state");
  return response;
}

export async function GET(request: NextRequest) {
  if (USE_MOCK) {
    return NextResponse.redirect(new URL("/dashboard/reviews", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return redirectClearingState(request, `/dashboard/reviews?error=${error}`);
  }

  const storedState = request.cookies.get("google_oauth_state")?.value;
  if (!code || !state || state !== storedState) {
    return redirectClearingState(request, "/dashboard/reviews?error=invalid_state");
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectClearingState(request, "/login");
  }

  const limited = checkRateLimit(`google:callback:${user.id}`, 10, 60_000);
  if (limited) {
    return redirectClearingState(request, "/dashboard/reviews?error=rate_limited");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveGoogleConnection(supabase, user.id, tokens);

    return redirectClearingState(request, "/dashboard/reviews");
  } catch (err) {
    console.error("Google OAuth callback failed:", err instanceof Error ? err.message : err);
    return redirectClearingState(request, "/dashboard/reviews?error=token_exchange_failed");
  }
}

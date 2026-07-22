import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { exchangeCodeForTokens } from "@/lib/reviews/google-business-api";
import { saveGoogleConnection } from "@/lib/reviews/google-connection";

// Real OAuth callback. Only active when GOOGLE_MOCK=false.
const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET(request: NextRequest) {
  if (USE_MOCK) {
    return NextResponse.redirect(new URL("/dashboard/reviews", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/reviews?error=${error}`, request.url),
    );
  }

  const storedState = request.cookies.get("google_oauth_state")?.value;
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/dashboard/reviews?error=invalid_state", request.url),
    );
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveGoogleConnection(supabase, user.id, tokens);

    const response = NextResponse.redirect(
      new URL("/dashboard/reviews", request.url),
    );
    response.cookies.delete("google_oauth_state");
    return response;
  } catch (err) {
    console.error("Google OAuth callback failed:", err instanceof Error ? err.message : err);
    return NextResponse.redirect(
      new URL("/dashboard/reviews?error=token_exchange_failed", request.url),
    );
  }
}

import { type NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/reviews/google-business-api";

// Real OAuth callback. Only active when GOOGLE_MOCK=false.
// Stores tokens in Supabase google_connections table (create this table first).
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

  try {
    const tokens = await exchangeCodeForTokens(code);

    // TODO: Store tokens in Supabase google_connections table:
    // const supabase = createClient(await cookies());
    // const { data: { user } } = await supabase.auth.getUser();
    // await supabase.from("google_connections").upsert({
    //   user_id: user.id,
    //   access_token: tokens.accessToken,
    //   refresh_token: tokens.refreshToken,
    //   expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
    // });

    void tokens; // Remove when Supabase insert is implemented

    const response = NextResponse.redirect(
      new URL("/dashboard/reviews", request.url),
    );
    response.cookies.delete("google_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/reviews?error=token_exchange_failed", request.url),
    );
  }
}

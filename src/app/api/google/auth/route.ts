import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { buildOAuthUrl } from "@/lib/reviews/google-business-api";

// Real OAuth initiation. Only active when GOOGLE_MOCK=false.
const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET(request: NextRequest) {
  if (USE_MOCK) {
    return NextResponse.json(
      { error: "Mock mode is active. Use POST /api/google/connect instead." },
      { status: 400 },
    );
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const limited = checkRateLimit(`google:auth:${user.id}`, 10, 60_000);
  if (limited) return limited;

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI must be set." },
      { status: 500 },
    );
  }

  const state = crypto.randomUUID();
  const url = buildOAuthUrl(state);

  const response = NextResponse.redirect(url);
  // Store state in cookie to validate on callback
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}

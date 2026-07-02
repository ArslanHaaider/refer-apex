import { NextResponse } from "next/server";
import { buildOAuthUrl } from "@/lib/reviews/google-business-api";

// Real OAuth initiation. Only active when GOOGLE_MOCK=false.
const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json(
      { error: "Mock mode is active. Use POST /api/google/connect instead." },
      { status: 400 },
    );
  }

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
    maxAge: 600,
    path: "/",
  });

  return response;
}

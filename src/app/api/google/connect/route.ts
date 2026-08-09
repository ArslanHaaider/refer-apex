import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Mock-only endpoint. In real mode, use /api/google/auth to initiate OAuth.
const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function POST() {
  if (!USE_MOCK) {
    return NextResponse.json(
      { error: "Use /api/google/auth in real mode" },
      { status: 400 },
    );
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`google:connect:${auth.userId}`, 10, 60_000);
  if (limited) return limited;

  return NextResponse.json({
    connected: true,
    email: "owner@mybusiness.com",
    isMock: true,
  });
}

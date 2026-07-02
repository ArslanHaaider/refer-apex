import { NextResponse } from "next/server";
import type { StatusPayload } from "@/lib/reviews/types";

// Default: mock ON. Set GOOGLE_MOCK=false in .env.local to enable real API.
const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET(): Promise<NextResponse<StatusPayload>> {
  if (USE_MOCK) {
    return NextResponse.json({ connected: false, email: null, isMock: true });
  }

  // Real mode: check for stored token in Supabase google_connections table.
  // Implement once Supabase tables are created and GOOGLE_MOCK=false is set.
  return NextResponse.json(
    { connected: false, email: null, isMock: false },
    { status: 501 },
  );
}

import { NextResponse } from "next/server";
import { getMockLocations } from "@/lib/reviews/mock-data";
import type { LocationsPayload } from "@/lib/reviews/types";

const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET(): Promise<NextResponse<LocationsPayload | { error: string }>> {
  if (USE_MOCK) {
    return NextResponse.json(getMockLocations());
  }

  // Real mode: fetch from Google Business Profile API using stored access token.
  // Steps to implement:
  //   1. Create google_connections table in Supabase
  //   2. Get user from Supabase auth
  //   3. Fetch access token from google_connections (refresh if expired)
  //   4. Call fetchAccounts() then fetchLocations() from google-business-api.ts
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

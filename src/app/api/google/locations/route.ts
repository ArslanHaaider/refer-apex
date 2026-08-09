import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getMockLocations } from "@/lib/reviews/mock-data";
import { getValidAccessToken } from "@/lib/reviews/google-connection";
import { fetchAccounts, fetchLocations } from "@/lib/reviews/google-business-api";
import type { LocationsPayload } from "@/lib/reviews/types";

const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET(): Promise<NextResponse<LocationsPayload | { error: string }>> {
  if (USE_MOCK) {
    return NextResponse.json(getMockLocations());
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`google:locations:${auth.userId}`, 30, 60_000);
  if (limited) return limited;

  const connection = await getValidAccessToken(supabase, auth.userId);
  if (!connection) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    const accounts = await fetchAccounts(connection.accessToken);
    const account = accounts[0];

    if (!account) {
      return NextResponse.json({
        locations: [],
        connectionEmail: connection.googleAccountEmail ?? "",
      });
    }

    const locations = await fetchLocations(connection.accessToken, account.name);

    return NextResponse.json({
      locations,
      connectionEmail: connection.googleAccountEmail ?? account.accountName,
    });
  } catch (err) {
    console.error("Google locations fetch failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 502 });
  }
}

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getMockReviews } from "@/lib/reviews/mock-data";
import { getValidAccessToken } from "@/lib/reviews/google-connection";
import { fetchReviews } from "@/lib/reviews/google-business-api";
import type { ReviewsPayload } from "@/lib/reviews/types";

const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ReviewsPayload | { error: string }>> {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");
  const pageToken = searchParams.get("pageToken") ?? undefined;

  if (!locationId) {
    return NextResponse.json({ error: "locationId is required" }, { status: 400 });
  }

  if (USE_MOCK) {
    const payload = getMockReviews(locationId);
    if (!payload) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    // Simulate a brief network delay so the loading state is visible
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json(payload);
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`google:reviews:${auth.userId}`, 30, 60_000);
  if (limited) return limited;

  const connection = await getValidAccessToken(supabase, auth.userId);
  if (!connection) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    const result = await fetchReviews(connection.accessToken, locationId, pageToken);
    const repliedCount = result.reviews.filter((r) => r.ownerReply !== null).length;

    return NextResponse.json({
      reviews: result.reviews,
      totalCount: result.totalCount,
      averageRating: result.averageRating,
      repliedCount,
      nextPageToken: result.nextPageToken,
    });
  } catch (err) {
    console.error("Google reviews fetch failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 502 });
  }
}

import { type NextRequest, NextResponse } from "next/server";
import { getMockReviews } from "@/lib/reviews/mock-data";
import type { ReviewsPayload } from "@/lib/reviews/types";

const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ReviewsPayload | { error: string }>> {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");

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

  // Real mode: fetch from Google Business Profile API.
  // Steps to implement:
  //   1. Get user's access token from Supabase google_connections table
  //   2. Refresh token if expired via refreshAccessToken()
  //   3. Call fetchReviews() from google-business-api.ts
  //   4. Optionally cache results in google_reviews table
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

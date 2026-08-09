import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getValidAccessToken } from "@/lib/reviews/google-connection";
import { replyToReview } from "@/lib/reviews/google-business-api";

const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const reviewId = body?.reviewId;
  const comment = typeof body?.comment === "string" ? body.comment.trim() : "";

  if (typeof reviewId !== "string" || !comment) {
    return NextResponse.json({ error: "reviewId and comment are required" }, { status: 400 });
  }

  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`google:reply:${auth.userId}`, 20, 60_000);
  if (limited) return limited;

  if (USE_MOCK) {
    // Simulate a brief network delay; the reply isn't persisted in mock mode.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json({
      ownerReply: comment,
      ownerReplyUpdatedAt: new Date().toISOString(),
    });
  }

  const connection = await getValidAccessToken(supabase, auth.userId);
  if (!connection) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    await replyToReview(connection.accessToken, reviewId, comment);
    return NextResponse.json({
      ownerReply: comment,
      ownerReplyUpdatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Google review reply failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to submit reply" }, { status: 502 });
  }
}

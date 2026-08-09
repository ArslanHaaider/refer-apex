import { NextResponse } from "next/server";

/**
 * In-memory fixed-window rate limiter. Good enough for a single server
 * instance; if this app scales to multiple instances, swap the backing
 * store for a Supabase table or Redis without changing call sites.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so `buckets` doesn't grow unbounded across many
// distinct keys (e.g. one per user). Runs every so often, not on every call.
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

function sweepExpired(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; resetAt: number } {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, resetAt: bucket.resetAt };
}

/**
 * Route-handler helper: returns a 429 NextResponse to return as-is if the
 * key is over its limit, or null if the caller should proceed.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): NextResponse<{ error: string }> | null {
  const result = rateLimit(key, limit, windowMs);

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  return null;
}

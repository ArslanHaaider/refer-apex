import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  completeLeadBooking,
  markLeadBookingStarted,
  resolveLeadToken,
} from "@/lib/referrals/public-flow";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const ip = request.headers.get("x-forwarded-for") ?? "anon";
  const limited = checkRateLimit(`public:lead:get:${ip}`, 60, 60_000);
  if (limited) return limited;

  const ctx = await resolveLeadToken(token);
  if (!ctx) {
    return NextResponse.json({ error: "Invalid or expired booking link" }, { status: 404 });
  }

  return NextResponse.json({
    leadName: ctx.leadName,
    referrerName: ctx.referrerName,
    businessLabel: ctx.businessLabel,
    discountType: ctx.discountType,
    discountValue: ctx.discountValue,
    discountDescription: ctx.discountDescription,
    status: ctx.status,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const ip = request.headers.get("x-forwarded-for") ?? "anon";
  const limited = checkRateLimit(`public:lead:post:${ip}`, 20, 60_000);
  if (limited) return limited;

  let body: { action?: string; preferredDate?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "start") {
    const ok = await markLeadBookingStarted(token);
    if (!ok) {
      return NextResponse.json({ error: "Invalid booking link" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "book" || !body.action) {
    const result = await completeLeadBooking({
      leadToken: token,
      preferredDate: body.preferredDate,
      notes: body.notes,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

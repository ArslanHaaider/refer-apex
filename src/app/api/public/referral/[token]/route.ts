import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { resolveReferralToken, submitReferralLead } from "@/lib/referrals/public-flow";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const ip = request.headers.get("x-forwarded-for") ?? "anon";
  const limited = checkRateLimit(`public:referral:get:${ip}`, 60, 60_000);
  if (limited) return limited;

  const ctx = await resolveReferralToken(token);
  if (!ctx) {
    return NextResponse.json({ error: "Invalid or expired referral link" }, { status: 404 });
  }

  return NextResponse.json({
    referrerName: ctx.referrerName,
    businessLabel: ctx.businessLabel,
    discountType: ctx.discountType,
    discountValue: ctx.discountValue,
    discountDescription: ctx.discountDescription,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const ip = request.headers.get("x-forwarded-for") ?? "anon";
  const limited = checkRateLimit(`public:referral:post:${ip}`, 20, 60_000);
  if (limited) return limited;

  let body: { fullName?: string; phone?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await submitReferralLead({
    requestToken: token,
    fullName: body.fullName ?? "",
    phone: body.phone,
    email: body.email,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ leadToken: result.leadToken }, { status: 201 });
}

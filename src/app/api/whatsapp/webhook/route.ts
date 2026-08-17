import { type NextRequest, NextResponse } from "next/server";

// Meta calls this endpoint directly (no user session), both to verify
// ownership once when the webhook is registered, and afterward to deliver
// message status/delivery events. There's no inbox feature yet, so POST just
// acknowledges receipt.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.info("[whatsapp-webhook]", JSON.stringify(body).slice(0, 2000));
  } catch {
    // Ignore malformed payloads — still acknowledge so Meta doesn't retry/disable the webhook.
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { loadGatewayByWebhookId } from "@/lib/sms/gateway";
import { verifyTextbeeSignature } from "@/lib/sms/webhook-verify";
import {
  shouldApplyDeliveryStatus,
  statusForWebhookEvent,
  type DeliveryStatus,
} from "@/lib/sms/delivery";
import { writeReferralEvent } from "@/lib/referrals/events";

type RouteContext = { params: Promise<{ webhookId: string }> };

const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * TextBee webhook receiver. Auth is the HMAC signature only (the proxy's
 * session refresh is irrelevant here). Always 2xx once the signature is valid
 * so TextBee does not retry or pause the subscription over our own errors.
 */
export async function POST(request: Request, context: RouteContext) {
  const { webhookId } = await context.params;

  const gateway = ID_PATTERN.test(webhookId) ? await loadGatewayByWebhookId(webhookId) : null;
  if (!gateway) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rawBody = await request.text();
  const valid = verifyTextbeeSignature({
    rawBody,
    header: request.headers.get("x-textbee-signature"),
    secret: gateway.signingSecret,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = str(payload.webhookEvent) ?? "";
  const idempotencyKey = str(payload.idempotencyKey);
  const supabase = createAdminClient();

  // Dedupe retries before any side effects.
  if (idempotencyKey) {
    const { error } = await supabase.from("sms_webhook_receipts").insert({
      idempotency_key: idempotencyKey,
      user_id: gateway.userId,
      event,
    });
    if (error?.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    if (error) {
      // Let TextBee retry; we could not record the receipt.
      return NextResponse.json({ error: "Could not record receipt" }, { status: 500 });
    }
  }

  const nested = (payload.payload ?? {}) as Record<string, unknown>;
  const next = statusForWebhookEvent(event, payload.status ?? nested.status);

  await supabase
    .from("sms_gateways")
    .update({ last_webhook_at: new Date().toISOString() })
    .eq("user_id", gateway.userId);

  // A sent/delivered webhook proves the device -> TextBee -> us path works.
  if (next === "sent" || next === "delivered") {
    await supabase
      .from("sms_gateways")
      .update({ status: "connected", status_detail: null })
      .eq("user_id", gateway.userId)
      .eq("status", "pending_test");
  }

  if (!next) {
    return NextResponse.json({ ok: true });
  }

  const smsId = str(payload.smsId) ?? str(nested.smsId) ?? str(nested._id);
  const batchId =
    str(payload.smsBatchId) ?? str(nested.smsBatchId) ?? str(nested.smsBatch);

  const clauses = [
    smsId && ID_PATTERN.test(smsId) ? `provider_message_id.eq.${smsId}` : null,
    batchId && ID_PATTERN.test(batchId) ? `provider_batch_id.eq.${batchId}` : null,
  ].filter(Boolean) as string[];

  if (clauses.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { data: request_ } = await supabase
    .from("referral_requests")
    .select("id, campaign_id, contact_id, delivery_status")
    .eq("user_id", gateway.userId)
    .or(clauses.join(","))
    .maybeSingle();

  if (!request_) {
    // Test message or a message we did not send; nothing to update.
    return NextResponse.json({ ok: true });
  }

  if (!shouldApplyDeliveryStatus(request_.delivery_status as DeliveryStatus | null, next)) {
    return NextResponse.json({ ok: true });
  }

  const errorText = str(payload.errorMessage) ?? str(payload.errorCode) ?? str(nested.errorCode);

  await supabase
    .from("referral_requests")
    .update({
      delivery_status: next,
      ...(smsId ? { provider_message_id: smsId } : {}),
      ...(next === "delivered" ? { delivered_at: new Date().toISOString() } : {}),
      ...(next === "failed" ? { last_error: errorText ?? "Delivery failed" } : {}),
    })
    .eq("id", request_.id);

  if (next === "delivered" || next === "failed") {
    await writeReferralEvent(supabase, {
      userId: gateway.userId,
      eventType: next === "delivered" ? "message_delivered" : "message_failed",
      campaignId: request_.campaign_id,
      requestId: request_.id,
      contactId: request_.contact_id,
      metadata: { channel: "sms", ...(errorText ? { error: errorText } : {}) },
      idempotencyKey: `delivery_${next}:${request_.id}`,
    });
  }

  return NextResponse.json({ ok: true });
}

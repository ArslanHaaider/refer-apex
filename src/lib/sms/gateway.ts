import { createAdminClient } from "@/utils/supabase/admin";
import { decryptToken, encryptToken } from "@/lib/security/token-crypto";
import { randomBytes } from "node:crypto";
import { createTextbeeWebhook, listTextbeeDevices } from "./textbee";

export type GatewayStatus = "pending_test" | "connected" | "needs_attention";

export type LoadedGateway = {
  userId: string;
  apiKey: string;
  deviceId: string | null;
  webhookId: string;
  signingSecret: string;
  status: GatewayStatus;
  defaultCountry: string;
};

/** Fields safe to return to the browser. Never includes the API key or signing secret. */
export type PublicGatewayStatus = {
  connected: boolean;
  status: GatewayStatus | "not_configured";
  statusDetail: string | null;
  deviceName: string | null;
  lastTestAt: string | null;
  lastWebhookAt: string | null;
};

const GATEWAY_COLUMNS =
  "user_id, api_key_enc, device_id, webhook_id, signing_secret_enc, status, default_country";

type GatewayRow = {
  user_id: string;
  api_key_enc: string;
  device_id: string | null;
  webhook_id: string;
  signing_secret_enc: string;
  status: GatewayStatus;
  default_country: string;
};

function toLoaded(row: GatewayRow): LoadedGateway {
  return {
    userId: row.user_id,
    apiKey: decryptToken(row.api_key_enc),
    deviceId: row.device_id,
    webhookId: row.webhook_id,
    signingSecret: decryptToken(row.signing_secret_enc),
    status: row.status,
    defaultCountry: row.default_country,
  };
}

export async function loadGatewayForUser(userId: string): Promise<LoadedGateway | null> {
  const { data } = await createAdminClient()
    .from("sms_gateways")
    .select(GATEWAY_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? toLoaded(data as GatewayRow) : null;
}

export async function loadGatewayByWebhookId(webhookId: string): Promise<LoadedGateway | null> {
  const { data } = await createAdminClient()
    .from("sms_gateways")
    .select(GATEWAY_COLUMNS)
    .eq("webhook_id", webhookId)
    .maybeSingle();
  return data ? toLoaded(data as GatewayRow) : null;
}

export async function getPublicGatewayStatus(userId: string): Promise<PublicGatewayStatus> {
  const { data } = await createAdminClient()
    .from("sms_gateways")
    .select("status, status_detail, device_name, last_test_at, last_webhook_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return {
      connected: false,
      status: "not_configured",
      statusDetail: null,
      deviceName: null,
      lastTestAt: null,
      lastWebhookAt: null,
    };
  }

  return {
    connected: data.status === "connected",
    status: data.status as GatewayStatus,
    statusDetail: data.status_detail,
    deviceName: data.device_name,
    lastTestAt: data.last_test_at,
    lastWebhookAt: data.last_webhook_at,
  };
}

export async function markGatewayNeedsAttention(userId: string, detail: string): Promise<void> {
  await createAdminClient()
    .from("sms_gateways")
    .update({ status: "needs_attention", status_detail: detail })
    .eq("user_id", userId);
}

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Validates the API key, picks a device, registers a per-business webhook and
 * stores everything encrypted. Re-running replaces the previous connection.
 */
export async function connectGateway(input: {
  userId: string;
  apiKey: string;
  deviceId?: string;
  defaultCountry?: string;
}): Promise<{ ok: true; deviceName: string } | { ok: false; error: string; status: number }> {
  const devices = await listTextbeeDevices(input.apiKey);
  if (!devices.ok) {
    return { ok: false, error: devices.error, status: devices.auth ? 400 : 502 };
  }

  const usable = devices.devices.filter((d) => d.enabled);
  if (usable.length === 0) {
    return {
      ok: false,
      error: "No enabled device found. Open the TextBee app on your phone and register it first.",
      status: 400,
    };
  }

  const device = input.deviceId
    ? usable.find((d) => d.id === input.deviceId)
    : usable[0];
  if (!device) {
    return { ok: false, error: "That device was not found on this TextBee account.", status: 400 };
  }

  const webhookId = randomBytes(16).toString("hex");
  const signingSecret = randomBytes(32).toString("hex");

  const webhook = await createTextbeeWebhook(input.apiKey, {
    name: "Refer Apex",
    deliveryUrl: `${appBaseUrl()}/api/webhooks/textbee/${webhookId}`,
    signingSecret,
  });
  if (!webhook.ok) {
    return { ok: false, error: webhook.error, status: 502 };
  }

  const { error } = await createAdminClient()
    .from("sms_gateways")
    .upsert(
      {
        user_id: input.userId,
        api_key_enc: encryptToken(input.apiKey),
        device_id: device.id,
        device_name: device.name,
        webhook_id: webhookId,
        signing_secret_enc: encryptToken(signingSecret),
        webhook_subscription_id: webhook.subscriptionId,
        status: "pending_test",
        status_detail: null,
        ...(input.defaultCountry ? { default_country: input.defaultCountry } : {}),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return { ok: false, error: "Could not save the gateway.", status: 500 };
  }

  return { ok: true, deviceName: device.name };
}

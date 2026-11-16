/**
 * Thin TextBee REST client (https://textbee.dev/docs/api-reference).
 * A 200 from send-sms only means TextBee accepted the message; delivery is
 * reported later via webhooks.
 */

export type TextbeeCredentials = {
  apiKey: string;
  deviceId?: string | null;
};

export type TextbeeSendResult =
  | { ok: true; batchId: string }
  | {
      ok: false;
      error: string;
      retryable: boolean;
      /** 401/403: credentials rejected, so retrying will not help until the user fixes the gateway. */
      auth: boolean;
    };

export type TextbeeDevice = {
  id: string;
  name: string;
  enabled: boolean;
  lastHeartbeat: string | null;
};

export const TEXTBEE_WEBHOOK_EVENTS = [
  "MESSAGE_RECEIVED",
  "MESSAGE_SENT",
  "MESSAGE_DELIVERED",
  "MESSAGE_FAILED",
  "UNKNOWN_STATE",
] as const;

function baseUrl(): string {
  return (process.env.TEXTBEE_API_BASE ?? "https://api.textbee.dev").replace(/\/+$/, "");
}

function headers(apiKey: string): Record<string, string> {
  return { "x-api-key": apiKey, "Content-Type": "application/json" };
}

/** Maps an HTTP status to retry semantics (see plan: 401/403 auth, 429/5xx retry, other 4xx permanent). */
export function classifyTextbeeStatus(status: number): { retryable: boolean; auth: boolean } {
  if (status === 401 || status === 403) return { retryable: false, auth: true };
  if (status === 429 || status >= 500) return { retryable: true, auth: false };
  return { retryable: false, auth: false };
}

export async function sendTextbeeSms(
  creds: TextbeeCredentials,
  input: { to: string; body: string },
): Promise<TextbeeSendResult> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/api/v1/gateway/send-sms`, {
      method: "POST",
      headers: headers(creds.apiKey),
      body: JSON.stringify({
        message: input.body,
        recipients: [input.to],
        ...(creds.deviceId ? { deviceId: creds.deviceId } : {}),
      }),
    });
  } catch (err) {
    return {
      ok: false,
      error: `SMS send failed: ${err instanceof Error ? err.message : "network error"}`,
      retryable: true,
      auth: false,
    };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return {
      ok: false,
      error: `SMS send failed: ${res.status} ${errText.slice(0, 300)}`,
      ...classifyTextbeeStatus(res.status),
    };
  }

  const json = (await res.json().catch(() => null)) as {
    data?: { success?: boolean; message?: string; smsBatchId?: string };
  } | null;
  const data = json?.data;

  if (!data || data.success === false || !data.smsBatchId) {
    return {
      ok: false,
      error: `SMS send failed: ${data?.message ?? "TextBee did not return a batch id"}`,
      retryable: false,
      auth: false,
    };
  }

  return { ok: true, batchId: data.smsBatchId };
}

export async function listTextbeeDevices(
  apiKey: string,
): Promise<
  | { ok: true; devices: TextbeeDevice[] }
  | { ok: false; error: string; auth: boolean }
> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/api/v1/gateway/devices`, { headers: headers(apiKey) });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reach TextBee",
      auth: false,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: res.status === 401 || res.status === 403 ? "TextBee rejected this API key" : `TextBee error ${res.status}`,
      auth: res.status === 401 || res.status === 403,
    };
  }

  const json = (await res.json().catch(() => null)) as {
    data?: Array<{ _id?: string; name?: string; brand?: string; model?: string; enabled?: boolean; lastHeartbeat?: string }>;
  } | null;

  const devices = (json?.data ?? [])
    .filter((d) => typeof d._id === "string")
    .map((d) => ({
      id: d._id as string,
      name: d.name || [d.brand, d.model].filter(Boolean).join(" ") || "Android device",
      enabled: d.enabled !== false,
      lastHeartbeat: d.lastHeartbeat ?? null,
    }));

  return { ok: true, devices };
}

export async function createTextbeeWebhook(
  apiKey: string,
  input: { name: string; deliveryUrl: string; signingSecret: string },
): Promise<{ ok: true; subscriptionId: string | null } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/api/v1/webhooks`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify({
        name: input.name,
        deliveryUrl: input.deliveryUrl,
        signingSecret: input.signingSecret,
        events: TEXTBEE_WEBHOOK_EVENTS,
      }),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not reach TextBee" };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { ok: false, error: `Webhook registration failed: ${res.status} ${errText.slice(0, 300)}` };
  }

  const json = (await res.json().catch(() => null)) as { data?: { _id?: string } } | null;
  return { ok: true, subscriptionId: json?.data?._id ?? null };
}

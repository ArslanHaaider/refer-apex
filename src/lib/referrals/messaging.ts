/**
 * Messaging adapters for referral campaigns.
 * - Email: Resend HTTP API (or mock log when unset)
 * - SMS: TextBee gateway, one Android device per business (or mock log)
 */

import { sendTextbeeSms, type TextbeeCredentials } from "@/lib/sms/textbee";

export type SendResult =
  | { ok: true; providerId: string }
  | {
      ok: false;
      error: string;
      retryable: boolean;
      /** Credentials were rejected; the caller should stop sending and flag the gateway. */
      auth?: boolean;
    };

export function isMockMessaging(): boolean {
  return process.env.MESSAGING_MOCK !== "false";
}

export async function sendEmailMessage(input: {
  toEmail: string;
  subject: string;
  body: string;
  fromEmail?: string;
}): Promise<SendResult> {
  if (isMockMessaging()) {
    console.info("[mock-email]", {
      to: input.toEmail,
      subject: input.subject,
      body: input.body.slice(0, 120),
    });
    return { ok: true, providerId: `mock-email-${crypto.randomUUID()}` };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = input.fromEmail ?? process.env.EMAIL_FROM ?? "Refer Apex <noreply@referapex.app>";

  if (!apiKey) {
    return {
      ok: false,
      error: "RESEND_API_KEY is not configured",
      retryable: false,
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.toEmail],
      subject: input.subject,
      text: input.body,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const retryable = res.status === 429 || res.status >= 500;
    return { ok: false, error: `Email send failed: ${res.status} ${errText}`, retryable };
  }

  const data = await res.json();
  return { ok: true, providerId: data.id ?? `email-${Date.now()}` };
}

/**
 * Sends one SMS through the business's own TextBee device. `gateway` is only
 * optional in mock mode. For SMS the providerId is the TextBee smsBatchId.
 */
export async function sendSmsMessage(input: {
  toPhone: string;
  body: string;
  gateway?: TextbeeCredentials;
}): Promise<SendResult> {
  if (isMockMessaging()) {
    console.info("[mock-sms]", {
      to: input.toPhone,
      body: input.body.slice(0, 120),
    });
    return { ok: true, providerId: `mock-sms-${crypto.randomUUID()}` };
  }

  if (!input.gateway) {
    return { ok: false, error: "SMS gateway is not connected", retryable: false };
  }

  const result = await sendTextbeeSms(input.gateway, { to: input.toPhone, body: input.body });
  if (!result.ok) {
    return { ok: false, error: result.error, retryable: result.retryable, auth: result.auth };
  }
  return { ok: true, providerId: result.batchId };
}

export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

/** Simple exponential backoff delay helper for retryable failures. */
export function backoffMs(attempt: number, baseMs = 1000, maxMs = 60_000): number {
  const exp = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * Math.min(250, exp * 0.1));
  return exp + jitter;
}

/**
 * Messaging adapters for referral campaigns.
 * - WhatsApp: Meta Cloud API (per-client credentials)
 * - Email: Resend HTTP API (or mock log when unset)
 */

export type SendResult =
  | { ok: true; providerId: string }
  | { ok: false; error: string; retryable: boolean };

function isMockMessaging(): boolean {
  return process.env.MESSAGING_MOCK !== "false";
}

export async function sendWhatsAppMessage(input: {
  phoneNumberId: string;
  accessToken: string;
  toPhone: string;
  body: string;
}): Promise<SendResult> {
  if (isMockMessaging()) {
    console.info("[mock-whatsapp]", {
      to: input.toPhone,
      phoneNumberId: input.phoneNumberId,
      body: input.body.slice(0, 120),
    });
    return { ok: true, providerId: `mock-wa-${crypto.randomUUID()}` };
  }

  const to = input.toPhone.replace(/^\+/, "");
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${input.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: input.body },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    const retryable = res.status === 429 || res.status >= 500;
    return { ok: false, error: `WhatsApp send failed: ${res.status} ${errText}`, retryable };
  }

  const data = await res.json();
  const providerId =
    data?.messages?.[0]?.id ?? `wa-${Date.now()}`;
  return { ok: true, providerId };
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

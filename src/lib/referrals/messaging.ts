/**
 * Messaging adapters for referral campaigns.
 * - Email: Resend HTTP API (or mock log when unset)
 * - SMS: ClickSend HTTP API (or mock log when unset)
 */

export type SendResult =
  | { ok: true; providerId: string }
  | { ok: false; error: string; retryable: boolean };

function isMockMessaging(): boolean {
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

export async function sendSmsMessage(input: {
  toPhone: string;
  body: string;
  senderId?: string;
}): Promise<SendResult> {
  if (isMockMessaging()) {
    console.info("[mock-sms]", {
      to: input.toPhone,
      body: input.body.slice(0, 120),
    });
    return { ok: true, providerId: `mock-sms-${crypto.randomUUID()}` };
  }

  const username = process.env.CLICKSEND_USERNAME;
  const apiKey = process.env.CLICKSEND_API_KEY;
  const from = input.senderId ?? process.env.CLICKSEND_SENDER_ID;

  if (!username || !apiKey) {
    return {
      ok: false,
      error: "CLICKSEND_USERNAME / CLICKSEND_API_KEY is not configured",
      retryable: false,
    };
  }

  const res = await fetch("https://rest.clicksend.com/v3/sms/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${apiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          to: input.toPhone,
          body: input.body,
          ...(from ? { from } : {}),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const retryable = res.status === 429 || res.status >= 500;
    return { ok: false, error: `SMS send failed: ${res.status} ${errText}`, retryable };
  }

  const data = await res.json();
  const message = data?.data?.messages?.[0];
  const status = String(message?.status ?? "").toUpperCase();

  if (status && status !== "SUCCESS" && status !== "QUEUED") {
    return {
      ok: false,
      error: `SMS send failed: ${message?.status ?? "unknown error"}`,
      retryable: false,
    };
  }

  return { ok: true, providerId: message?.message_id ?? `sms-${Date.now()}` };
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

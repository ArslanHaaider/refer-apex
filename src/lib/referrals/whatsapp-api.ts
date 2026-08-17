/**
 * Meta WhatsApp Embedded Signup — server-side Graph API calls.
 *
 * Flow: the client completes Facebook Login for Business via the JS SDK
 * (FB.login with a WhatsApp Embedded Signup config_id) and hands us back an
 * authorization `code` plus a `waba_id`/`phone_number_id` pair captured from
 * Meta's postMessage events. We exchange the code for a token here, upgrade
 * it to a long-lived token, subscribe our app to the WABA (so Meta will call
 * our webhook), and fetch display info for the connected number.
 *
 * To enable the real flow:
 *   1. Create a Meta App (type: Business) and add the WhatsApp product.
 *   2. Create a WhatsApp Embedded Signup configuration to get a config_id.
 *   3. Set NEXT_PUBLIC_META_APP_ID, META_APP_SECRET,
 *      NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID, META_WEBHOOK_VERIFY_TOKEN.
 *   4. Set WHATSAPP_MOCK=false.
 */

const GRAPH_API = "https://graph.facebook.com/v21.0";

function appId(): string {
  return process.env.NEXT_PUBLIC_META_APP_ID ?? "";
}

function appSecret(): string {
  return process.env.META_APP_SECRET ?? "";
}

export async function exchangeCodeForToken(
  code: string,
): Promise<{ accessToken: string; expiresIn: number | null }> {
  const params = new URLSearchParams({
    client_id: appId(),
    client_secret: appSecret(),
    code,
  });

  const res = await fetch(`${GRAPH_API}/oauth/access_token?${params.toString()}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp code exchange failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresIn: typeof data.expires_in === "number" ? data.expires_in : null,
  };
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId(),
    client_secret: appSecret(),
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(`${GRAPH_API}/oauth/access_token?${params.toString()}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp long-lived token exchange failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresIn: typeof data.expires_in === "number" ? data.expires_in : 60 * 24 * 60 * 60,
  };
}

export async function subscribeAppToWaba(wabaId: string, accessToken: string): Promise<void> {
  const res = await fetch(`${GRAPH_API}/${wabaId}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to subscribe app to WABA: ${res.status} ${err}`);
  }
}

export async function fetchPhoneNumberInfo(
  phoneNumberId: string,
  accessToken: string,
): Promise<{ displayPhoneNumber: string | null; verifiedName: string | null }> {
  const res = await fetch(
    `${GRAPH_API}/${phoneNumberId}?fields=display_phone_number,verified_name`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch WhatsApp phone number info: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    displayPhoneNumber: data.display_phone_number ?? null,
    verifiedName: data.verified_name ?? null,
  };
}

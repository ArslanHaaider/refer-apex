import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const SERVICE_ACCOUNT_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];
const TOKEN_EXPIRY_BUFFER_MS = 30_000;

// Legacy export kept so old GIS modules still type-check until removed.
export const SHEETS_OAUTH_SCOPES = SERVICE_ACCOUNT_SCOPES;

type ServiceAccountConfig = {
  clientEmail: string;
  privateKey: string;
};

let cachedServiceAccountToken:
  | { accessToken: string; expiresAtMs: number }
  | null = null;
let serviceAccountTokenPromise: Promise<string> | null = null;

function base64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function parsePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, "\n");
}

function readServiceAccountConfig(): ServiceAccountConfig {
  const inlineJson = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineJson) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(inlineJson);
    } catch {
      throw new Error(
        "GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON is not valid JSON.",
      );
    }
    const obj = parsed as Record<string, unknown>;
    const clientEmail =
      typeof obj.client_email === "string" ? obj.client_email.trim() : "";
    const privateKey =
      typeof obj.private_key === "string" ? parsePrivateKey(obj.private_key) : "";
    if (!clientEmail || !privateKey) {
      throw new Error(
        "GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON must contain client_email and private_key.",
      );
    }
    return { clientEmail, privateKey };
  }

  const clientEmail = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL?.trim() ?? "";
  const privateKey = parsePrivateKey(
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_PRIVATE_KEY?.trim() ?? "",
  );
  if (!clientEmail || !privateKey) {
    throw new Error(
      "Service account credentials are missing. Set GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON or GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL + GOOGLE_SHEETS_SERVICE_ACCOUNT_PRIVATE_KEY.",
    );
  }
  return { clientEmail, privateKey };
}

function buildServiceAccountAssertion(config: ServiceAccountConfig): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: config.clientEmail,
    scope: SERVICE_ACCOUNT_SCOPES.join(" "),
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(config.privateKey, "base64url");
  return `${unsigned}.${signature}`;
}

export function getServiceAccountEmail(): string | null {
  try {
    return readServiceAccountConfig().clientEmail;
  } catch {
    return null;
  }
}

export function isServiceAccountConfigured(): boolean {
  return Boolean(getServiceAccountEmail());
}

async function mintServiceAccountAccessToken(): Promise<{
  accessToken: string;
  expiresAtMs: number;
}> {
  const config = readServiceAccountConfig();
  const assertion = buildServiceAccountAssertion(config);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Service-account token mint failed (${res.status}): ${errorBody}`,
    );
  }

  const data = await res.json();
  const accessToken =
    typeof data.access_token === "string" ? data.access_token : "";
  const expiresIn =
    typeof data.expires_in === "number" ? data.expires_in : 3600;
  if (!accessToken) {
    throw new Error("Service-account token response did not include access_token.");
  }
  return {
    accessToken,
    expiresAtMs: Date.now() + expiresIn * 1000,
  };
}

export async function getServiceAccountAccessToken(): Promise<string> {
  if (
    cachedServiceAccountToken &&
    cachedServiceAccountToken.expiresAtMs - TOKEN_EXPIRY_BUFFER_MS > Date.now()
  ) {
    return cachedServiceAccountToken.accessToken;
  }

  if (!serviceAccountTokenPromise) {
    serviceAccountTokenPromise = mintServiceAccountAccessToken()
      .then((token) => {
        cachedServiceAccountToken = token;
        return token.accessToken;
      })
      .finally(() => {
        serviceAccountTokenPromise = null;
      });
  }

  return serviceAccountTokenPromise;
}

export async function getSpreadsheetMeta(
  spreadsheetId: string,
): Promise<{
  title: string;
  sheets: Array<{ title: string; sheetId: number }>;
  ownerEmail: string | null;
}> {
  const accessToken = await getServiceAccountAccessToken();
  const [sheetRes, ownerRes] = await Promise.all([
    fetch(
      `${SHEETS_API}/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    ),
    fetch(
      `${DRIVE_API}/files/${spreadsheetId}?fields=owners(emailAddress)`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    ),
  ]);

  if (!sheetRes.ok) {
    throw new Error(`Spreadsheet meta fetch failed: ${sheetRes.status}`);
  }

  const data = await sheetRes.json();
  let ownerEmail: string | null = null;
  if (ownerRes.ok) {
    const ownerData = await ownerRes.json();
    const firstOwner = Array.isArray(ownerData?.owners) ? ownerData.owners[0] : null;
    ownerEmail =
      firstOwner && typeof firstOwner.emailAddress === "string"
        ? firstOwner.emailAddress
        : null;
  }

  return {
    title: data.properties?.title ?? "Untitled",
    sheets: (data.sheets ?? []).map(
      (s: { properties?: { title?: string; sheetId?: number } }) => ({
        title: s.properties?.title ?? "Sheet1",
        sheetId: s.properties?.sheetId ?? 0,
      }),
    ),
    ownerEmail,
  };
}

export async function fetchSheetValues(
  spreadsheetId: string,
  sheetName: string,
): Promise<string[][]> {
  const accessToken = await getServiceAccountAccessToken();
  const range = encodeURIComponent(`${sheetName}!A:Z`);
  const res = await fetch(
    `${SHEETS_API}/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    throw new Error(`Sheet values fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.values ?? []) as string[][];
}

import type { createClient } from "@/utils/supabase/server";
import { decryptToken, encryptToken } from "@/lib/security/token-crypto";
import { OAUTH_SCOPES } from "./google-business-api";

type SupabaseServerClient = ReturnType<typeof createClient>;

export type GoogleTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export async function saveGoogleConnection(
  supabase: SupabaseServerClient,
  userId: string,
  tokens: GoogleTokens,
): Promise<void> {
  const { error } = await supabase.from("google_connections").upsert({
    user_id: userId,
    encrypted_access_token: encryptToken(tokens.accessToken),
    encrypted_refresh_token: encryptToken(tokens.refreshToken),
    scope: OAUTH_SCOPES.join(" "),
    expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
  });

  if (error) {
    throw new Error(`Failed to store Google connection: ${error.message}`);
  }
}

export async function getGoogleConnection(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  googleAccountEmail: string | null;
} | null> {
  const { data, error } = await supabase
    .from("google_connections")
    .select("encrypted_access_token, encrypted_refresh_token, expires_at, google_account_email")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load Google connection: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    accessToken: decryptToken(data.encrypted_access_token),
    refreshToken: decryptToken(data.encrypted_refresh_token),
    expiresAt: new Date(data.expires_at),
    googleAccountEmail: data.google_account_email,
  };
}

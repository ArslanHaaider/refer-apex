import type { createClient } from "@/utils/supabase/server";
import { decryptToken, encryptToken } from "@/lib/security/token-crypto";
import { OAUTH_SCOPES, refreshAccessToken } from "./google-business-api";

const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

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

export async function updateAccessToken(
  supabase: SupabaseServerClient,
  userId: string,
  accessToken: string,
  expiresIn: number,
): Promise<void> {
  const { error } = await supabase
    .from("google_connections")
    .update({
      encrypted_access_token: encryptToken(accessToken),
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update Google access token: ${error.message}`);
  }
}

export async function deleteGoogleConnection(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("google_connections")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete Google connection: ${error.message}`);
  }
}

/**
 * Returns a usable access token for the user, transparently refreshing it
 * (and persisting the refreshed token) if it's expired or about to expire.
 */
export async function getValidAccessToken(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<{ accessToken: string; googleAccountEmail: string | null } | null> {
  const connection = await getGoogleConnection(supabase, userId);
  if (!connection) {
    return null;
  }

  if (connection.expiresAt.getTime() - EXPIRY_BUFFER_MS > Date.now()) {
    return {
      accessToken: connection.accessToken,
      googleAccountEmail: connection.googleAccountEmail,
    };
  }

  const refreshed = await refreshAccessToken(connection.refreshToken);
  await updateAccessToken(supabase, userId, refreshed.accessToken, refreshed.expiresIn);

  return {
    accessToken: refreshed.accessToken,
    googleAccountEmail: connection.googleAccountEmail,
  };
}

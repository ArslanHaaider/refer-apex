import type { createClient } from "@/utils/supabase/server";
import { decryptToken, encryptToken } from "@/lib/security/token-crypto";

const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

type SupabaseServerClient = ReturnType<typeof createClient>;

export type WhatsappTokens = {
  accessToken: string;
  expiresIn: number;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
};

export type WhatsappConnectionRow = {
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  accessToken: string;
  expiresAt: Date;
  status: "connected" | "needs_reauth";
};

export async function saveWhatsappConnection(
  supabase: SupabaseServerClient,
  userId: string,
  tokens: WhatsappTokens,
): Promise<void> {
  const { error } = await supabase.from("whatsapp_connections").upsert({
    user_id: userId,
    waba_id: tokens.wabaId,
    phone_number_id: tokens.phoneNumberId,
    display_phone_number: tokens.displayPhoneNumber,
    verified_name: tokens.verifiedName,
    encrypted_access_token: encryptToken(tokens.accessToken),
    token_expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
    status: "connected",
  });

  if (error) {
    throw new Error(`Failed to store WhatsApp connection: ${error.message}`);
  }
}

export async function getWhatsappConnection(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<WhatsappConnectionRow | null> {
  const { data, error } = await supabase
    .from("whatsapp_connections")
    .select(
      "waba_id, phone_number_id, display_phone_number, verified_name, encrypted_access_token, token_expires_at, status",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load WhatsApp connection: ${error.message}`);
  }

  if (!data) return null;

  return {
    wabaId: data.waba_id,
    phoneNumberId: data.phone_number_id,
    displayPhoneNumber: data.display_phone_number,
    verifiedName: data.verified_name,
    accessToken: decryptToken(data.encrypted_access_token),
    expiresAt: new Date(data.token_expires_at),
    status: data.status,
  };
}

export async function deleteWhatsappConnection(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("whatsapp_connections")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete WhatsApp connection: ${error.message}`);
  }
}

export async function markWhatsappConnectionNeedsReauth(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("whatsapp_connections")
    .update({ status: "needs_reauth" })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to mark WhatsApp connection as needing reauth: ${error.message}`);
  }
}

/**
 * Returns a usable access token + phone number for the user, or null if
 * there's no connection or the token has expired. Unlike Google's OAuth,
 * WhatsApp Embedded Signup tokens have no refresh flow — once expired, the
 * user must redo the Embedded Signup popup from Settings.
 */
export async function getValidWhatsappConnection(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<{ accessToken: string; phoneNumberId: string } | null> {
  const connection = await getWhatsappConnection(supabase, userId);
  if (!connection) return null;

  if (connection.status === "needs_reauth") return null;

  if (connection.expiresAt.getTime() - EXPIRY_BUFFER_MS <= Date.now()) {
    await markWhatsappConnectionNeedsReauth(supabase, userId);
    return null;
  }

  return { accessToken: connection.accessToken, phoneNumberId: connection.phoneNumberId };
}

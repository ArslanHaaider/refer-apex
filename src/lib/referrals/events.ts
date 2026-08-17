import type { createClient } from "@/utils/supabase/server";
import type { createAdminClient } from "@/utils/supabase/admin";
import type { ReferralEventType } from "./types";

type AnySupabase =
  | ReturnType<typeof createClient>
  | ReturnType<typeof createAdminClient>;

export type WriteReferralEventInput = {
  userId: string;
  eventType: ReferralEventType;
  campaignId?: string | null;
  requestId?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
};

/**
 * Idempotent event writer. Duplicate idempotency_key inserts are ignored.
 */
export async function writeReferralEvent(
  supabase: AnySupabase,
  input: WriteReferralEventInput,
): Promise<void> {
  const { error } = await supabase.from("referral_events").insert({
    user_id: input.userId,
    event_type: input.eventType,
    campaign_id: input.campaignId ?? null,
    request_id: input.requestId ?? null,
    lead_id: input.leadId ?? null,
    contact_id: input.contactId ?? null,
    metadata: input.metadata ?? {},
    idempotency_key: input.idempotencyKey ?? null,
  });

  // Unique violation on idempotency_key — treat as success.
  if (error && error.code !== "23505") {
    throw new Error(`Failed to write referral event: ${error.message}`);
  }
}

import type { createClient } from "@/utils/supabase/server";
import type { createAdminClient } from "@/utils/supabase/admin";
import { getValidWhatsappConnection } from "./whatsapp-connection";
import { writeReferralEvent } from "./events";
import {
  backoffMs,
  renderTemplate,
  sendEmailMessage,
  sendWhatsAppMessage,
} from "./messaging";
import type { ChannelMode } from "./types";

type AnySupabase =
  | ReturnType<typeof createClient>
  | ReturnType<typeof createAdminClient>;

const MAX_SEND_ATTEMPTS = 5;

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  );
}

function channelsForMode(mode: ChannelMode): Array<"email" | "whatsapp"> {
  if (mode === "email") return ["email"];
  if (mode === "whatsapp") return ["whatsapp"];
  return ["email", "whatsapp"];
}

export async function enqueueCampaignSends(
  supabase: AnySupabase,
  userId: string,
  campaignId: string,
): Promise<{ created: number }> {
  const { data: campaign, error: campaignError } = await supabase
    .from("referral_campaigns")
    .select("id, status, channel_mode, message_template, email_subject, discount_type, discount_value, discount_description")
    .eq("id", campaignId)
    .eq("user_id", userId)
    .maybeSingle();

  if (campaignError || !campaign) {
    throw new Error("Campaign not found");
  }

  if (campaign.status !== "active") {
    throw new Error("Campaign must be active to dispatch");
  }

  const { data: contacts, error: contactsError } = await supabase
    .from("client_contacts")
    .select("id, full_name, phone, email")
    .eq("user_id", userId)
    .eq("is_eligible", true);

  if (contactsError) {
    throw new Error(contactsError.message);
  }

  const channels = channelsForMode(campaign.channel_mode as ChannelMode);
  let created = 0;

  for (const contact of contacts ?? []) {
    for (const channel of channels) {
      if (channel === "email" && !contact.email) continue;
      if (channel === "whatsapp" && !contact.phone) continue;

      const token = crypto.randomUUID().replace(/-/g, "");
      const { error } = await supabase.from("referral_requests").upsert(
        {
          user_id: userId,
          campaign_id: campaignId,
          contact_id: contact.id,
          token,
          channel,
          status: "queued",
        },
        { onConflict: "campaign_id,contact_id,channel", ignoreDuplicates: true },
      );

      if (!error) {
        created += 1;
        await writeReferralEvent(supabase, {
          userId,
          eventType: "message_queued",
          campaignId,
          contactId: contact.id,
          metadata: { channel },
          idempotencyKey: `queued:${campaignId}:${contact.id}:${channel}`,
        });
      }
    }
  }

  return { created };
}

export async function processQueuedRequests(
  supabase: AnySupabase,
  userId: string,
  campaignId?: string,
  limit = 50,
): Promise<{ sent: number; failed: number }> {
  let query = supabase
    .from("referral_requests")
    .select(
      "id, token, channel, send_attempts, campaign_id, contact_id, campaign:referral_campaigns(id, message_template, email_subject, discount_type, discount_value, discount_description), contact:client_contacts(id, full_name, phone, email)",
    )
    .eq("user_id", userId)
    .in("status", ["queued", "failed"])
    .lt("send_attempts", MAX_SEND_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }

  const { data: requests, error } = await query;
  if (error) throw new Error(error.message);

  const needsWhatsapp = (requests ?? []).some((r) => r.channel === "whatsapp");
  const whatsappConnection = needsWhatsapp
    ? await getValidWhatsappConnection(supabase, userId)
    : null;

  let sent = 0;
  let failed = 0;

  for (const request of requests ?? []) {
    // Supabase nested select typing can be array or object depending on relationship inference.
    const campaign = Array.isArray(request.campaign)
      ? request.campaign[0]
      : request.campaign;
    const contact = Array.isArray(request.contact)
      ? request.contact[0]
      : request.contact;

    if (!campaign || !contact) {
      failed += 1;
      continue;
    }

    const attempts = (request.send_attempts ?? 0) + 1;
    if (attempts > 1) {
      // Soft backoff for retries (non-blocking sleep for small batches).
      await new Promise((r) => setTimeout(r, Math.min(backoffMs(attempts), 2000)));
    }

    const referralLink = `${appBaseUrl()}/r/${request.token}`;
    const discountLabel =
      campaign.discount_type === "percent"
        ? `${campaign.discount_value}% off`
        : `$${campaign.discount_value} off`;

    const body = renderTemplate(campaign.message_template || defaultMessageTemplate(), {
      first_name: String(contact.full_name).split(" ")[0] ?? contact.full_name,
      full_name: contact.full_name,
      discount: discountLabel,
      discount_description: campaign.discount_description ?? "",
      referral_link: referralLink,
    });

    let result;
    if (request.channel === "whatsapp") {
      if (!whatsappConnection) {
        result = {
          ok: false as const,
          error: "WhatsApp is not connected for this account",
          retryable: false,
        };
      } else {
        result = await sendWhatsAppMessage({
          phoneNumberId: whatsappConnection.phoneNumberId,
          accessToken: whatsappConnection.accessToken,
          toPhone: contact.phone,
          body,
        });
      }
    } else {
      result = await sendEmailMessage({
        toEmail: contact.email,
        subject: campaign.email_subject || "Refer a friend",
        body,
      });
    }

    if (result.ok) {
      await supabase
        .from("referral_requests")
        .update({
          status: "sent",
          send_attempts: attempts,
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", request.id);

      await writeReferralEvent(supabase, {
        userId,
        eventType: "message_sent",
        campaignId: request.campaign_id,
        requestId: request.id,
        contactId: request.contact_id,
        metadata: { channel: request.channel, providerId: result.providerId },
        idempotencyKey: `sent:${request.id}`,
      });
      sent += 1;
    } else {
      const terminal = !result.retryable || attempts >= MAX_SEND_ATTEMPTS;
      await supabase
        .from("referral_requests")
        .update({
          status: terminal ? "failed" : "queued",
          send_attempts: attempts,
          last_error: result.error,
        })
        .eq("id", request.id);

      await writeReferralEvent(supabase, {
        userId,
        eventType: "message_failed",
        campaignId: request.campaign_id,
        requestId: request.id,
        contactId: request.contact_id,
        metadata: { channel: request.channel, error: result.error, attempts },
        idempotencyKey: `failed:${request.id}:${attempts}`,
      });
      failed += 1;
    }
  }

  return { sent, failed };
}

export function defaultMessageTemplate(): string {
  return "Hi {{first_name}}! Enjoyed your visit? Refer a friend and they get {{discount}}. Share your link: {{referral_link}}";
}

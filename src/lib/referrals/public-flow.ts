import { createAdminClient } from "@/utils/supabase/admin";
import { normalizeEmail, normalizePhone } from "./eligibility";
import { writeReferralEvent } from "./events";

export type PublicReferralContext = {
  requestId: string;
  userId: string;
  campaignId: string;
  contactId: string;
  referrerName: string;
  businessLabel: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  discountDescription: string;
  messagePreview: string;
};

export async function resolveReferralToken(
  token: string,
): Promise<PublicReferralContext | null> {
  const supabase = createAdminClient();

  const { data: request, error } = await supabase
    .from("referral_requests")
    .select(
      "id, user_id, campaign_id, contact_id, status, clicked_at, contact:client_contacts(full_name), campaign:referral_campaigns(discount_type, discount_value, discount_description, message_template, name)",
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !request) return null;

  const contact = Array.isArray(request.contact) ? request.contact[0] : request.contact;
  const campaign = Array.isArray(request.campaign) ? request.campaign[0] : request.campaign;
  if (!contact || !campaign) return null;

  if (!request.clicked_at) {
    await supabase
      .from("referral_requests")
      .update({
        status: request.status === "sent" || request.status === "queued" ? "clicked" : request.status,
        clicked_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    await writeReferralEvent(supabase, {
      userId: request.user_id,
      eventType: "link_clicked",
      campaignId: request.campaign_id,
      requestId: request.id,
      contactId: request.contact_id,
      idempotencyKey: `link_clicked:${request.id}`,
    });
  }

  await writeReferralEvent(supabase, {
    userId: request.user_id,
    eventType: "referral_form_viewed",
    campaignId: request.campaign_id,
    requestId: request.id,
    contactId: request.contact_id,
    idempotencyKey: `referral_form_viewed:${request.id}:${new Date().toISOString().slice(0, 13)}`,
  });

  return {
    requestId: request.id,
    userId: request.user_id,
    campaignId: request.campaign_id,
    contactId: request.contact_id,
    referrerName: contact.full_name,
    businessLabel: campaign.name,
    discountType: campaign.discount_type,
    discountValue: Number(campaign.discount_value),
    discountDescription: campaign.discount_description ?? "",
    messagePreview: campaign.message_template ?? "",
  };
}

export async function submitReferralLead(input: {
  requestToken: string;
  fullName: string;
  phone?: string;
  email?: string;
}): Promise<{ leadToken: string } | { error: string; status: number }> {
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const email = input.email ? normalizeEmail(input.email) : "";

  if (!input.fullName.trim()) {
    return { error: "Name is required", status: 400 };
  }
  if (!phone && !email) {
    return { error: "Phone or email is required", status: 400 };
  }

  const supabase = createAdminClient();
  const { data: request } = await supabase
    .from("referral_requests")
    .select("id, user_id, campaign_id, contact_id")
    .eq("token", input.requestToken)
    .maybeSingle();

  if (!request) {
    return { error: "Invalid referral link", status: 404 };
  }

  const leadToken = crypto.randomUUID().replace(/-/g, "");

  const { data: lead, error } = await supabase
    .from("referral_leads")
    .insert({
      user_id: request.user_id,
      campaign_id: request.campaign_id,
      request_id: request.id,
      referrer_contact_id: request.contact_id,
      full_name: input.fullName.trim(),
      phone: phone || null,
      email: email || null,
      token: leadToken,
      status: "submitted",
    })
    .select("id")
    .single();

  if (error || !lead) {
    return { error: error?.message ?? "Failed to submit referral", status: 500 };
  }

  await supabase
    .from("referral_requests")
    .update({ status: "converted" })
    .eq("id", request.id);

  await writeReferralEvent(supabase, {
    userId: request.user_id,
    eventType: "referral_submitted",
    campaignId: request.campaign_id,
    requestId: request.id,
    leadId: lead.id,
    contactId: request.contact_id,
    idempotencyKey: `referral_submitted:${lead.id}`,
  });

  return { leadToken };
}

export type PublicLeadContext = {
  leadId: string;
  userId: string;
  campaignId: string;
  referrerName: string;
  leadName: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  discountDescription: string;
  businessLabel: string;
  status: string;
};

export async function resolveLeadToken(
  token: string,
): Promise<PublicLeadContext | null> {
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("referral_leads")
    .select(
      "id, user_id, campaign_id, full_name, status, referrer:client_contacts!referral_leads_referrer_contact_id_fkey(full_name), campaign:referral_campaigns(name, discount_type, discount_value, discount_description)",
    )
    .eq("token", token)
    .maybeSingle();

  if (!lead) return null;

  const referrer = Array.isArray(lead.referrer) ? lead.referrer[0] : lead.referrer;
  const campaign = Array.isArray(lead.campaign) ? lead.campaign[0] : lead.campaign;
  if (!referrer || !campaign) return null;

  if (lead.status === "submitted") {
    await supabase
      .from("referral_leads")
      .update({ status: "opened" })
      .eq("id", lead.id);
  }

  await writeReferralEvent(supabase, {
    userId: lead.user_id,
    eventType: "referred_link_opened",
    campaignId: lead.campaign_id,
    leadId: lead.id,
    idempotencyKey: `referred_link_opened:${lead.id}`,
  });

  return {
    leadId: lead.id,
    userId: lead.user_id,
    campaignId: lead.campaign_id,
    referrerName: referrer.full_name,
    leadName: lead.full_name,
    discountType: campaign.discount_type,
    discountValue: Number(campaign.discount_value),
    discountDescription: campaign.discount_description ?? "",
    businessLabel: campaign.name,
    status: lead.status,
  };
}

export async function markLeadBookingStarted(leadToken: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: lead } = await supabase
    .from("referral_leads")
    .select("id, user_id, campaign_id, status")
    .eq("token", leadToken)
    .maybeSingle();

  if (!lead) return false;

  if (lead.status === "submitted" || lead.status === "opened") {
    await supabase
      .from("referral_leads")
      .update({ status: "booking_started" })
      .eq("id", lead.id);
  }

  await writeReferralEvent(supabase, {
    userId: lead.user_id,
    eventType: "appointment_started",
    campaignId: lead.campaign_id,
    leadId: lead.id,
    idempotencyKey: `appointment_started:${lead.id}`,
  });

  return true;
}

/**
 * Completes booking: creates/updates a contact, issues reward conversion,
 * and marks lead as booked + rewarded (discount on booking).
 */
export async function completeLeadBooking(input: {
  leadToken: string;
  preferredDate?: string;
  notes?: string;
}): Promise<{ ok: true } | { error: string; status: number }> {
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("referral_leads")
    .select(
      "id, user_id, campaign_id, request_id, referrer_contact_id, full_name, phone, email, status, campaign:referral_campaigns(discount_type, discount_value)",
    )
    .eq("token", input.leadToken)
    .maybeSingle();

  if (!lead) return { error: "Invalid booking link", status: 404 };

  const campaign = Array.isArray(lead.campaign) ? lead.campaign[0] : lead.campaign;
  if (!campaign) return { error: "Campaign missing", status: 400 };

  if (lead.status === "booked" || lead.status === "rewarded") {
    return { ok: true };
  }

  const today = new Date().toISOString().slice(0, 10);
  const phone = lead.phone || `+unknown-${lead.id.slice(0, 8)}`;
  const email = lead.email || `lead-${lead.id.slice(0, 8)}@referapex.local`;

  // Upsert referred person into client_contacts.
  let bookedContactId: string | null = null;

  const { data: existingByPhone } = lead.phone
    ? await supabase
        .from("client_contacts")
        .select("id")
        .eq("user_id", lead.user_id)
        .eq("phone", lead.phone)
        .maybeSingle()
    : { data: null };

  const { data: existingByEmail } =
    !existingByPhone && lead.email
      ? await supabase
          .from("client_contacts")
          .select("id")
          .eq("user_id", lead.user_id)
          .eq("email", lead.email)
          .maybeSingle()
      : { data: null };

  const existing = existingByPhone ?? existingByEmail;

  if (existing) {
    bookedContactId = existing.id;
    await supabase
      .from("client_contacts")
      .update({
        booking_status: "booked",
        referred_by_contact_id: lead.referrer_contact_id,
        referral_code: input.leadToken.slice(0, 12),
        last_service_date: today,
      })
      .eq("id", existing.id);
  } else {
    const { data: created, error: createError } = await supabase
      .from("client_contacts")
      .insert({
        user_id: lead.user_id,
        full_name: lead.full_name,
        phone,
        email,
        last_service_date: today,
        referred_by_contact_id: lead.referrer_contact_id,
        referral_code: input.leadToken.slice(0, 12),
        booking_status: "booked",
        is_eligible: false,
      })
      .select("id")
      .single();

    if (createError || !created) {
      return { error: createError?.message ?? "Failed to create contact", status: 500 };
    }
    bookedContactId = created.id;
  }

  await supabase
    .from("referral_leads")
    .update({ status: "booked" })
    .eq("id", lead.id);

  const bookedAt = new Date().toISOString();

  const { data: conversion, error: conversionError } = await supabase
    .from("referral_conversions")
    .upsert(
      {
        user_id: lead.user_id,
        campaign_id: lead.campaign_id,
        lead_id: lead.id,
        booked_contact_id: bookedContactId,
        discount_type: campaign.discount_type,
        discount_value: campaign.discount_value,
        reward_status: "issued",
        booked_at: bookedAt,
        rewarded_at: bookedAt,
      },
      { onConflict: "lead_id" },
    )
    .select("id")
    .single();

  if (conversionError) {
    return { error: conversionError.message, status: 500 };
  }

  await supabase
    .from("referral_leads")
    .update({ status: "rewarded" })
    .eq("id", lead.id);

  await writeReferralEvent(supabase, {
    userId: lead.user_id,
    eventType: "appointment_booked",
    campaignId: lead.campaign_id,
    requestId: lead.request_id,
    leadId: lead.id,
    contactId: bookedContactId,
    metadata: {
      preferredDate: input.preferredDate ?? null,
      notes: input.notes ?? null,
      conversionId: conversion?.id,
    },
    idempotencyKey: `appointment_booked:${lead.id}`,
  });

  await writeReferralEvent(supabase, {
    userId: lead.user_id,
    eventType: "reward_issued",
    campaignId: lead.campaign_id,
    leadId: lead.id,
    contactId: bookedContactId,
    metadata: {
      discountType: campaign.discount_type,
      discountValue: campaign.discount_value,
    },
    idempotencyKey: `reward_issued:${lead.id}`,
  });

  return { ok: true };
}

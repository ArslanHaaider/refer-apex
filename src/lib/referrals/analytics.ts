import type { createClient } from "@/utils/supabase/server";
import type { FunnelMetrics, ReferralLeadRow, ReferralRequestRow } from "./types";

type SupabaseServerClient = ReturnType<typeof createClient>;

export async function getFunnelMetrics(
  supabase: SupabaseServerClient,
  userId: string,
  campaignId?: string,
): Promise<FunnelMetrics> {
  let eventsQuery = supabase
    .from("referral_events")
    .select("event_type")
    .eq("user_id", userId);

  if (campaignId) {
    eventsQuery = eventsQuery.eq("campaign_id", campaignId);
  }

  const { data: events } = await eventsQuery;

  const counts: FunnelMetrics = {
    sent: 0,
    clicked: 0,
    referralSubmitted: 0,
    bookingStarted: 0,
    booked: 0,
    rewarded: 0,
  };

  for (const event of events ?? []) {
    switch (event.event_type) {
      case "message_sent":
        counts.sent += 1;
        break;
      case "link_clicked":
        counts.clicked += 1;
        break;
      case "referral_submitted":
        counts.referralSubmitted += 1;
        break;
      case "appointment_started":
        counts.bookingStarted += 1;
        break;
      case "appointment_booked":
        counts.booked += 1;
        break;
      case "reward_issued":
        counts.rewarded += 1;
        break;
      default:
        break;
    }
  }

  return counts;
}

export async function listReferralLeads(
  supabase: SupabaseServerClient,
  userId: string,
  campaignId?: string,
): Promise<ReferralLeadRow[]> {
  let query = supabase
    .from("referral_leads")
    .select(
      "id, campaign_id, full_name, phone, email, status, created_at, campaign:referral_campaigns(name), referrer:client_contacts!referral_leads_referrer_contact_id_fkey(full_name), conversion:referral_conversions(booked_at, rewarded_at)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const campaign = Array.isArray(row.campaign) ? row.campaign[0] : row.campaign;
    const referrer = Array.isArray(row.referrer) ? row.referrer[0] : row.referrer;
    const conversion = Array.isArray(row.conversion) ? row.conversion[0] : row.conversion;

    return {
      id: row.id,
      campaignId: row.campaign_id,
      campaignName: campaign?.name ?? "Campaign",
      referrerName: referrer?.full_name ?? "Unknown",
      fullName: row.full_name,
      phone: row.phone,
      email: row.email,
      status: row.status,
      createdAt: row.created_at,
      bookedAt: conversion?.booked_at ?? null,
      rewardedAt: conversion?.rewarded_at ?? null,
    };
  });
}

export async function listReferralRequests(
  supabase: SupabaseServerClient,
  userId: string,
  campaignId?: string,
): Promise<ReferralRequestRow[]> {
  let query = supabase
    .from("referral_requests")
    .select(
      "id, campaign_id, contact_id, channel, status, sent_at, clicked_at, created_at, contact:client_contacts(full_name, email, phone)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const contact = Array.isArray(row.contact) ? row.contact[0] : row.contact;
    return {
      id: row.id,
      campaignId: row.campaign_id,
      contactId: row.contact_id,
      contactName: contact?.full_name ?? "Unknown",
      contactEmail: contact?.email ?? "",
      contactPhone: contact?.phone ?? "",
      channel: row.channel,
      status: row.status,
      sentAt: row.sent_at,
      clickedAt: row.clicked_at,
      createdAt: row.created_at,
    };
  });
}

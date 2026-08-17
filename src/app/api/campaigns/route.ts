import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { defaultMessageTemplate } from "@/lib/referrals/dispatch";
import { writeReferralEvent } from "@/lib/referrals/events";
import type { ChannelMode, DiscountType, ReferralCampaign } from "@/lib/referrals/types";

function mapCampaign(row: {
  id: string;
  name: string;
  status: ReferralCampaign["status"];
  channel_mode: ChannelMode;
  message_template: string;
  email_subject: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_description: string;
  created_at: string;
  updated_at: string;
}): ReferralCampaign {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    channelMode: row.channel_mode,
    messageTemplate: row.message_template,
    emailSubject: row.email_subject,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    discountDescription: row.discount_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from("referral_campaigns")
    .select(
      "id, name, status, channel_mode, message_template, email_subject, discount_type, discount_value, discount_description, created_at, updated_at",
    )
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    campaigns: (data ?? []).map(mapCampaign),
  });
}

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`campaigns:create:${auth.userId}`, 20, 60_000);
  if (limited) return limited;

  let body: {
    name?: string;
    channelMode?: ChannelMode;
    messageTemplate?: string;
    emailSubject?: string;
    discountType?: DiscountType;
    discountValue?: number;
    discountDescription?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const channelMode = body.channelMode ?? "both";
  if (!["email", "whatsapp", "both"].includes(channelMode)) {
    return NextResponse.json({ error: "Invalid channelMode" }, { status: 400 });
  }

  const payload = {
    user_id: auth.userId,
    name: body.name.trim(),
    status: "draft" as const,
    channel_mode: channelMode,
    message_template: body.messageTemplate?.trim() || defaultMessageTemplate(),
    email_subject:
      body.emailSubject?.trim() || "You've been invited to refer a friend",
    discount_type: body.discountType ?? "percent",
    discount_value: body.discountValue ?? 10,
    discount_description: body.discountDescription?.trim() ?? "",
  };

  const { data, error } = await supabase
    .from("referral_campaigns")
    .insert(payload)
    .select(
      "id, name, status, channel_mode, message_template, email_subject, discount_type, discount_value, discount_description, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create campaign" },
      { status: 500 },
    );
  }

  await writeReferralEvent(supabase, {
    userId: auth.userId,
    eventType: "campaign_created",
    campaignId: data.id,
    idempotencyKey: `campaign_created:${data.id}`,
  });

  return NextResponse.json({ campaign: mapCampaign(data) }, { status: 201 });
}

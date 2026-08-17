import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { ChannelMode, DiscountType, ReferralCampaign } from "@/lib/referrals/types";

type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from("referral_campaigns")
    .select(
      "id, name, status, channel_mode, message_template, email_subject, discount_type, discount_value, discount_description, created_at, updated_at",
    )
    .eq("id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign: mapCampaign(data) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(`campaigns:update:${auth.userId}`, 30, 60_000);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (
    typeof body.channelMode === "string" &&
    ["email", "whatsapp", "both"].includes(body.channelMode)
  ) {
    updates.channel_mode = body.channelMode;
  }
  if (typeof body.messageTemplate === "string") {
    updates.message_template = body.messageTemplate;
  }
  if (typeof body.emailSubject === "string") {
    updates.email_subject = body.emailSubject;
  }
  if (
    typeof body.discountType === "string" &&
    ["percent", "fixed"].includes(body.discountType)
  ) {
    updates.discount_type = body.discountType;
  }
  if (typeof body.discountValue === "number") {
    updates.discount_value = body.discountValue;
  }
  if (typeof body.discountDescription === "string") {
    updates.discount_description = body.discountDescription;
  }
  if (
    typeof body.status === "string" &&
    ["draft", "active", "paused", "archived"].includes(body.status)
  ) {
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Guardrails when activating.
  if (updates.status === "active") {
    const { data: connection } = await supabase
      .from("google_sheet_connections")
      .select("spreadsheet_id, sheet_name, column_mapping")
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (!connection?.spreadsheet_id || !connection.sheet_name) {
      return NextResponse.json(
        { error: "Connect and select a Google Sheet before activating a campaign." },
        { status: 400 },
      );
    }

    const { data: current } = await supabase
      .from("referral_campaigns")
      .select("channel_mode")
      .eq("id", id)
      .eq("user_id", auth.userId)
      .maybeSingle();

    const mode = (updates.channel_mode as string | undefined) ?? current?.channel_mode;

    if (mode === "whatsapp" || mode === "both") {
      const { data: whatsappConnection } = await supabase
        .from("whatsapp_connections")
        .select("status")
        .eq("user_id", auth.userId)
        .maybeSingle();

      if (whatsappConnection?.status !== "connected") {
        return NextResponse.json(
          {
            error: "Connect WhatsApp in Settings before activating a campaign with WhatsApp enabled.",
          },
          { status: 400 },
        );
      }
    }
  }

  const { data, error } = await supabase
    .from("referral_campaigns")
    .update(updates)
    .eq("id", id)
    .eq("user_id", auth.userId)
    .select(
      "id, name, status, channel_mode, message_template, email_subject, discount_type, discount_value, discount_description, created_at, updated_at",
    )
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign: mapCampaign(data) });
}

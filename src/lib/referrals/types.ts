export type ChannelMode = "email" | "whatsapp" | "both";
export type CampaignStatus = "draft" | "active" | "paused" | "archived";
export type DiscountType = "percent" | "fixed";
export type RequestStatus =
  | "pending"
  | "queued"
  | "sent"
  | "failed"
  | "clicked"
  | "converted";
export type LeadStatus =
  | "submitted"
  | "opened"
  | "booking_started"
  | "booked"
  | "rewarded";
export type BookingStatus = "none" | "booked" | "attended" | "paid";
export type SyncRunStatus = "running" | "succeeded" | "failed";

export type ColumnMapping = {
  full_name: string;
  phone: string;
  email: string;
  last_service_date: string;
  referred_by_contact_id?: string;
  referral_code?: string;
  booking_status?: string;
};

export type SheetConnectionStatus = {
  connected: boolean;
  email: string | null;
  serviceAccountEmail: string | null;
  eligibilityDays: number | null;
  spreadsheetId: string | null;
  spreadsheetTitle: string | null;
  sheetName: string | null;
  columnMapping: ColumnMapping | null;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  status: "connected" | "needs_reauth" | "disconnected" | null;
  isMock: boolean;
};

export type WhatsappConnectionStatus = {
  connected: boolean;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  status: "connected" | "needs_reauth" | null;
  isMock: boolean;
};

export type SpreadsheetOption = {
  id: string;
  name: string;
};

export type SheetTabOption = {
  title: string;
  sheetId: number;
};

export type ClientContact = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  lastServiceDate: string;
  isEligible: boolean;
  bookingStatus: BookingStatus;
  referralCode: string | null;
  createdAt: string;
};

export type ReferralCampaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  channelMode: ChannelMode;
  messageTemplate: string;
  emailSubject: string;
  discountType: DiscountType;
  discountValue: number;
  discountDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type ReferralRequestRow = {
  id: string;
  campaignId: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  channel: "email" | "whatsapp";
  status: RequestStatus;
  sentAt: string | null;
  clickedAt: string | null;
  createdAt: string;
};

export type ReferralLeadRow = {
  id: string;
  campaignId: string;
  campaignName: string;
  referrerName: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  status: LeadStatus;
  createdAt: string;
  bookedAt: string | null;
  rewardedAt: string | null;
};

export type FunnelMetrics = {
  sent: number;
  clicked: number;
  referralSubmitted: number;
  bookingStarted: number;
  booked: number;
  rewarded: number;
};

export type ReferralEventType =
  | "campaign_created"
  | "audience_imported"
  | "message_queued"
  | "message_sent"
  | "message_failed"
  | "link_clicked"
  | "referral_form_viewed"
  | "referral_submitted"
  | "referred_link_opened"
  | "appointment_started"
  | "appointment_booked"
  | "reward_issued";

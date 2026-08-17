-- Referral Campaign v1: Google Sheets data source, contacts, campaigns,
-- referral flow, conversions, and event analytics.

-- Shared updated_at trigger helper (idempotent with google_connections migration)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Google Sheets connections ───────────────────────────────────────────────
create table if not exists public.google_sheet_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  google_account_email text,
  encrypted_access_token text not null,
  encrypted_refresh_token text not null,
  scope text not null,
  expires_at timestamptz not null,
  spreadsheet_id text,
  spreadsheet_title text,
  sheet_name text,
  column_mapping jsonb not null default '{}'::jsonb,
  status text not null default 'connected'
    check (status in ('connected', 'needs_reauth', 'disconnected')),
  last_sync_at timestamptz,
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_sheet_connections enable row level security;

create policy "Users can read own sheet connection"
  on public.google_sheet_connections for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own sheet connection"
  on public.google_sheet_connections for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own sheet connection"
  on public.google_sheet_connections for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own sheet connection"
  on public.google_sheet_connections for delete to authenticated
  using ((select auth.uid()) = user_id);

drop trigger if exists set_google_sheet_connections_updated_at on public.google_sheet_connections;
create trigger set_google_sheet_connections_updated_at
  before update on public.google_sheet_connections
  for each row execute function public.set_updated_at();

-- ── Sheet sync runs ─────────────────────────────────────────────────────────
create table if not exists public.sheet_sync_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'running'
    check (status in ('running', 'succeeded', 'failed')),
  rows_scanned integer not null default 0,
  rows_upserted integer not null default 0,
  rows_skipped integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists sheet_sync_runs_user_id_started_at_idx
  on public.sheet_sync_runs (user_id, started_at desc);

alter table public.sheet_sync_runs enable row level security;

create policy "Users can read own sync runs"
  on public.sheet_sync_runs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own sync runs"
  on public.sheet_sync_runs for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own sync runs"
  on public.sheet_sync_runs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ── Client contacts (canonical synced audience) ─────────────────────────────
create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  last_service_date date not null,
  source_row_hash text,
  referred_by_contact_id uuid references public.client_contacts (id) on delete set null,
  referral_code text,
  booking_status text not null default 'none'
    check (booking_status in ('none', 'booked', 'attended', 'paid')),
  is_eligible boolean not null default false,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, phone),
  unique (user_id, email)
);

create index if not exists client_contacts_user_id_eligible_idx
  on public.client_contacts (user_id, is_eligible);

create index if not exists client_contacts_user_id_last_service_date_idx
  on public.client_contacts (user_id, last_service_date);

alter table public.client_contacts enable row level security;

create policy "Users can read own contacts"
  on public.client_contacts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own contacts"
  on public.client_contacts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own contacts"
  on public.client_contacts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own contacts"
  on public.client_contacts for delete to authenticated
  using ((select auth.uid()) = user_id);

drop trigger if exists set_client_contacts_updated_at on public.client_contacts;
create trigger set_client_contacts_updated_at
  before update on public.client_contacts
  for each row execute function public.set_updated_at();

-- ── Referral campaigns ──────────────────────────────────────────────────────
create table if not exists public.referral_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused', 'archived')),
  channel_mode text not null default 'both'
    check (channel_mode in ('email', 'whatsapp', 'both')),
  message_template text not null default '',
  email_subject text not null default 'You''ve been invited to refer a friend',
  discount_type text not null default 'percent'
    check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null default 10,
  discount_description text not null default '',
  whatsapp_phone_number_id text,
  whatsapp_access_token_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists referral_campaigns_user_id_status_idx
  on public.referral_campaigns (user_id, status);

alter table public.referral_campaigns enable row level security;

create policy "Users can read own campaigns"
  on public.referral_campaigns for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own campaigns"
  on public.referral_campaigns for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own campaigns"
  on public.referral_campaigns for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own campaigns"
  on public.referral_campaigns for delete to authenticated
  using ((select auth.uid()) = user_id);

drop trigger if exists set_referral_campaigns_updated_at on public.referral_campaigns;
create trigger set_referral_campaigns_updated_at
  before update on public.referral_campaigns
  for each row execute function public.set_updated_at();

-- ── Referral requests (outbound invitations to existing clients) ────────────
create table if not exists public.referral_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid not null references public.referral_campaigns (id) on delete cascade,
  contact_id uuid not null references public.client_contacts (id) on delete cascade,
  token text not null unique,
  channel text not null check (channel in ('email', 'whatsapp')),
  status text not null default 'pending'
    check (status in ('pending', 'queued', 'sent', 'failed', 'clicked', 'converted')),
  send_attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, contact_id, channel)
);

create index if not exists referral_requests_user_id_status_idx
  on public.referral_requests (user_id, status);

create index if not exists referral_requests_campaign_id_idx
  on public.referral_requests (campaign_id);

alter table public.referral_requests enable row level security;

create policy "Users can read own referral requests"
  on public.referral_requests for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own referral requests"
  on public.referral_requests for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own referral requests"
  on public.referral_requests for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists set_referral_requests_updated_at on public.referral_requests;
create trigger set_referral_requests_updated_at
  before update on public.referral_requests
  for each row execute function public.set_updated_at();

-- ── Referral leads (friends submitted via referral link) ────────────────────
create table if not exists public.referral_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid not null references public.referral_campaigns (id) on delete cascade,
  request_id uuid not null references public.referral_requests (id) on delete cascade,
  referrer_contact_id uuid not null references public.client_contacts (id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  token text not null unique,
  status text not null default 'submitted'
    check (status in ('submitted', 'opened', 'booking_started', 'booked', 'rewarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (phone is not null or email is not null)
);

create index if not exists referral_leads_user_id_status_idx
  on public.referral_leads (user_id, status);

create index if not exists referral_leads_campaign_id_idx
  on public.referral_leads (campaign_id);

alter table public.referral_leads enable row level security;

create policy "Users can read own referral leads"
  on public.referral_leads for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own referral leads"
  on public.referral_leads for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own referral leads"
  on public.referral_leads for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists set_referral_leads_updated_at on public.referral_leads;
create trigger set_referral_leads_updated_at
  before update on public.referral_leads
  for each row execute function public.set_updated_at();

-- ── Referral conversions (booking + reward) ─────────────────────────────────
create table if not exists public.referral_conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid not null references public.referral_campaigns (id) on delete cascade,
  lead_id uuid not null unique references public.referral_leads (id) on delete cascade,
  booked_contact_id uuid references public.client_contacts (id) on delete set null,
  discount_type text not null,
  discount_value numeric(10, 2) not null,
  reward_status text not null default 'pending'
    check (reward_status in ('pending', 'issued', 'redeemed')),
  booked_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists referral_conversions_user_id_idx
  on public.referral_conversions (user_id);

alter table public.referral_conversions enable row level security;

create policy "Users can read own referral conversions"
  on public.referral_conversions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own referral conversions"
  on public.referral_conversions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own referral conversions"
  on public.referral_conversions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists set_referral_conversions_updated_at on public.referral_conversions;
create trigger set_referral_conversions_updated_at
  before update on public.referral_conversions
  for each row execute function public.set_updated_at();

-- ── Referral events (append-only funnel analytics) ──────────────────────────
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid references public.referral_campaigns (id) on delete set null,
  request_id uuid references public.referral_requests (id) on delete set null,
  lead_id uuid references public.referral_leads (id) on delete set null,
  contact_id uuid references public.client_contacts (id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);

create index if not exists referral_events_user_id_created_at_idx
  on public.referral_events (user_id, created_at desc);

create index if not exists referral_events_campaign_id_event_type_idx
  on public.referral_events (campaign_id, event_type);

alter table public.referral_events enable row level security;

create policy "Users can read own referral events"
  on public.referral_events for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own referral events"
  on public.referral_events for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- TextBee SMS gateway: one Android device per business (user), delivery tracking,
-- and webhook idempotency. Replaces the account-level ClickSend configuration.
--
-- sms_gateways and sms_webhook_receipts have RLS enabled with NO policies on
-- purpose: they hold encrypted secrets and are only accessed through the
-- service-role client on the server.

create table if not exists public.sms_gateways (
  user_id uuid primary key references auth.users (id) on delete cascade,
  api_key_enc text not null,
  device_id text,
  device_name text,
  webhook_id text not null unique,
  signing_secret_enc text not null,
  webhook_subscription_id text,
  status text not null default 'pending_test'
    check (status in ('pending_test', 'connected', 'needs_attention')),
  status_detail text,
  default_country text not null default 'US',
  daily_cap integer not null default 200 check (daily_cap > 0),
  min_interval_seconds integer not null default 5 check (min_interval_seconds >= 0),
  last_test_at timestamptz,
  last_webhook_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sms_gateways enable row level security;

drop trigger if exists set_sms_gateways_updated_at on public.sms_gateways;
create trigger set_sms_gateways_updated_at
  before update on public.sms_gateways
  for each row execute function public.set_updated_at();

-- Delivery tracking on outbound requests.
alter table public.referral_requests
  add column if not exists provider_batch_id text,
  add column if not exists provider_message_id text,
  add column if not exists delivery_status text
    check (delivery_status in ('pending', 'dispatched', 'sent', 'delivered', 'failed', 'unknown')),
  add column if not exists delivered_at timestamptz;

create index if not exists referral_requests_provider_batch_id_idx
  on public.referral_requests (provider_batch_id) where provider_batch_id is not null;

create index if not exists referral_requests_provider_message_id_idx
  on public.referral_requests (provider_message_id) where provider_message_id is not null;

-- Webhook idempotency: TextBee retries deliveries with an identical idempotencyKey.
create table if not exists public.sms_webhook_receipts (
  idempotency_key text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  event text not null,
  received_at timestamptz not null default now()
);

create index if not exists sms_webhook_receipts_received_at_idx
  on public.sms_webhook_receipts (received_at);

alter table public.sms_webhook_receipts enable row level security;

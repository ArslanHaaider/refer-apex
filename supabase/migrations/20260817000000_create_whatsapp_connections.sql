-- WhatsApp Embedded Signup connection: one per account, replaces the
-- per-campaign whatsapp_phone_number_id / whatsapp_access_token_encrypted
-- columns on referral_campaigns (dropped in the following migration).

create table if not exists public.whatsapp_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  waba_id text not null,
  phone_number_id text not null,
  display_phone_number text,
  verified_name text,
  encrypted_access_token text not null,
  token_expires_at timestamptz not null,
  status text not null default 'connected'
    check (status in ('connected', 'needs_reauth')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_connections enable row level security;

create policy "Users can read own whatsapp connection"
  on public.whatsapp_connections for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own whatsapp connection"
  on public.whatsapp_connections for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own whatsapp connection"
  on public.whatsapp_connections for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own whatsapp connection"
  on public.whatsapp_connections for delete to authenticated
  using ((select auth.uid()) = user_id);

drop trigger if exists set_whatsapp_connections_updated_at on public.whatsapp_connections;
create trigger set_whatsapp_connections_updated_at
  before update on public.whatsapp_connections
  for each row execute function public.set_updated_at();

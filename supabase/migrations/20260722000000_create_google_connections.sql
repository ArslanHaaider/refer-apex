-- Google Business Profile connections: stores per-user OAuth tokens.
-- Access/refresh tokens are encrypted application-side (AES-256-GCM) before
-- being written here; this table never holds plaintext tokens.
create table if not exists public.google_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  google_account_email text,
  encrypted_access_token text not null,
  encrypted_refresh_token text not null,
  scope text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_connections enable row level security;

create policy "Users can read own google connection"
  on public.google_connections
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own google connection"
  on public.google_connections
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own google connection"
  on public.google_connections
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own google connection"
  on public.google_connections
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_google_connections_updated_at on public.google_connections;

create trigger set_google_connections_updated_at
  before update on public.google_connections
  for each row
  execute function public.set_updated_at();

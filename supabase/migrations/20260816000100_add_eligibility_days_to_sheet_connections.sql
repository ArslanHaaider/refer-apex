alter table public.google_sheet_connections
  add column if not exists eligibility_days integer not null default 30;

alter table public.google_sheet_connections
  drop constraint if exists google_sheet_connections_eligibility_days_check;

alter table public.google_sheet_connections
  add constraint google_sheet_connections_eligibility_days_check
  check (eligibility_days >= 0);

-- Remove WhatsApp integration: drop the per-account connection table and
-- restrict campaigns/requests to the email channel. SMS support will be
-- added back as a channel option in a future migration.

drop table if exists public.whatsapp_connections;

update public.referral_campaigns set channel_mode = 'email' where channel_mode <> 'email';
alter table public.referral_campaigns drop constraint if exists referral_campaigns_channel_mode_check;
alter table public.referral_campaigns alter column channel_mode set default 'email';
alter table public.referral_campaigns add constraint referral_campaigns_channel_mode_check
  check (channel_mode in ('email'));

update public.referral_requests set channel = 'email' where channel <> 'email';
alter table public.referral_requests drop constraint if exists referral_requests_channel_check;
alter table public.referral_requests add constraint referral_requests_channel_check
  check (channel in ('email'));

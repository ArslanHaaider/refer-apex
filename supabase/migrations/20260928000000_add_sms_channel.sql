-- Re-add SMS as a channel option (via ClickSend), alongside email.
-- No per-account connection table is needed: ClickSend is configured with
-- a single account-level API key/username in environment variables.

alter table public.referral_campaigns drop constraint if exists referral_campaigns_channel_mode_check;
alter table public.referral_campaigns add constraint referral_campaigns_channel_mode_check
  check (channel_mode in ('email', 'sms', 'both'));

alter table public.referral_requests drop constraint if exists referral_requests_channel_check;
alter table public.referral_requests add constraint referral_requests_channel_check
  check (channel in ('email', 'sms'));

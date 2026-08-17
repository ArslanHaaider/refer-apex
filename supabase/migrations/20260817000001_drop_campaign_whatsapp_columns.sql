-- WhatsApp credentials are now stored per-account in whatsapp_connections
-- (see previous migration), not per-campaign.

alter table public.referral_campaigns drop column if exists whatsapp_phone_number_id;
alter table public.referral_campaigns drop column if exists whatsapp_access_token_encrypted;

-- Add reference_no column to affiliate_referral_payments
-- Stores transaction/UTR reference number when commission is paid

ALTER TABLE affiliate_referral_payments
ADD COLUMN IF NOT EXISTS reference_no TEXT DEFAULT NULL;

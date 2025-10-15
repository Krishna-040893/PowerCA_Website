-- Migration 025: Add affiliate referral tracking
-- Allows affiliates to refer other affiliates to join the program

-- Add referred_by_code column to affiliate_registrations
-- This stores the referral code of the affiliate who referred this affiliate
ALTER TABLE affiliate_registrations
ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_referred_by_code
ON affiliate_registrations(referred_by_code);

-- Add comment for documentation
COMMENT ON COLUMN affiliate_registrations.referred_by_code IS
'Referral code of the affiliate who referred this affiliate to join the program';

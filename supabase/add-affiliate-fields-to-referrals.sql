-- ====================================================
-- ADD AFFILIATE FIELDS TO AFFILIATE_REFERRALS TABLE
-- ====================================================
-- This script adds affiliate_id and referral_code columns
-- to the affiliate_referrals table for easier data access

-- Add affiliate_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'affiliate_referrals'
                   AND column_name = 'affiliate_id') THEN
        ALTER TABLE public.affiliate_referrals
        ADD COLUMN affiliate_id TEXT;
    END IF;
END $$;

-- Add referral_code column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'affiliate_referrals'
                   AND column_name = 'referral_code') THEN
        ALTER TABLE public.affiliate_referrals
        ADD COLUMN referral_code TEXT;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id
ON public.affiliate_referrals(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referral_code
ON public.affiliate_referrals(referral_code);

-- Update existing records to populate the new columns from affiliate_profiles
UPDATE public.affiliate_referrals ar
SET
    affiliate_id = ap.affiliate_id,
    referral_code = ap.referral_code
FROM public.affiliate_profiles ap
WHERE ar.affiliate_profile_id = ap.id
AND (ar.affiliate_id IS NULL OR ar.referral_code IS NULL);

-- Verify the changes
SELECT
    '✅ Columns added successfully' as status,
    COUNT(*) as total_referrals,
    COUNT(affiliate_id) as records_with_affiliate_id,
    COUNT(referral_code) as records_with_referral_code
FROM public.affiliate_referrals;

-- Show sample data
SELECT
    '--- Sample Referral Records ---' as info;

SELECT
    id,
    affiliate_id,
    referral_code,
    referred_email,
    referred_name,
    status,
    created_at
FROM public.affiliate_referrals
LIMIT 5;
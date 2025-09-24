-- ====================================================
-- FIX AFFILIATE TABLES - Add Missing Columns
-- ====================================================
-- Run this script in Supabase SQL Editor to ensure all columns exist

-- ====================================================
-- 1. Add total_referrals to affiliate_profiles if missing
-- ====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'affiliate_profiles'
                   AND column_name = 'total_referrals') THEN
        ALTER TABLE public.affiliate_profiles
        ADD COLUMN total_referrals INTEGER DEFAULT 0;
    END IF;
END $$;

-- ====================================================
-- 2. Add affiliate_id and referral_code to affiliate_referrals
-- ====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'affiliate_referrals'
                   AND column_name = 'affiliate_id') THEN
        ALTER TABLE public.affiliate_referrals
        ADD COLUMN affiliate_id TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'affiliate_referrals'
                   AND column_name = 'referral_code') THEN
        ALTER TABLE public.affiliate_referrals
        ADD COLUMN referral_code TEXT;
    END IF;
END $$;

-- ====================================================
-- 3. Create indexes for performance
-- ====================================================
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id
ON public.affiliate_referrals(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referral_code
ON public.affiliate_referrals(referral_code);

CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_total_referrals
ON public.affiliate_profiles(total_referrals);

-- ====================================================
-- 4. Update existing records to populate new columns
-- ====================================================
-- Update affiliate_referrals with affiliate_id and referral_code from profiles
UPDATE public.affiliate_referrals ar
SET
    affiliate_id = ap.affiliate_id,
    referral_code = ap.referral_code
FROM public.affiliate_profiles ap
WHERE ar.affiliate_profile_id = ap.id
AND (ar.affiliate_id IS NULL OR ar.referral_code IS NULL);

-- Count referrals for each profile and update total_referrals
UPDATE public.affiliate_profiles ap
SET total_referrals = (
    SELECT COUNT(*)
    FROM public.affiliate_referrals ar
    WHERE ar.affiliate_profile_id = ap.id
    AND ar.status = 'converted'
)
WHERE ap.total_referrals IS NULL OR ap.total_referrals = 0;

-- ====================================================
-- 5. Remove constraints that prevent multiple profiles
-- ====================================================
-- Drop unique constraint on user_id if it exists (allows multiple profiles per user)
DO $$
BEGIN
    -- Check if unique constraint exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'affiliate_profiles'
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%user_id%'
    ) THEN
        -- Get the exact constraint name and drop it
        EXECUTE (
            SELECT 'ALTER TABLE public.affiliate_profiles DROP CONSTRAINT ' || constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'affiliate_profiles'
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%user_id%'
            LIMIT 1
        );
    END IF;
END $$;

-- ====================================================
-- 6. Verify the schema
-- ====================================================
SELECT
    '--- AFFILIATE_PROFILES TABLE STRUCTURE ---' as info;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'affiliate_profiles'
ORDER BY ordinal_position;

SELECT
    '--- AFFILIATE_REFERRALS TABLE STRUCTURE ---' as info;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'affiliate_referrals'
ORDER BY ordinal_position;

-- ====================================================
-- 7. Show summary
-- ====================================================
SELECT
    '✅ AFFILIATE TABLES FIXED!' as status,
    'Next Steps:' as action,
    '1. Affiliates can create multiple referral profiles' as step1,
    '2. Each profile has a unique referral_code' as step2,
    '3. affiliate_id and referral_code stored directly in referrals table' as step3;
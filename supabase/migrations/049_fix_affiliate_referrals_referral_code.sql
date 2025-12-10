-- Migration: Fix affiliate_referrals with missing or incorrect referral_code
-- This updates existing referrals to have the correct referral_code from affiliate_registrations

-- Update affiliate_referrals where referral_code is NULL or doesn't match
-- by looking up the correct referral_code from affiliate_profiles -> affiliate_registrations

-- Step 1: Update referrals that have affiliate_profile_id but missing/wrong referral_code
UPDATE public.affiliate_referrals ar
SET referral_code = ap.referral_code
FROM public.affiliate_profiles ap
WHERE ar.affiliate_profile_id = ap.id
  AND ap.referral_code IS NOT NULL
  AND (ar.referral_code IS NULL OR ar.referral_code != ap.referral_code);

-- Step 2: Also update affiliate_profiles that have missing referral_code
-- by syncing from affiliate_registrations
UPDATE public.affiliate_profiles ap
SET referral_code = areg.referral_code
FROM public.affiliate_registrations areg
WHERE ap.affiliate_id = areg.affiliate_id
  AND areg.referral_code IS NOT NULL
  AND (ap.referral_code IS NULL OR ap.referral_code != areg.referral_code);

-- Step 3: Now update affiliate_referrals again to pick up any newly synced codes
UPDATE public.affiliate_referrals ar
SET referral_code = ap.referral_code
FROM public.affiliate_profiles ap
WHERE ar.affiliate_profile_id = ap.id
  AND ap.referral_code IS NOT NULL
  AND (ar.referral_code IS NULL OR ar.referral_code != ap.referral_code);

-- Step 4: For referrals without affiliate_profile_id, try to match via affiliate_id
UPDATE public.affiliate_referrals ar
SET referral_code = areg.referral_code
FROM public.affiliate_registrations areg
WHERE ar.affiliate_id = areg.affiliate_id
  AND areg.referral_code IS NOT NULL
  AND (ar.referral_code IS NULL OR ar.referral_code != areg.referral_code);

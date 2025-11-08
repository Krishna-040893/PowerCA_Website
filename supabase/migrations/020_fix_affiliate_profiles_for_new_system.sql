-- =====================================================
-- Fix affiliate_profiles table for new affiliate system
-- Make user_id nullable and update RLS policies
-- =====================================================

-- Ensure user_id can be NULL (for new affiliates who don't have registration_forms entry)
ALTER TABLE public.affiliate_profiles
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.affiliate_profiles.user_id IS 'Optional link to registration_forms (legacy). New affiliates use referral_code for identification.';

-- Drop old RLS policies that assume user_id is always set
DROP POLICY IF EXISTS "Users can view own affiliate profile" ON public.affiliate_profiles;
DROP POLICY IF EXISTS "Users can insert own affiliate profile" ON public.affiliate_profiles;
DROP POLICY IF EXISTS "Users can update own affiliate profile" ON public.affiliate_profiles;

-- Create new RLS policies that work with both old and new affiliates
-- For viewing profiles
CREATE POLICY "Affiliates can view own profile"
  ON public.affiliate_profiles
  FOR SELECT
  USING (
    -- Old system: Check user_id matches auth.uid()
    (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
    OR
    -- New system: Check referral_code matches their affiliate_registrations entry
    (referral_code IN (
      SELECT referral_code FROM public.affiliate_registrations
      WHERE status = 'approved'
    ))
  );

-- For inserting profiles
CREATE POLICY "Affiliates can insert own profile"
  ON public.affiliate_profiles
  FOR INSERT
  WITH CHECK (
    -- Old system: user_id matches auth.uid()
    (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
    OR
    -- New system: referral_code exists in affiliate_registrations
    (referral_code IN (
      SELECT referral_code FROM public.affiliate_registrations
      WHERE status = 'approved'
    ))
  );

-- For updating profiles
CREATE POLICY "Affiliates can update own profile"
  ON public.affiliate_profiles
  FOR UPDATE
  USING (
    -- Old system: user_id matches auth.uid()
    (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
    OR
    -- New system: referral_code matches their affiliate_registrations entry
    (referral_code IN (
      SELECT referral_code FROM public.affiliate_registrations
      WHERE status = 'approved'
    ))
  );

-- Update RLS policies for affiliate_referrals to handle new system
DROP POLICY IF EXISTS "Affiliates can view own referrals" ON public.affiliate_referrals;
DROP POLICY IF EXISTS "Affiliates can insert own referrals" ON public.affiliate_referrals;

CREATE POLICY "Affiliates can view own referrals"
  ON public.affiliate_referrals
  FOR SELECT
  USING (
    affiliate_profile_id IN (
      SELECT id FROM public.affiliate_profiles
      WHERE
        (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
        OR
        (referral_code IN (
          SELECT referral_code FROM public.affiliate_registrations
          WHERE status = 'approved'
        ))
    )
  );

CREATE POLICY "Affiliates can insert own referrals"
  ON public.affiliate_referrals
  FOR INSERT
  WITH CHECK (
    affiliate_profile_id IN (
      SELECT id FROM public.affiliate_profiles
      WHERE
        (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
        OR
        (referral_code IN (
          SELECT referral_code FROM public.affiliate_registrations
          WHERE status = 'approved'
        ))
    )
  );

-- Verify the changes
SELECT
  'Migration completed successfully!' as status,
  COUNT(*) FILTER (WHERE is_nullable = 'YES' AND column_name = 'user_id') as user_id_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'affiliate_profiles'
  AND column_name = 'user_id';

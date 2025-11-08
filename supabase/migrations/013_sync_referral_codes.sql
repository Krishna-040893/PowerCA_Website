-- =====================================================
-- Sync affiliate_profiles with admin-assigned codes
-- Updates existing profiles to use codes from affiliate_registrations
-- =====================================================

-- Update affiliate_profiles to use admin-assigned referral codes and affiliate IDs
UPDATE public.affiliate_profiles AS ap
SET
  referral_code = ar.referral_code,
  affiliate_id = ar.affiliate_id,
  updated_at = now()
FROM public.affiliate_registrations AS ar
WHERE
  ap.user_id = ar.user_id
  AND ar.status = 'approved'
  AND ar.referral_code IS NOT NULL
  AND (
    ap.referral_code != ar.referral_code
    OR ap.referral_code IS NULL
    OR ap.affiliate_id != ar.affiliate_id
    OR ap.affiliate_id IS NULL
  );

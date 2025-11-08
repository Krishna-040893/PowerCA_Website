-- =====================================================
-- Add triggers to automatically update referral counters
-- in affiliate_profiles when referrals are created/updated
-- =====================================================

-- Function to update referral counters
CREATE OR REPLACE FUNCTION update_affiliate_referral_counters()
RETURNS TRIGGER AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Get the affiliate_profile_id (works for both INSERT and UPDATE)
  profile_id := COALESCE(NEW.affiliate_profile_id, OLD.affiliate_profile_id);

  IF profile_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Recalculate all counters for this affiliate profile
  UPDATE public.affiliate_profiles
  SET
    total_referrals = (
      SELECT COUNT(*)
      FROM public.affiliate_referrals
      WHERE affiliate_profile_id = profile_id
    ),
    successful_referrals = (
      SELECT COUNT(*)
      FROM public.affiliate_referrals
      WHERE affiliate_profile_id = profile_id
        AND status IN ('completed', 'converted')
    ),
    pending_referrals = (
      SELECT COUNT(*)
      FROM public.affiliate_referrals
      WHERE affiliate_profile_id = profile_id
        AND status = 'pending'
    ),
    total_commission = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM public.affiliate_referrals
      WHERE affiliate_profile_id = profile_id
        AND status IN ('completed', 'converted')
    ),
    updated_at = now()
  WHERE id = profile_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT - when new referral is created
DROP TRIGGER IF EXISTS update_counters_on_referral_insert ON public.affiliate_referrals;
CREATE TRIGGER update_counters_on_referral_insert
  AFTER INSERT ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_referral_counters();

-- Create trigger for UPDATE - when referral status changes
DROP TRIGGER IF EXISTS update_counters_on_referral_update ON public.affiliate_referrals;
CREATE TRIGGER update_counters_on_referral_update
  AFTER UPDATE ON public.affiliate_referrals
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM NEW.status OR
    OLD.commission_amount IS DISTINCT FROM NEW.commission_amount
  )
  EXECUTE FUNCTION update_affiliate_referral_counters();

-- Create trigger for DELETE - when referral is deleted
DROP TRIGGER IF EXISTS update_counters_on_referral_delete ON public.affiliate_referrals;
CREATE TRIGGER update_counters_on_referral_delete
  AFTER DELETE ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_referral_counters();

-- Initialize counters for existing affiliate profiles
UPDATE public.affiliate_profiles ap
SET
  total_referrals = (
    SELECT COUNT(*)
    FROM public.affiliate_referrals ar
    WHERE ar.affiliate_profile_id = ap.id
  ),
  successful_referrals = (
    SELECT COUNT(*)
    FROM public.affiliate_referrals ar
    WHERE ar.affiliate_profile_id = ap.id
      AND ar.status IN ('completed', 'converted')
  ),
  pending_referrals = (
    SELECT COUNT(*)
    FROM public.affiliate_referrals ar
    WHERE ar.affiliate_profile_id = ap.id
      AND ar.status = 'pending'
  ),
  total_commission = (
    SELECT COALESCE(SUM(commission_amount), 0)
    FROM public.affiliate_referrals ar
    WHERE ar.affiliate_profile_id = ap.id
      AND ar.status IN ('completed', 'converted')
  ),
  updated_at = now();

-- Add comment
COMMENT ON FUNCTION update_affiliate_referral_counters() IS 'Automatically updates referral counters in affiliate_profiles when referrals change';

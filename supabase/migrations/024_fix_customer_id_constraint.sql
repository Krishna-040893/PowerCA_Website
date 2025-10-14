-- =====================================================
-- Fix Customer ID Constraint to Allow Affiliate-Specific IDs
-- Remove global unique constraint on customer_id
-- Add composite unique constraint on (affiliate_id, customer_id)
-- This allows: AFF001->CUS001 and AFF002->CUS001 (both valid)
-- But prevents: AFF001->CUS001 twice (invalid)
-- =====================================================

-- Drop the global unique constraint on customer_id
ALTER TABLE public.affiliate_referrals
DROP CONSTRAINT IF EXISTS affiliate_referrals_customer_id_key;

-- Add composite unique constraint (affiliate_id + customer_id)
-- This ensures each affiliate has unique customer IDs within their scope
ALTER TABLE public.affiliate_referrals
ADD CONSTRAINT affiliate_referrals_affiliate_customer_unique
UNIQUE (affiliate_id, customer_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_customer
ON public.affiliate_referrals(affiliate_id, customer_id);

-- Add comment
COMMENT ON CONSTRAINT affiliate_referrals_affiliate_customer_unique
ON public.affiliate_referrals IS
'Ensures customer IDs are unique per affiliate (e.g., AFF001 and AFF002 can both have CUS001)';

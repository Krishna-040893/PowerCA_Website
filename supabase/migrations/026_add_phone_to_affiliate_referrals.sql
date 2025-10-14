-- Add referred_phone column to affiliate_referrals table
ALTER TABLE public.affiliate_referrals
ADD COLUMN IF NOT EXISTS referred_phone TEXT;

-- Add index for phone searches
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_phone
ON public.affiliate_referrals(referred_phone);

-- Add comment
COMMENT ON COLUMN public.affiliate_referrals.referred_phone IS 'Phone number of the referred customer';

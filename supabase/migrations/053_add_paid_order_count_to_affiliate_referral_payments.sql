-- Add paid_order_count column to affiliate_referral_payments table
-- This tracks how many orders have had their commission paid
ALTER TABLE public.affiliate_referral_payments
ADD COLUMN IF NOT EXISTS paid_order_count INTEGER DEFAULT 0;

-- Comment for documentation
COMMENT ON COLUMN public.affiliate_referral_payments.paid_order_count IS 'Number of orders for which commission has been paid to the affiliate';

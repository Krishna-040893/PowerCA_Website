-- =====================================================
-- Fix affiliate_referrals table schema
-- Add missing columns and update status constraints
-- =====================================================

-- Add converted_at column (used by payment verification)
ALTER TABLE public.affiliate_referrals
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- Add payment tracking columns
ALTER TABLE public.affiliate_referrals
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS referred_phone TEXT;

-- Drop the old status constraint
ALTER TABLE public.affiliate_referrals
DROP CONSTRAINT IF EXISTS affiliate_referrals_status_check;

-- Add new status constraint including 'completed'
ALTER TABLE public.affiliate_referrals
ADD CONSTRAINT affiliate_referrals_status_check
CHECK (status IN ('pending', 'converted', 'completed', 'expired', 'cancelled'));

-- Create index for converted_at
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_converted_at
ON public.affiliate_referrals(converted_at);

-- Create index for order_id
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_order_id
ON public.affiliate_referrals(order_id);

-- Add comment
COMMENT ON COLUMN public.affiliate_referrals.converted_at IS 'Timestamp when referral was converted (payment completed)';
COMMENT ON COLUMN public.affiliate_referrals.payment_amount IS 'Amount paid by the referred customer';
COMMENT ON COLUMN public.affiliate_referrals.order_id IS 'Razorpay order ID from the payment';
COMMENT ON COLUMN public.affiliate_referrals.payment_id IS 'Razorpay payment ID from the payment';

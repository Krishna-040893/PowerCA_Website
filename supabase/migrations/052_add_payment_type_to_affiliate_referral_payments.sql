-- Add payment_type column to affiliate_referral_payments table
-- This allows tracking separate commissions for initial_payment and final_settlement
ALTER TABLE public.affiliate_referral_payments
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'initial_payment';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_payment_type
ON public.affiliate_referral_payments(payment_type);

-- Create composite index for querying by customer and payment type
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_customer_payment_type
ON public.affiliate_referral_payments(customer_id, payment_type);

-- Comment for documentation
COMMENT ON COLUMN public.affiliate_referral_payments.payment_type IS 'Type of payment: initial_payment (Installation & Support) or final_settlement for two-stage commission tracking';

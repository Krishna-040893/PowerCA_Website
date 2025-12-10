-- Add payment_count column to track number of address payments per referral
ALTER TABLE affiliate_referral_payments
ADD COLUMN IF NOT EXISTS payment_count INTEGER DEFAULT 1;

-- Add comment
COMMENT ON COLUMN affiliate_referral_payments.payment_count IS 'Number of address payments made by this referred customer';

-- Add payment mode and payment date fields to affiliate_referral_payments table
-- This allows tracking how and when the company paid the affiliate commission

-- Add payment_mode column (UPI, Bank Transfer, Cash, Cheque, etc.)
ALTER TABLE affiliate_referral_payments
ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50);

-- Add payment_date column (when the company actually paid the affiliate)
ALTER TABLE affiliate_referral_payments
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN affiliate_referral_payments.payment_mode IS 'Method used to pay affiliate commission (UPI, Bank Transfer, Cash, Cheque, etc.)';
COMMENT ON COLUMN affiliate_referral_payments.payment_date IS 'Date when the company paid the affiliate commission';

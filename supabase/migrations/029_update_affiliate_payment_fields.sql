-- Migration: Update affiliate payment fields
-- Add account_number and ifsc_code, remove payment_email

-- Add new payment fields
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT;

-- Drop the old payment_email column (if you want to keep it for backward compatibility, comment this out)
-- ALTER TABLE public.affiliate_registrations
-- DROP COLUMN IF EXISTS payment_email;

-- Create index for faster lookups on account number
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_account_number
ON public.affiliate_registrations(account_number)
WHERE account_number IS NOT NULL;

-- Add comment to document the new columns
COMMENT ON COLUMN public.affiliate_registrations.account_number IS 'Bank account number for commission payments';
COMMENT ON COLUMN public.affiliate_registrations.ifsc_code IS 'IFSC code for bank transfers';

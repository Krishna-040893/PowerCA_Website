-- =====================================================
-- Update affiliate_registrations table payment fields
-- Remove: website, payment_email
-- Add: account_number, ifsc_code
-- =====================================================

-- Remove website column from business information
ALTER TABLE public.affiliate_registrations
DROP COLUMN IF EXISTS website;

-- Remove payment_email column (no longer required)
ALTER TABLE public.affiliate_registrations
DROP COLUMN IF EXISTS payment_email;

-- Add account_number column for bank account details
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Add ifsc_code column for bank IFSC code
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS ifsc_code TEXT;

-- Add comments to new columns
COMMENT ON COLUMN public.affiliate_registrations.account_number IS 'Bank account number for commission payments';
COMMENT ON COLUMN public.affiliate_registrations.ifsc_code IS 'Bank IFSC code for commission payments';

-- Create index for account_number (for faster lookups)
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_account_number
ON public.affiliate_registrations(account_number);

-- Create index for ifsc_code (for faster lookups)
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_ifsc_code
ON public.affiliate_registrations(ifsc_code);

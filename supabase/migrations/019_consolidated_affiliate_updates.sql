-- =====================================================
-- CONSOLIDATED MIGRATION: Affiliate Registration Updates
-- Combines migrations 017 and 018
-- =====================================================

-- STEP 1: Update Payment Fields (Migration 017)
-- =====================================================

-- Remove old fields
ALTER TABLE public.affiliate_registrations
DROP COLUMN IF EXISTS website;

ALTER TABLE public.affiliate_registrations
DROP COLUMN IF EXISTS payment_email;

-- Add new payment fields
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS account_number TEXT;

ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS ifsc_code TEXT;

-- Add comments
COMMENT ON COLUMN public.affiliate_registrations.account_number IS 'Bank account number for commission payments';
COMMENT ON COLUMN public.affiliate_registrations.ifsc_code IS 'Bank IFSC code for commission payments';

-- Create indexes for payment fields
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_account_number
ON public.affiliate_registrations(account_number);

CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_ifsc_code
ON public.affiliate_registrations(ifsc_code);


-- STEP 2: Add Password Support (Migration 018)
-- =====================================================

-- Add password column for affiliate login
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add comment to password column
COMMENT ON COLUMN public.affiliate_registrations.password IS 'Hashed password for affiliate login (bcrypt)';

-- Make user_id nullable (remove registration_forms dependency)
DO $$
BEGIN
  ALTER TABLE public.affiliate_registrations
  ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    -- Column might already be nullable
    NULL;
END $$;

-- Add comment explaining the change
COMMENT ON COLUMN public.affiliate_registrations.user_id IS 'Optional link to registration_forms (legacy, not required for new affiliates)';

-- Create indexes for email-based lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_email
ON public.affiliate_registrations(email);

CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_email_status
ON public.affiliate_registrations(email, status);


-- STEP 3: Verify Changes
-- =====================================================

-- Display the updated table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'affiliate_registrations'
ORDER BY ordinal_position;

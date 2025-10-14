-- =====================================================
-- Add password field to affiliate_registrations table
-- Remove user_id dependency on registration_forms
-- =====================================================

-- Add password column for affiliate login
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add comment to password column
COMMENT ON COLUMN public.affiliate_registrations.password IS 'Hashed password for affiliate login (bcrypt)';

-- Make user_id nullable since affiliates don't need registration_forms entry
ALTER TABLE public.affiliate_registrations
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.affiliate_registrations.user_id IS 'Optional link to registration_forms (legacy, not required for new affiliates)';

-- Create index on email for faster login lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_email
ON public.affiliate_registrations(email);

-- Create index on email and status for approved affiliate lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_email_status
ON public.affiliate_registrations(email, status);

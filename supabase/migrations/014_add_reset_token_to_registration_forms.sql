-- Add password reset token columns to registration_forms table

-- Add reset_token columns if they don't exist
DO $$
BEGIN
  -- Add reset_token column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registration_forms'
    AND column_name = 'reset_token'
  ) THEN
    ALTER TABLE public.registration_forms
    ADD COLUMN reset_token TEXT;
  END IF;

  -- Add reset_token_expiry column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registration_forms'
    AND column_name = 'reset_token_expiry'
  ) THEN
    ALTER TABLE public.registration_forms
    ADD COLUMN reset_token_expiry TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add password column (instead of password_hash for consistency with API)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registration_forms'
    AND column_name = 'password'
  ) THEN
    ALTER TABLE public.registration_forms
    ADD COLUMN password TEXT;

    -- Copy data from password_hash to password if password_hash exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'registration_forms'
      AND column_name = 'password_hash'
    ) THEN
      UPDATE public.registration_forms
      SET password = password_hash
      WHERE password IS NULL;
    END IF;
  END IF;
END $$;

-- Add reset_token columns to affiliate_registrations if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'affiliate_registrations'
    AND column_name = 'reset_token'
  ) THEN
    ALTER TABLE public.affiliate_registrations
    ADD COLUMN reset_token TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'affiliate_registrations'
    AND column_name = 'reset_token_expiry'
  ) THEN
    ALTER TABLE public.affiliate_registrations
    ADD COLUMN reset_token_expiry TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create index for faster reset token lookups
CREATE INDEX IF NOT EXISTS idx_registration_forms_reset_token
ON public.registration_forms(reset_token)
WHERE reset_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_reset_token
ON public.affiliate_registrations(reset_token)
WHERE reset_token IS NOT NULL;

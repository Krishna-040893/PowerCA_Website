-- Add agreement_signing_method column to registration_forms table
ALTER TABLE registration_forms
ADD COLUMN IF NOT EXISTS agreement_signing_method TEXT;

-- Add comment for clarity
COMMENT ON COLUMN registration_forms.agreement_signing_method IS 'Signing method used: digital or manual';

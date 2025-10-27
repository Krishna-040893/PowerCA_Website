-- Add password reset columns to registration_forms table
ALTER TABLE registration_forms
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE;

-- Add password reset columns to affiliate_registrations table
ALTER TABLE affiliate_registrations
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_registration_forms_reset_token ON registration_forms(reset_token);
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_reset_token ON affiliate_registrations(reset_token);

-- Add comments
COMMENT ON COLUMN registration_forms.reset_token IS 'Token for password reset functionality';
COMMENT ON COLUMN registration_forms.reset_token_expiry IS 'Expiry timestamp for reset token';
COMMENT ON COLUMN affiliate_registrations.reset_token IS 'Token for password reset functionality';
COMMENT ON COLUMN affiliate_registrations.reset_token_expiry IS 'Expiry timestamp for reset token';

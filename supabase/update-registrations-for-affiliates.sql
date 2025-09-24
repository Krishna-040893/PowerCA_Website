-- Update registrations table to support better role management
ALTER TABLE registrations
DROP CONSTRAINT IF EXISTS registrations_role_check;

-- Add new role constraint with subscriber, customer, and affiliate options
ALTER TABLE registrations
ADD CONSTRAINT registrations_role_check
CHECK (role IN ('chartered_accountant', 'Professional', 'Student', 'Other', 'Subscriber', 'Customer', 'Affiliate'));

-- Add columns for affiliate tracking
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(50) DEFAULT 'none' CHECK (affiliate_status IN ('none', 'applied', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20) REFERENCES affiliate_profiles(affiliate_code);

-- Create index for affiliate lookups
CREATE INDEX IF NOT EXISTS idx_registrations_is_affiliate ON registrations(is_affiliate);
CREATE INDEX IF NOT EXISTS idx_registrations_affiliate_status ON registrations(affiliate_status);
CREATE INDEX IF NOT EXISTS idx_registrations_referred_by ON registrations(referred_by);

-- Update existing users to have proper roles if needed
-- This sets default roles for existing users
UPDATE registrations
SET role = CASE
  WHEN role IN ('chartered_accountant', 'Professional') THEN 'Professional'
  WHEN role = 'Student' THEN 'Student'
  ELSE 'Subscriber'
END
WHERE role NOT IN ('Subscriber', 'Customer', 'Affiliate');
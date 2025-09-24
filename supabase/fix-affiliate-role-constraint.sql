-- Fix the role constraint to allow lowercase 'affiliate' role
-- Drop the existing constraint
ALTER TABLE registrations
DROP CONSTRAINT IF EXISTS registrations_role_check;

-- Add new constraint that allows both 'Affiliate' and 'affiliate'
ALTER TABLE registrations
ADD CONSTRAINT registrations_role_check
CHECK (role IN (
    'chartered_accountant',
    'Professional',
    'Student',
    'Other',
    'Subscriber',
    'Customer',
    'Affiliate',
    'affiliate'  -- Add lowercase affiliate
));

-- Also ensure the affiliate-related columns exist
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT false;

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(50) DEFAULT 'none'
CHECK (affiliate_status IN ('none', 'applied', 'approved', 'rejected'));

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_registrations_is_affiliate ON registrations(is_affiliate);
CREATE INDEX IF NOT EXISTS idx_registrations_affiliate_status ON registrations(affiliate_status);

-- Show current role values for verification
SELECT DISTINCT role FROM registrations;
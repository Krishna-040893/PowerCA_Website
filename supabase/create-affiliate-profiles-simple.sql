-- Simple version without constraints that might cause issues
-- First check if table exists and drop it if needed
DROP TABLE IF EXISTS affiliate_profiles;

-- Create the table with basic structure
CREATE TABLE affiliate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    company_name TEXT,
    membership_no TEXT,
    registration_no TEXT,
    institute_name TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_referrals INTEGER DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0.00,
    payment_method TEXT DEFAULT 'bank_transfer',
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    status TEXT DEFAULT 'pending',
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_email ON affiliate_profiles(user_email);

-- Make user_id unique
ALTER TABLE affiliate_profiles ADD CONSTRAINT unique_user_affiliate UNIQUE (user_id);

-- Grant basic permissions
GRANT ALL ON affiliate_profiles TO postgres;
GRANT ALL ON affiliate_profiles TO authenticated;
GRANT ALL ON affiliate_profiles TO anon;
GRANT ALL ON affiliate_profiles TO service_role;
-- Drop the table if it exists (be careful with this in production!)
DROP TABLE IF EXISTS affiliate_profiles CASCADE;

-- Create affiliate_profiles table fresh
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

-- Add the unique constraint
ALTER TABLE affiliate_profiles ADD CONSTRAINT unique_user_affiliate UNIQUE (user_id);

-- Add the check constraint separately
ALTER TABLE affiliate_profiles ADD CONSTRAINT status_check CHECK (status IN ('pending', 'active', 'suspended', 'inactive'));

-- Create indexes
CREATE INDEX idx_affiliate_profiles_user_id ON affiliate_profiles(user_id);
CREATE INDEX idx_affiliate_profiles_status ON affiliate_profiles(status);

-- Enable RLS
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Service role has full access to affiliate_profiles" ON affiliate_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view their own affiliate profile" ON affiliate_profiles
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Grant permissions
GRANT SELECT ON affiliate_profiles TO authenticated;
GRANT INSERT, UPDATE ON affiliate_profiles TO authenticated;
GRANT ALL ON affiliate_profiles TO service_role;
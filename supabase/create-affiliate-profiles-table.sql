-- Create affiliate_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS affiliate_profiles (
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_user_affiliate UNIQUE (user_id),
    CONSTRAINT status_check CHECK (status IN ('pending', 'active', 'suspended', 'inactive'))
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON affiliate_profiles(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_status ON affiliate_profiles(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for service role (admin) to have full access
CREATE POLICY "Service role has full access to affiliate_profiles" ON affiliate_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy for users to view their own affiliate profile
CREATE POLICY "Users can view their own affiliate profile" ON affiliate_profiles
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Add columns to registrations table if they don't exist
DO $$
BEGIN
    -- Add is_affiliate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations'
        AND column_name = 'is_affiliate'
    ) THEN
        ALTER TABLE registrations ADD COLUMN is_affiliate BOOLEAN DEFAULT false;
    END IF;

    -- Add affiliate_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations'
        AND column_name = 'affiliate_status'
    ) THEN
        ALTER TABLE registrations ADD COLUMN affiliate_status TEXT;
    END IF;
END $$;

-- Grant permissions to authenticated users
GRANT SELECT ON affiliate_profiles TO authenticated;
GRANT INSERT, UPDATE ON affiliate_profiles TO authenticated;

-- Grant full permissions to service_role
GRANT ALL ON affiliate_profiles TO service_role;
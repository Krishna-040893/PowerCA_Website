-- Fix role constraints and add missing columns for PowerCA website
-- Run this in your Supabase SQL Editor

-- 1. First, drop the existing role constraint
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_role_check;

-- 2. Add the new role constraint with all required roles
ALTER TABLE registrations ADD CONSTRAINT registrations_role_check
CHECK (role IN ('chartered_accountant', 'Professional', 'Student', 'Other', 'Subscriber', 'Customer', 'Affiliate'));

-- 3. Add missing affiliate-related columns to registrations table
DO $$
BEGIN
    -- Add is_affiliate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'is_affiliate') THEN
        ALTER TABLE registrations ADD COLUMN is_affiliate BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add affiliate_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'affiliate_status') THEN
        ALTER TABLE registrations ADD COLUMN affiliate_status VARCHAR(20) DEFAULT NULL CHECK (affiliate_status IN ('pending', 'approved', 'rejected', NULL));
    END IF;

    -- Add affiliate_applied_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'affiliate_applied_at') THEN
        ALTER TABLE registrations ADD COLUMN affiliate_applied_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    END IF;
END $$;

-- 4. Create affiliate_applications table
CREATE TABLE IF NOT EXISTS affiliate_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    account_email VARCHAR(255) NOT NULL,
    payment_email VARCHAR(255) NOT NULL,
    website_url TEXT,
    promotion_method TEXT NOT NULL CHECK (LENGTH(promotion_method) >= 50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    approved_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create affiliate_profiles table
CREATE TABLE IF NOT EXISTS affiliate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    application_id UUID REFERENCES affiliate_applications(id) ON DELETE SET NULL,
    affiliate_code VARCHAR(20) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create affiliate_referrals table for tracking commissions
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    referral_code VARCHAR(50),
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    commission_status VARCHAR(20) DEFAULT 'pending' CHECK (commission_status IN ('pending', 'paid', 'cancelled')),
    order_value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_user_id ON affiliate_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status ON affiliate_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_code ON affiliate_profiles(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_registrations_role ON registrations(role);

-- 8. Set up Row Level Security (RLS)
ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliate_applications
CREATE POLICY "Users can view their own applications" ON affiliate_applications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own applications" ON affiliate_applications FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can manage all applications" ON affiliate_applications FOR ALL USING (true);

-- Create policies for affiliate_profiles
CREATE POLICY "Users can view their own profile" ON affiliate_profiles FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can manage all profiles" ON affiliate_profiles FOR ALL USING (true);

-- Create policies for affiliate_referrals
CREATE POLICY "Affiliates can view their own referrals" ON affiliate_referrals FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM affiliate_profiles
        WHERE affiliate_profiles.id = affiliate_referrals.affiliate_id
        AND affiliate_profiles.user_id::text = auth.uid()::text
    )
);
CREATE POLICY "Service role can manage all referrals" ON affiliate_referrals FOR ALL USING (true);

-- 9. Create a function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for automatic timestamp updates
CREATE TRIGGER update_affiliate_applications_updated_at BEFORE UPDATE ON affiliate_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_profiles_updated_at BEFORE UPDATE ON affiliate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_referrals_updated_at BEFORE UPDATE ON affiliate_referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema updated successfully! You can now use roles: chartered_accountant, Professional, Student, Other, Subscriber, Customer, Affiliate' as message;
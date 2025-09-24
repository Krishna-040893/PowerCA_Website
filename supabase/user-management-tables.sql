-- SQL to set up user management and affiliate system
-- Run this in your Supabase SQL Editor

-- 1. Add missing columns to registrations table if they don't exist
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- 2. Create user_profiles table for account setup information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name VARCHAR(255),
  company_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  alternate_phone VARCHAR(20),
  website VARCHAR(255),
  description TEXT,
  gst_number VARCHAR(50),
  pan_number VARCHAR(20),
  profile_completed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user_profiles_user_id
    FOREIGN KEY (user_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE
);

-- 3. Create affiliate_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  affiliate_code VARCHAR(20) UNIQUE NOT NULL,

  -- Profile information
  company_name VARCHAR(255),
  website_url VARCHAR(255),
  description TEXT,

  -- Contact information
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  postal_code VARCHAR(20),

  -- Bank details (should be encrypted in production)
  bank_name VARCHAR(255),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  pan_number VARCHAR(20),
  gst_number VARCHAR(50),

  -- Commission settings
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  payment_threshold DECIMAL(10,2) DEFAULT 1000.00,

  -- Statistics
  total_referrals INTEGER DEFAULT 0,
  successful_conversions INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  pending_amount DECIMAL(10,2) DEFAULT 0.00,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_affiliate_profiles_user_id
    FOREIGN KEY (user_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE
);

-- 4. Create affiliate_applications table for tracking affiliate requests
CREATE TABLE IF NOT EXISTS public.affiliate_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name VARCHAR(255),
  website_url VARCHAR(255),
  promotion_method TEXT,
  expected_referrals VARCHAR(50),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_affiliate_applications_user_id
    FOREIGN KEY (user_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_code ON public.affiliate_profiles(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_status ON public.affiliate_profiles(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_user_id ON public.affiliate_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status ON public.affiliate_applications(status);

-- 6. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_profiles_updated_at BEFORE UPDATE ON public.affiliate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
-- Allow users to view and update their own profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- Affiliate policies
CREATE POLICY "View affiliate profiles" ON public.affiliate_profiles
  FOR SELECT USING (true);

CREATE POLICY "Update affiliate profiles" ON public.affiliate_profiles
  FOR UPDATE USING (true);

CREATE POLICY "Insert affiliate profiles" ON public.affiliate_profiles
  FOR INSERT WITH CHECK (true);

-- Application policies
CREATE POLICY "View affiliate applications" ON public.affiliate_applications
  FOR SELECT USING (true);

CREATE POLICY "Insert affiliate applications" ON public.affiliate_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Update affiliate applications" ON public.affiliate_applications
  FOR UPDATE USING (true);

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.affiliate_profiles TO authenticated;
GRANT ALL ON public.affiliate_applications TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.affiliate_profiles TO service_role;
GRANT ALL ON public.affiliate_applications TO service_role;
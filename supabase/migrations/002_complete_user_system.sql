-- Complete User Management System with Role Management
-- This migration creates a comprehensive user system with roles (admin, subscriber, affiliate)

-- 1. Create users table with all necessary fields
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Authentication fields
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,

  -- Basic information
  name TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Role management
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('admin', 'subscriber', 'affiliate')),
  user_type TEXT CHECK (user_type IN ('Professional', 'Student', 'Other')),

  -- Professional specific fields
  professional_type TEXT CHECK (professional_type IN ('CA', 'CMA', 'CS', 'NA') OR professional_type IS NULL),
  membership_no TEXT,
  firm_name TEXT,

  -- Student specific fields
  registration_no TEXT,
  institute_name TEXT,

  -- Status fields
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,

  -- Tracking fields
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,

  -- Verification tokens
  verification_token TEXT,
  verification_token_expires TIMESTAMP WITH TIME ZONE,
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- 2. Create affiliate_profiles table
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  affiliate_code VARCHAR(20) UNIQUE NOT NULL,

  -- Profile information
  company_name TEXT,
  website_url TEXT,
  description TEXT,

  -- Contact information
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,

  -- Bank details (encrypted in real implementation)
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  pan_number TEXT,
  gst_number TEXT,

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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Referral details
  referral_code VARCHAR(20) NOT NULL,
  referred_email TEXT NOT NULL,
  referred_name TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'converted', 'expired', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,

  -- Commission details
  commission_amount DECIMAL(10,2),
  commission_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Tracking
  ip_address INET,
  user_agent TEXT,
  referrer_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW() + INTERVAL '30 days')
);

-- 4. Create commission_transactions table
CREATE TABLE IF NOT EXISTS public.commission_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,

  -- Transaction details
  transaction_type TEXT CHECK (transaction_type IN ('credit', 'debit', 'payout')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,

  -- Payment details
  payment_method TEXT,
  payment_reference TEXT,
  payment_date DATE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create admin_actions_log table
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id),
  target_user_id UUID REFERENCES public.users(id),

  action TEXT NOT NULL,
  details JSONB,

  -- Track role changes
  old_role TEXT,
  new_role TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_code ON public.affiliate_profiles(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_status ON public.affiliate_profiles(status);

CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_profiles_updated_at BEFORE UPDATE ON public.affiliate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Public can register" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::TEXT = id::TEXT OR auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::TEXT = id::TEXT OR auth.jwt() ->> 'email' = email);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::UUID
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::UUID
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role full access users" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for affiliate_profiles
CREATE POLICY "Affiliates view own profile" ON public.affiliate_profiles
  FOR SELECT USING (user_id = auth.uid()::UUID);

CREATE POLICY "Affiliates update own profile" ON public.affiliate_profiles
  FOR UPDATE USING (user_id = auth.uid()::UUID);

CREATE POLICY "Admins manage affiliate profiles" ON public.affiliate_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::UUID
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role full access affiliates" ON public.affiliate_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for referrals
CREATE POLICY "Affiliates view own referrals" ON public.referrals
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM public.affiliate_profiles
      WHERE user_id = auth.uid()::UUID
    )
  );

CREATE POLICY "Admins view all referrals" ON public.referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::UUID
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role full access referrals" ON public.referrals
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT ON public.users TO anon;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.affiliate_profiles TO authenticated;
GRANT SELECT ON public.referrals TO authenticated;

-- Create helper functions

-- Function to promote user to affiliate
CREATE OR REPLACE FUNCTION public.promote_to_affiliate(
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_affiliate_code VARCHAR(20);
  v_old_role TEXT;
BEGIN
  -- Get current role
  SELECT role INTO v_old_role FROM public.users WHERE id = p_user_id;

  -- Update user role
  UPDATE public.users
  SET role = 'affiliate'
  WHERE id = p_user_id;

  -- Generate unique affiliate code
  v_affiliate_code := 'AFF' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || p_user_id::TEXT), 1, 7));

  -- Create affiliate profile
  INSERT INTO public.affiliate_profiles (user_id, affiliate_code, status)
  VALUES (p_user_id, v_affiliate_code, 'approved')
  ON CONFLICT (user_id) DO UPDATE
  SET status = 'approved',
      approved_at = NOW(),
      approved_by = p_admin_id;

  -- Log the action
  INSERT INTO public.admin_actions_log (admin_id, target_user_id, action, old_role, new_role)
  VALUES (p_admin_id, p_user_id, 'promote_to_affiliate', v_old_role, 'affiliate');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create initial admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_username TEXT,
  p_password TEXT,
  p_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO public.users (email, username, password, name, phone, role, is_verified, is_active)
  VALUES (p_email, p_username, p_password, p_name, '0000000000', 'admin', true, true)
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.promote_to_affiliate TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user TO service_role;
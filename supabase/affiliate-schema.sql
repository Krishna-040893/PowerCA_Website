-- Affiliate Details Schema

-- Add affiliate-specific columns to registrations table if not exists
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS affiliate_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_details_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_status TEXT DEFAULT 'pending' CHECK (affiliate_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Create affiliate_profiles table for storing affiliate information
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  affiliate_id TEXT UNIQUE NOT NULL,

  -- Personal/Company Information
  firm_name TEXT NOT NULL,
  firm_address TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Default fields (shown in form but not editable)
  product_url TEXT DEFAULT 'https://powerca.in/demo',
  website_url TEXT DEFAULT 'https://powerca.in',

  -- Referral tracking
  referral_code TEXT UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,

  -- Commission tracking
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Default 10% commission
  total_commission DECIMAL(10,2) DEFAULT 0.00,
  paid_commission DECIMAL(10,2) DEFAULT 0.00,
  pending_commission DECIMAL(10,2) DEFAULT 0.00,

  -- Payment information
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'upi', 'paypal', 'other')),
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,

  -- Status and timestamps
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  approved_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_id ON public.affiliate_profiles(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_referral_code ON public.affiliate_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_status ON public.affiliate_profiles(status);

-- Create affiliate_referrals table to track referrals
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  referred_name TEXT,
  referral_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired', 'cancelled')),
  conversion_date TIMESTAMP WITH TIME ZONE,
  commission_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for referrals
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON public.affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_payment_status ON public.affiliate_referrals(payment_status);

-- Enable Row Level Security
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_profiles
CREATE POLICY "Affiliates can view own details" ON public.affiliate_profiles
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.registrations WHERE id = user_id
  ));

CREATE POLICY "Affiliates can update own details" ON public.affiliate_profiles
  FOR UPDATE USING (user_id IN (
    SELECT id FROM public.registrations WHERE id = user_id
  ));

CREATE POLICY "Admin can view all affiliate details" ON public.affiliate_profiles
  FOR ALL USING (true); -- Add proper admin check in production

-- RLS Policies for affiliate_referrals
CREATE POLICY "Affiliates can view own referrals" ON public.affiliate_referrals
  FOR SELECT USING (affiliate_id IN (
    SELECT id FROM public.affiliate_profiles WHERE user_id = user_id
  ));

CREATE POLICY "Admin can manage all referrals" ON public.affiliate_referrals
  FOR ALL USING (true); -- Add proper admin check in production

-- Function to generate unique affiliate ID
CREATE OR REPLACE FUNCTION generate_affiliate_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate ID in format: AFF-XXXX (where X is alphanumeric)
    new_id := 'AFF-' || upper(substr(md5(random()::text), 1, 6));

    -- Check if ID already exists
    SELECT COUNT(*) INTO exists_count
    FROM affiliate_profiles
    WHERE affiliate_id = new_id;

    EXIT WHEN exists_count = 0;
  END LOOP;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate affiliate ID
CREATE OR REPLACE FUNCTION set_affiliate_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.affiliate_id IS NULL THEN
    NEW.affiliate_id := generate_affiliate_id();
  END IF;
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substr(md5(random()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER affiliate_id_trigger
BEFORE INSERT ON public.affiliate_profiles
FOR EACH ROW
EXECUTE FUNCTION set_affiliate_id();

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_affiliate_profiles_updated_at
BEFORE UPDATE ON public.affiliate_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_referrals_updated_at
BEFORE UPDATE ON public.affiliate_referrals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
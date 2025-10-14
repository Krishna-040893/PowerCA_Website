-- =====================================================
-- Create affiliate_profiles and affiliate_referrals tables
-- These tables track affiliate info and their customers
-- =====================================================

-- Create affiliate_profiles table for storing affiliate information
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.registration_forms(id) ON DELETE CASCADE,

  -- Affiliate Identification
  affiliate_id TEXT UNIQUE,
  referral_code TEXT UNIQUE,

  -- Personal/Company Information
  firm_name TEXT,
  firm_address TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Default fields (shown in form but not editable)
  product_url TEXT DEFAULT 'https://powerca.in/demo',
  website_url TEXT DEFAULT 'https://powerca.in',

  -- Referral tracking counters
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_id ON public.affiliate_profiles(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_referral_code ON public.affiliate_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_status ON public.affiliate_profiles(status);

-- Create affiliate_referrals table to track individual customers
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links to the affiliate
  affiliate_profile_id UUID REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  affiliate_id TEXT, -- Denormalized for easy queries

  -- Customer Information
  customer_id TEXT UNIQUE, -- Unique customer ID (CUS000001, CUS000002, etc.)
  referred_user_id UUID REFERENCES public.registration_forms(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  referred_name TEXT,

  -- Referral Tracking
  referral_code TEXT, -- Affiliate's permanent referral code
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired', 'cancelled')),

  -- Commission Tracking
  conversion_date TIMESTAMP WITH TIME ZONE,
  commission_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for referrals
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_profile_id ON public.affiliate_referrals(affiliate_profile_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_customer_id ON public.affiliate_referrals(customer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_email ON public.affiliate_referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON public.affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_payment_status ON public.affiliate_referrals(payment_status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referral_code ON public.affiliate_referrals(referral_code);

-- Enable Row Level Security
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_profiles
-- Service role can do everything
CREATE POLICY "Service role can manage affiliate profiles"
  ON public.affiliate_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view own affiliate profile"
  ON public.affiliate_profiles
  FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Users can insert their own profile
CREATE POLICY "Users can insert own affiliate profile"
  ON public.affiliate_profiles
  FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update their own profile
CREATE POLICY "Users can update own affiliate profile"
  ON public.affiliate_profiles
  FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- RLS Policies for affiliate_referrals
-- Service role can do everything
CREATE POLICY "Service role can manage affiliate referrals"
  ON public.affiliate_referrals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Affiliates can view their own referrals
CREATE POLICY "Affiliates can view own referrals"
  ON public.affiliate_referrals
  FOR SELECT
  USING (
    affiliate_profile_id IN (
      SELECT id FROM public.affiliate_profiles WHERE user_id::text = auth.uid()::text
    )
  );

-- Affiliates can insert their own referrals
CREATE POLICY "Affiliates can insert own referrals"
  ON public.affiliate_referrals
  FOR INSERT
  WITH CHECK (
    affiliate_profile_id IN (
      SELECT id FROM public.affiliate_profiles WHERE user_id::text = auth.uid()::text
    )
  );

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_affiliate_profiles_updated_at ON public.affiliate_profiles;
CREATE TRIGGER update_affiliate_profiles_updated_at
  BEFORE UPDATE ON public.affiliate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_referrals_updated_at ON public.affiliate_referrals;
CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Customer ID Auto-generation System
-- ============================================

-- Function to generate unique customer ID (CUS001, CUS002, etc.)
CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  new_customer_id TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Get the maximum customer ID number
    SELECT COALESCE(
      MAX(
        CAST(
          SUBSTRING(customer_id FROM 4) AS INTEGER
        )
      ),
      0
    ) + 1 INTO next_id
    FROM affiliate_referrals
    WHERE customer_id ~ '^CUS[0-9]+$';

    -- Format the new customer ID with leading zeros (CUS001, CUS002, etc.)
    new_customer_id := 'CUS' || LPAD(next_id::TEXT, 3, '0');

    -- Check if this ID already exists
    SELECT EXISTS(
      SELECT 1 FROM affiliate_referrals WHERE customer_id = new_customer_id
    ) INTO exists;

    -- Exit loop if ID is unique
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate customer ID when referral is created
CREATE OR REPLACE FUNCTION set_customer_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NULL THEN
    NEW.customer_id = generate_customer_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate customer ID on insert
DROP TRIGGER IF EXISTS set_customer_id ON public.affiliate_referrals;
CREATE TRIGGER set_customer_id
  BEFORE INSERT ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_id_on_insert();

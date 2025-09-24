-- First, check if registrations table exists and add the missing columns
-- Run each ALTER TABLE statement one by one if needed

-- Add affiliate_id column
ALTER TABLE public.registrations
ADD COLUMN affiliate_id TEXT UNIQUE;

-- Add is_affiliate column
ALTER TABLE public.registrations
ADD COLUMN is_affiliate BOOLEAN DEFAULT false;

-- Add affiliate_details_completed column
ALTER TABLE public.registrations
ADD COLUMN affiliate_details_completed BOOLEAN DEFAULT false;

-- Add affiliate_status column
ALTER TABLE public.registrations
ADD COLUMN affiliate_status TEXT DEFAULT 'pending';

-- After adding columns, create the affiliate_profiles table
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  affiliate_id TEXT UNIQUE NOT NULL,
  firm_name TEXT NOT NULL,
  firm_address TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  product_url TEXT DEFAULT 'https://powerca.in/demo',
  website_url TEXT DEFAULT 'https://powerca.in',
  referral_code TEXT UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_commission DECIMAL(10,2) DEFAULT 0.00,
  paid_commission DECIMAL(10,2) DEFAULT 0.00,
  pending_commission DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active',
  approved_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint after table is created
ALTER TABLE public.affiliate_profiles
ADD CONSTRAINT fk_affiliate_profiles_user_id
FOREIGN KEY (user_id) REFERENCES public.registrations(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_id ON public.affiliate_profiles(affiliate_id);

-- Enable RLS
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for testing
CREATE POLICY "Enable all access for authenticated users" ON public.affiliate_profiles
FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.affiliate_profiles TO authenticated;
GRANT ALL ON public.affiliate_profiles TO service_role;
GRANT ALL ON public.affiliate_profiles TO anon;
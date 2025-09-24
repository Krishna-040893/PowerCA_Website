-- Simple SQL to create affiliate tables
-- Run this in Supabase SQL Editor

-- First, add columns to registrations table if they don't exist
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS affiliate_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_details_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_status TEXT DEFAULT 'pending';

-- Create affiliate_profiles table
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_id ON public.affiliate_profiles(affiliate_id);

-- Enable RLS but allow all operations for now (for testing)
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for testing)
CREATE POLICY "Allow all operations on affiliate_profiles" ON public.affiliate_profiles
FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.affiliate_profiles TO authenticated;
GRANT ALL ON public.affiliate_profiles TO service_role;
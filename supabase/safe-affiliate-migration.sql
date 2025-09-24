-- Safe migration - only adds columns if they don't exist
-- Run this entire script in Supabase SQL Editor

-- Add affiliate_id column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='registrations' AND column_name='affiliate_id') THEN
        ALTER TABLE public.registrations ADD COLUMN affiliate_id TEXT UNIQUE;
    END IF;
END $$;

-- Add affiliate_details_completed column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='registrations' AND column_name='affiliate_details_completed') THEN
        ALTER TABLE public.registrations ADD COLUMN affiliate_details_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add affiliate_status column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='registrations' AND column_name='affiliate_status') THEN
        ALTER TABLE public.registrations ADD COLUMN affiliate_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Create affiliate_profiles table only if it doesn't exist
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

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_id ON public.affiliate_profiles(affiliate_id);

-- Enable RLS
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.affiliate_profiles;
CREATE POLICY "Enable all access for authenticated users" ON public.affiliate_profiles
FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.affiliate_profiles TO authenticated;
GRANT ALL ON public.affiliate_profiles TO service_role;
GRANT ALL ON public.affiliate_profiles TO anon;
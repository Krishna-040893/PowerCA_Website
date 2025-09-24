-- Fix Affiliate Tables and Add Missing Columns
-- Run this SQL in Supabase SQL Editor

-- First, check and add missing columns to registrations table
DO $$
BEGIN
    -- Add affiliate_details_completed if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public'
                   AND table_name = 'registrations'
                   AND column_name = 'affiliate_details_completed') THEN
        ALTER TABLE public.registrations
        ADD COLUMN affiliate_details_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create affiliate_profiles table if not exists
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    affiliate_id TEXT UNIQUE NOT NULL,
    referral_code TEXT UNIQUE,
    firm_name TEXT NOT NULL,
    firm_address TEXT NOT NULL,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    product_url TEXT DEFAULT 'https://powerca.in/demo',
    website_url TEXT DEFAULT 'https://powerca.in',

    -- Commission fields
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_commission DECIMAL(12,2) DEFAULT 0.00,
    pending_commission DECIMAL(12,2) DEFAULT 0.00,
    paid_commission DECIMAL(12,2) DEFAULT 0.00,

    -- Status fields
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    approved_at TIMESTAMPTZ,

    -- Statistics
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    pending_referrals INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),

    -- Add foreign key constraint
    CONSTRAINT fk_user_id FOREIGN KEY (user_id)
    REFERENCES public.registrations(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_affiliate_id ON public.affiliate_profiles(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_referral_code ON public.affiliate_profiles(referral_code);

-- Create affiliate_referrals table if not exists
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    referred_name TEXT,
    referral_code TEXT,
    referral_source TEXT DEFAULT 'manual',

    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired', 'cancelled')),
    converted_at TIMESTAMPTZ,

    -- Order tracking
    order_id UUID,
    order_amount DECIMAL(12,2),
    commission_amount DECIMAL(12,2),
    commission_paid BOOLEAN DEFAULT FALSE,
    commission_paid_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for referrals
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON public.affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_email ON public.affiliate_referrals(referred_email);

-- Enable Row Level Security
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for affiliate_profiles
CREATE POLICY "Users can view their own affiliate profile" ON public.affiliate_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own affiliate profile" ON public.affiliate_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own affiliate profile" ON public.affiliate_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for affiliate_referrals
CREATE POLICY "Affiliates can view their own referrals" ON public.affiliate_referrals
    FOR SELECT USING (
        affiliate_id IN (
            SELECT id FROM public.affiliate_profiles
            WHERE user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Affiliates can create their own referrals" ON public.affiliate_referrals
    FOR INSERT WITH CHECK (
        affiliate_id IN (
            SELECT id FROM public.affiliate_profiles
            WHERE user_id::text = auth.uid()::text
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.affiliate_profiles TO authenticated;
GRANT ALL ON public.affiliate_referrals TO authenticated;
GRANT ALL ON public.affiliate_profiles TO service_role;
GRANT ALL ON public.affiliate_referrals TO service_role;

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
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

-- Verify tables exist and show their structure
SELECT 'Affiliate Profiles Table Columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'affiliate_profiles'
ORDER BY ordinal_position;

SELECT 'Registrations Table Affiliate Columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'registrations'
AND column_name IN ('affiliate_id', 'affiliate_status', 'affiliate_details_completed', 'is_affiliate', 'role')
ORDER BY ordinal_position;
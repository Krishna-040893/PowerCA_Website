-- CLEANUP AND SETUP AFFILIATE SYSTEM
-- This script removes unnecessary tables and creates only what's needed

-- ============================================
-- STEP 1: DROP UNNECESSARY TABLES
-- ============================================

-- Drop old/duplicate affiliate tables if they exist
DROP TABLE IF EXISTS public.affiliate_details CASCADE;
DROP TABLE IF EXISTS public.affiliates CASCADE;
DROP TABLE IF EXISTS public.affiliate_commissions CASCADE;
DROP TABLE IF EXISTS public.affiliate_payouts CASCADE;
DROP TABLE IF EXISTS public.affiliate_stats CASCADE;

-- Drop the referrals table (we'll recreate a simpler version if needed)
DROP TABLE IF EXISTS public.affiliate_referrals CASCADE;

-- Drop existing affiliate_profiles to start fresh
DROP TABLE IF EXISTS public.affiliate_profiles CASCADE;

-- ============================================
-- STEP 2: ADD REQUIRED COLUMNS TO REGISTRATIONS
-- ============================================

-- Add affiliate-related columns to registrations table if they don't exist
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS affiliate_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS affiliate_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS affiliate_details_completed BOOLEAN DEFAULT FALSE;

-- ============================================
-- STEP 3: CREATE SINGLE AFFILIATE PROFILES TABLE
-- ============================================

CREATE TABLE public.affiliate_profiles (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    affiliate_id TEXT UNIQUE NOT NULL,

    -- Firm Information (Required by user)
    firm_name TEXT NOT NULL,
    firm_address TEXT NOT NULL,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,

    -- Default URLs
    product_url TEXT DEFAULT 'https://powerca.in/demo',
    website_url TEXT DEFAULT 'https://powerca.in',

    -- Simple tracking
    referral_code TEXT UNIQUE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_earnings DECIMAL(12,2) DEFAULT 0.00,

    -- Status
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX idx_affiliate_profiles_affiliate_id ON public.affiliate_profiles(affiliate_id);

-- ============================================
-- STEP 4: CREATE SIMPLE REFERRALS TABLE (OPTIONAL)
-- ============================================

CREATE TABLE public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_profile_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    referred_name TEXT,
    status TEXT DEFAULT 'pending', -- pending, converted, expired
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_affiliate_id ON public.affiliate_referrals(affiliate_profile_id);

-- ============================================
-- STEP 5: SIMPLE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_affiliate_profiles_updated_at
    BEFORE UPDATE ON public.affiliate_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================

-- Grant full permissions to authenticated and service_role
GRANT ALL ON public.affiliate_profiles TO authenticated;
GRANT ALL ON public.affiliate_profiles TO service_role;
GRANT ALL ON public.affiliate_referrals TO authenticated;
GRANT ALL ON public.affiliate_referrals TO service_role;

-- ============================================
-- STEP 7: VERIFY SETUP
-- ============================================

-- Check if tables are created properly
SELECT
    'Tables Created Successfully' as status,
    COUNT(*) as affiliate_profiles_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'affiliate_profiles';

-- Show the structure of the main table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'affiliate_profiles'
ORDER BY ordinal_position;

-- Show affiliate columns in registrations table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'registrations'
AND column_name IN ('affiliate_id', 'is_affiliate', 'affiliate_status', 'affiliate_details_completed')
ORDER BY ordinal_position;
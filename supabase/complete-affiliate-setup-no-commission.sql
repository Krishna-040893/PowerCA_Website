-- ====================================================
-- COMPLETE AFFILIATE SYSTEM SETUP FOR POWERCA
-- WITHOUT COMMISSION TRACKING
-- ====================================================
-- Run this entire script in Supabase SQL Editor
-- This will set up everything needed for the affiliate system

-- ====================================================
-- PART 1: CLEAN UP OLD TABLES (IF ANY)
-- ====================================================

-- Drop old tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.affiliate_referrals CASCADE;
DROP TABLE IF EXISTS public.payment_referrals CASCADE;
DROP TABLE IF EXISTS public.affiliate_profiles CASCADE;
DROP TABLE IF EXISTS public.affiliate_details CASCADE;
DROP TABLE IF EXISTS public.affiliates CASCADE;

-- ====================================================
-- PART 2: UPDATE REGISTRATIONS TABLE
-- ====================================================

-- Add affiliate columns to registrations table
DO $$
BEGIN
    -- Add affiliate_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'registrations'
                   AND column_name = 'affiliate_id') THEN
        ALTER TABLE public.registrations ADD COLUMN affiliate_id TEXT UNIQUE;
    END IF;

    -- Add is_affiliate column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'registrations'
                   AND column_name = 'is_affiliate') THEN
        ALTER TABLE public.registrations ADD COLUMN is_affiliate BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add affiliate_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'registrations'
                   AND column_name = 'affiliate_status') THEN
        ALTER TABLE public.registrations ADD COLUMN affiliate_status TEXT DEFAULT 'inactive';
    END IF;

    -- Add affiliate_details_completed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'registrations'
                   AND column_name = 'affiliate_details_completed') THEN
        ALTER TABLE public.registrations ADD COLUMN affiliate_details_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ====================================================
-- PART 3: CREATE AFFILIATE PROFILES TABLE
-- ====================================================

CREATE TABLE public.affiliate_profiles (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    affiliate_id TEXT UNIQUE NOT NULL,

    -- Referral Code (will be auto-generated)
    referral_code TEXT UNIQUE,

    -- Company Information (Required)
    firm_name TEXT NOT NULL,
    firm_address TEXT NOT NULL,

    -- Contact Information (Optional)
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,

    -- URLs (With Defaults)
    product_url TEXT DEFAULT 'https://powerca.in/demo',
    website_url TEXT DEFAULT 'https://powerca.in',

    -- Referral Statistics (No commission tracking)
    total_referrals INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign Key
    CONSTRAINT fk_affiliate_user FOREIGN KEY (user_id)
        REFERENCES public.registrations(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX idx_affiliate_profiles_affiliate_id ON public.affiliate_profiles(affiliate_id);
CREATE INDEX idx_affiliate_profiles_referral_code ON public.affiliate_profiles(referral_code);

-- ====================================================
-- PART 4: CREATE AFFILIATE REFERRALS TABLE
-- ====================================================

CREATE TABLE public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_profile_id UUID NOT NULL,

    -- Referral Information
    referred_email TEXT NOT NULL,
    referred_name TEXT,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired', 'cancelled')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ,

    -- Foreign Key
    CONSTRAINT fk_referral_affiliate FOREIGN KEY (affiliate_profile_id)
        REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE
);

-- Create index
CREATE INDEX idx_referrals_affiliate_profile_id ON public.affiliate_referrals(affiliate_profile_id);
CREATE INDEX idx_referrals_status ON public.affiliate_referrals(status);

-- ====================================================
-- PART 5: CREATE PAYMENT REFERRALS TABLE (NO COMMISSION)
-- ====================================================

CREATE TABLE public.payment_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id TEXT NOT NULL,
    affiliate_profile_id UUID REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
    customer_email TEXT,
    customer_name TEXT,
    plan_id TEXT,
    payment_amount DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_payment_referrals_payment_id ON public.payment_referrals(payment_id);
CREATE INDEX idx_payment_referrals_affiliate ON public.payment_referrals(affiliate_profile_id);

-- ====================================================
-- PART 6: CREATE UPDATE TRIGGER
-- ====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for affiliate_profiles
DROP TRIGGER IF EXISTS update_affiliate_profiles_updated_at ON public.affiliate_profiles;
CREATE TRIGGER update_affiliate_profiles_updated_at
    BEFORE UPDATE ON public.affiliate_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- PART 7: DISABLE ROW LEVEL SECURITY (FOR SIMPLICITY)
-- ====================================================

-- Disable RLS to avoid permission issues
ALTER TABLE public.affiliate_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_referrals DISABLE ROW LEVEL SECURITY;

-- ====================================================
-- PART 8: SET PERMISSIONS
-- ====================================================

-- Grant full permissions to all roles
GRANT ALL ON public.affiliate_profiles TO anon;
GRANT ALL ON public.affiliate_profiles TO authenticated;
GRANT ALL ON public.affiliate_profiles TO service_role;

GRANT ALL ON public.affiliate_referrals TO anon;
GRANT ALL ON public.affiliate_referrals TO authenticated;
GRANT ALL ON public.affiliate_referrals TO service_role;

GRANT ALL ON public.payment_referrals TO anon;
GRANT ALL ON public.payment_referrals TO authenticated;
GRANT ALL ON public.payment_referrals TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ====================================================
-- PART 9: CREATE PAYMENT ORDERS TABLE
-- ====================================================

CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created',
    customer_email TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    company TEXT,
    gst_number TEXT,
    product_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON public.payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);

-- Grant permissions
GRANT ALL ON public.payment_orders TO anon;
GRANT ALL ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;

-- ====================================================
-- PART 10: VERIFICATION QUERIES
-- ====================================================

-- Check if tables were created successfully
SELECT
    'Tables Created' as status,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('affiliate_profiles', 'affiliate_referrals', 'payment_referrals', 'payment_orders');

-- Show structure of affiliate_profiles table
SELECT
    '--- AFFILIATE_PROFILES TABLE STRUCTURE ---' as info;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'affiliate_profiles'
ORDER BY ordinal_position;

-- Show affiliate columns in registrations
SELECT
    '--- REGISTRATIONS TABLE AFFILIATE COLUMNS ---' as info;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'registrations'
AND column_name LIKE '%affiliate%'
ORDER BY ordinal_position;

-- Check for any existing affiliate users
SELECT
    '--- EXISTING AFFILIATE USERS ---' as info;

SELECT
    id,
    email,
    name,
    role,
    affiliate_id,
    is_affiliate,
    affiliate_status,
    affiliate_details_completed
FROM public.registrations
WHERE role = 'Affiliate'
LIMIT 10;

-- ====================================================
-- SUCCESS MESSAGE
-- ====================================================
SELECT
    '✅ AFFILIATE SYSTEM SETUP COMPLETED SUCCESSFULLY!' as message,
    'NO COMMISSION TRACKING' as type,
    'Next Steps:' as action,
    '1. Admin can promote users to Affiliate role' as step1,
    '2. Affiliate users can fill their profile details' as step2,
    '3. System will track referrals without commission' as step3;
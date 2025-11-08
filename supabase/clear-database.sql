-- Clear all data from PowerCA database (EXCEPT admin_users)
-- WARNING: This will permanently delete all data from these tables
-- Run this script in your Supabase SQL Editor

-- Disable triggers temporarily to avoid conflicts
SET session_replication_role = 'replica';

-- Clear affiliate and referral tables (in order of dependencies)
TRUNCATE TABLE affiliate_referral_payments CASCADE;
TRUNCATE TABLE affiliate_referrals CASCADE;
TRUNCATE TABLE affiliate_customers CASCADE;
TRUNCATE TABLE affiliate_profiles CASCADE;
TRUNCATE TABLE affiliate_registrations CASCADE;
TRUNCATE TABLE affiliate_applications CASCADE;

-- Clear payment and subscription tables
TRUNCATE TABLE payment_orders CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE subscriptions CASCADE;

-- Clear registration tables
TRUNCATE TABLE professional_registrations CASCADE;
TRUNCATE TABLE student_registrations CASCADE;
TRUNCATE TABLE registration_forms CASCADE;
TRUNCATE TABLE registrations CASCADE;

-- Clear bookings table
TRUNCATE TABLE bookings CASCADE;

-- Clear profiles table (this will cascade to related tables)
-- Note: This will delete user profiles but NOT auth.users
TRUNCATE TABLE profiles CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify what remains
SELECT 'admin_users' as table_name, COUNT(*) as row_count FROM admin_users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'affiliate_profiles', COUNT(*) FROM affiliate_profiles
ORDER BY table_name;

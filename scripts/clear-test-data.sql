-- =====================================================
-- PowerCA - Clear All Test Data Script
-- =====================================================
-- This script deletes all data from tables while keeping
-- the table structures, constraints, and indexes intact.
-- =====================================================

-- Disable triggers temporarily to avoid conflicts
SET session_replication_role = 'replica';

-- Clear all tables in reverse dependency order
-- (child tables first, then parent tables)

-- Clear referral and affiliate related data
TRUNCATE TABLE affiliate_referrals CASCADE;
TRUNCATE TABLE affiliate_customers CASCADE;
TRUNCATE TABLE affiliate_payments CASCADE;
TRUNCATE TABLE affiliate_profiles CASCADE;
TRUNCATE TABLE affiliate_registrations CASCADE;

-- Clear payment and subscription data
TRUNCATE TABLE payment_orders CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE subscriptions CASCADE;

-- Clear user registration data
TRUNCATE TABLE professional_registrations CASCADE;
TRUNCATE TABLE student_registrations CASCADE;
TRUNCATE TABLE registration_forms CASCADE;
TRUNCATE TABLE registrations CASCADE;

-- Clear communication data
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE newsletter_subscribers CASCADE;
TRUNCATE TABLE renewal_notifications CASCADE;

-- Clear content data
TRUNCATE TABLE blog_posts CASCADE;

-- Clear monitoring data
TRUNCATE TABLE monitoring_events CASCADE;

-- Clear admin data
TRUNCATE TABLE admin_users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Display confirmation
SELECT 'All test data has been cleared successfully!' AS status;

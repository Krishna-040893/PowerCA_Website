-- Remove FK constraint on payments.user_id since we use NextAuth with custom auth tables
-- not Supabase Auth. Users are stored in registration_forms, affiliate_registrations, and admin_users tables.

-- Drop the foreign key constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- user_id column remains as UUID (nullable) to track which user made the payment
-- but without FK constraint to auth.users which doesn't exist in our system

-- Add comment explaining the column
COMMENT ON COLUMN payments.user_id IS 'References user ID from registration_forms, affiliate_registrations, or admin_users tables (no FK constraint due to NextAuth custom auth)';

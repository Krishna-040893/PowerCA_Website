-- ====================================================================
-- URGENT FIX: Remove strict foreign key constraint
-- ====================================================================
-- This allows guest users to checkout without being in auth.users table
-- Run this SQL in Supabase NOW to fix the current error
-- ====================================================================

-- Drop the foreign key constraint
ALTER TABLE public.payment_orders
DROP CONSTRAINT IF EXISTS payment_orders_user_id_fkey;

-- Make user_id nullable (it should already be, but just to be sure)
ALTER TABLE public.payment_orders
ALTER COLUMN user_id DROP NOT NULL;

-- ====================================================================
-- Done! Orders will now save even for guest users
-- ====================================================================

-- ====================================================================
-- CRITICAL: Apply this migration to your Supabase database NOW
-- ====================================================================
-- This fixes the missing columns error in payment_orders table
-- Without this, orders cannot be saved to the database
-- ====================================================================

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE public.payment_orders
DROP CONSTRAINT IF EXISTS payment_orders_user_id_fkey;

-- Add user_id column without strict foreign key constraint
-- This allows guest checkouts where user_id might not exist in auth.users
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add address columns
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT,
ADD COLUMN IF NOT EXISTS customer_state TEXT,
ADD COLUMN IF NOT EXISTS customer_postcode TEXT,
ADD COLUMN IF NOT EXISTS customer_country TEXT;

-- Add firm_name and affiliate tracking columns
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS firm_name TEXT,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS customer_id TEXT,
ADD COLUMN IF NOT EXISTS is_affiliate_purchase BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id
ON public.payment_orders(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_city
ON public.payment_orders(customer_city);

CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_state
ON public.payment_orders(customer_state);

CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_country
ON public.payment_orders(customer_country);

CREATE INDEX IF NOT EXISTS idx_payment_orders_referral_code
ON public.payment_orders(referral_code);

CREATE INDEX IF NOT EXISTS idx_payment_orders_is_affiliate
ON public.payment_orders(is_affiliate_purchase);

-- Add comments for documentation
COMMENT ON COLUMN public.payment_orders.user_id IS 'User ID from auth.users table';
COMMENT ON COLUMN public.payment_orders.customer_address IS 'Full street address of the customer';
COMMENT ON COLUMN public.payment_orders.customer_city IS 'City of the customer';
COMMENT ON COLUMN public.payment_orders.customer_state IS 'State/Province of the customer';
COMMENT ON COLUMN public.payment_orders.customer_postcode IS 'Postal/ZIP code of the customer';
COMMENT ON COLUMN public.payment_orders.customer_country IS 'Country of the customer';
COMMENT ON COLUMN public.payment_orders.firm_name IS 'Firm or company name of the customer';
COMMENT ON COLUMN public.payment_orders.referral_code IS 'Affiliate referral code used';
COMMENT ON COLUMN public.payment_orders.customer_id IS 'Cashfree customer ID';
COMMENT ON COLUMN public.payment_orders.is_affiliate_purchase IS 'Whether this was an affiliate purchase';

-- ====================================================================
-- Migration complete!
-- After running this, restart your Next.js dev server with: npm run dev
-- ====================================================================

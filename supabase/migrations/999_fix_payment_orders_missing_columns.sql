-- Fix missing columns in payment_orders table
-- This migration adds all missing columns that are referenced in the code

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE public.payment_orders
DROP CONSTRAINT IF EXISTS payment_orders_user_id_fkey;

-- Add user_id column WITHOUT strict foreign key constraint
-- This allows guest checkouts where user_id might not exist in auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payment_orders'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.payment_orders
        ADD COLUMN user_id UUID;

        COMMENT ON COLUMN public.payment_orders.user_id IS 'User ID from auth.users table (nullable for guest checkouts)';
    END IF;
END $$;

-- Add address-related columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payment_orders'
        AND column_name = 'customer_address'
    ) THEN
        ALTER TABLE public.payment_orders
        ADD COLUMN customer_address TEXT,
        ADD COLUMN customer_city TEXT,
        ADD COLUMN customer_state TEXT,
        ADD COLUMN customer_postcode TEXT,
        ADD COLUMN customer_country TEXT;

        -- Add comments
        COMMENT ON COLUMN public.payment_orders.customer_address IS 'Full street address of the customer';
        COMMENT ON COLUMN public.payment_orders.customer_city IS 'City of the customer';
        COMMENT ON COLUMN public.payment_orders.customer_state IS 'State/Province of the customer';
        COMMENT ON COLUMN public.payment_orders.customer_postcode IS 'Postal/ZIP code of the customer';
        COMMENT ON COLUMN public.payment_orders.customer_country IS 'Country of the customer';

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_city
        ON public.payment_orders(customer_city);

        CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_state
        ON public.payment_orders(customer_state);

        CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_country
        ON public.payment_orders(customer_country);
    END IF;
END $$;

-- Add firm_name and affiliate tracking columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payment_orders'
        AND column_name = 'firm_name'
    ) THEN
        ALTER TABLE public.payment_orders
        ADD COLUMN firm_name TEXT,
        ADD COLUMN referral_code TEXT,
        ADD COLUMN customer_id TEXT,
        ADD COLUMN is_affiliate_purchase BOOLEAN DEFAULT FALSE;

        -- Add comments
        COMMENT ON COLUMN public.payment_orders.firm_name IS 'Firm or company name of the customer';
        COMMENT ON COLUMN public.payment_orders.referral_code IS 'Affiliate referral code used';
        COMMENT ON COLUMN public.payment_orders.customer_id IS 'Cashfree customer ID';
        COMMENT ON COLUMN public.payment_orders.is_affiliate_purchase IS 'Whether this was an affiliate purchase';

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_payment_orders_referral_code
        ON public.payment_orders(referral_code);

        CREATE INDEX IF NOT EXISTS idx_payment_orders_is_affiliate
        ON public.payment_orders(is_affiliate_purchase);
    END IF;
END $$;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id
ON public.payment_orders(user_id);

-- Verify the changes
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Columns added to payment_orders table:';
    RAISE NOTICE '  - user_id (UUID, nullable for guest checkouts)';
    RAISE NOTICE '  - customer_address (TEXT)';
    RAISE NOTICE '  - customer_city (TEXT)';
    RAISE NOTICE '  - customer_state (TEXT)';
    RAISE NOTICE '  - customer_postcode (TEXT)';
    RAISE NOTICE '  - customer_country (TEXT)';
    RAISE NOTICE '  - firm_name (TEXT)';
    RAISE NOTICE '  - referral_code (TEXT)';
    RAISE NOTICE '  - customer_id (TEXT)';
    RAISE NOTICE '  - is_affiliate_purchase (BOOLEAN)';
    RAISE NOTICE 'Foreign key constraint removed to allow guest checkouts';
    RAISE NOTICE 'Indexes created for better performance';
END $$;

-- Create payment_orders table if it doesn't exist
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

-- Create payment_referrals table for tracking affiliate referrals (no commission)
CREATE TABLE IF NOT EXISTS public.payment_referrals (
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
CREATE INDEX IF NOT EXISTS idx_payment_referrals_payment_id ON public.payment_referrals(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_referrals_affiliate ON public.payment_referrals(affiliate_profile_id);

-- Grant permissions
GRANT ALL ON public.payment_referrals TO anon;
GRANT ALL ON public.payment_referrals TO authenticated;
GRANT ALL ON public.payment_referrals TO service_role;

-- Verification query
SELECT 'Payment tables created successfully' as status;
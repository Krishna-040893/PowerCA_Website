-- Migration: Create coupon_codes table for discount management
-- This replaces the hardcoded 10% discount for second address and one-time payment

-- Create the coupon_codes table
CREATE TABLE IF NOT EXISTS public.coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_percentage DECIMAL(5, 2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER DEFAULT NULL, -- NULL means unlimited
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL means no expiry
    created_by UUID REFERENCES public.admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON public.coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_is_active ON public.coupon_codes(is_active);

-- Add coupon tracking fields to payment_orders
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS coupon_discount_percentage DECIMAL(5, 2) DEFAULT 0;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_coupon_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_coupon_codes_updated_at ON public.coupon_codes;
CREATE TRIGGER trigger_update_coupon_codes_updated_at
    BEFORE UPDATE ON public.coupon_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_coupon_codes_updated_at();

-- Insert sample coupon codes as mentioned by user
INSERT INTO public.coupon_codes (code, description, discount_percentage, is_active)
VALUES
    ('Admin1', 'Admin discount coupon - 10% off', 10.00, true),
    ('sample10', 'Sample promotional coupon - 20% off', 20.00, true)
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read active coupons
CREATE POLICY "Allow read active coupons" ON public.coupon_codes
    FOR SELECT
    USING (is_active = true);

-- Policy: Allow admin full access (service role)
CREATE POLICY "Allow admin full access" ON public.coupon_codes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.coupon_codes IS 'Stores coupon codes for checkout discounts. Replaces hardcoded 10% discount logic.';
COMMENT ON COLUMN public.coupon_codes.code IS 'Unique coupon code entered by users at checkout';
COMMENT ON COLUMN public.coupon_codes.discount_percentage IS 'Discount percentage (1-100)';
COMMENT ON COLUMN public.coupon_codes.usage_limit IS 'Maximum number of times this coupon can be used. NULL = unlimited';
COMMENT ON COLUMN public.coupon_codes.usage_count IS 'Current number of times this coupon has been used';

-- Add discount fields to payment_orders table for tracking progressive discounts
-- First address = 0%, Second = 1%, Third = 2%, etc.

ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2);

-- Create index for discount tracking
CREATE INDEX IF NOT EXISTS idx_payment_orders_discount_percentage
ON public.payment_orders(discount_percentage);

-- Add comments for documentation
COMMENT ON COLUMN public.payment_orders.discount_percentage IS 'Discount percentage applied (0 for 1st address, 1 for 2nd, 2 for 3rd, etc.)';
COMMENT ON COLUMN public.payment_orders.discount_amount IS 'Discount amount in INR';
COMMENT ON COLUMN public.payment_orders.original_amount IS 'Original amount before discount';

-- Add missing columns to payment_orders table
-- These columns are used by the create-order API but were never added via migration

-- GST amount column
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS gst DECIMAL(10, 2) DEFAULT 0;

-- Plan type for subscription tracking
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'annual';

-- User count for per-user pricing
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS user_count INTEGER DEFAULT 1;

-- Installment number (from migration 056 which may not have been applied)
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS installment_number INTEGER DEFAULT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_plan_type ON public.payment_orders(plan_type);

-- Add comments
COMMENT ON COLUMN public.payment_orders.gst IS 'GST amount in INR (18%)';
COMMENT ON COLUMN public.payment_orders.plan_type IS 'Plan type: annual, onetime, monthly, installment';
COMMENT ON COLUMN public.payment_orders.user_count IS 'Number of users for per-user pricing plans';
COMMENT ON COLUMN public.payment_orders.installment_number IS 'Installment number for installment plan payments';

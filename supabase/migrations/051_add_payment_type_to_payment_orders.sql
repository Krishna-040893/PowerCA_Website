-- Add payment_type column to payment_orders table for two-stage payment tracking
-- payment_type can be 'initial_payment' or 'final_settlement'
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'initial_payment';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_payment_type ON public.payment_orders(payment_type);

-- Comment for documentation
COMMENT ON COLUMN public.payment_orders.payment_type IS 'Type of payment: initial_payment or final_settlement for two-stage payment tracking';

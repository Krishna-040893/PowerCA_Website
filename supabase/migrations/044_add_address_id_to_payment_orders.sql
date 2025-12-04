-- Add address_id column to payment_orders table for tracking which address a purchase is for
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.user_addresses(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_address_id ON public.payment_orders(address_id);

-- Comment for documentation
COMMENT ON COLUMN public.payment_orders.address_id IS 'Reference to the user_addresses table to track which billing address this purchase is for';

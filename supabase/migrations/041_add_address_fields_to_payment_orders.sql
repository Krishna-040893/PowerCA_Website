-- Add address fields to payment_orders table
-- This allows us to store complete billing address for auto-fill functionality

ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT,
ADD COLUMN IF NOT EXISTS customer_state TEXT,
ADD COLUMN IF NOT EXISTS customer_postcode TEXT,
ADD COLUMN IF NOT EXISTS customer_country TEXT,
ADD COLUMN IF NOT EXISTS customer_gst_no TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_city
ON public.payment_orders(customer_city);

CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_state
ON public.payment_orders(customer_state);

CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_country
ON public.payment_orders(customer_country);

-- Add comments
COMMENT ON COLUMN public.payment_orders.customer_address IS 'Street address of the customer';
COMMENT ON COLUMN public.payment_orders.customer_city IS 'City of the customer';
COMMENT ON COLUMN public.payment_orders.customer_state IS 'State/Province of the customer';
COMMENT ON COLUMN public.payment_orders.customer_postcode IS 'Postal/ZIP code of the customer';
COMMENT ON COLUMN public.payment_orders.customer_country IS 'Country of the customer';
COMMENT ON COLUMN public.payment_orders.customer_gst_no IS 'GST number of the customer';

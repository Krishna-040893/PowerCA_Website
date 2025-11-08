-- Create payment_orders table for tracking Razorpay orders
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  company TEXT,
  gst_number TEXT,
  product_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_email ON payment_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);

-- Enable Row Level Security
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage payment_orders"
  ON payment_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

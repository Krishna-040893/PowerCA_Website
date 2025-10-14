-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id TEXT UNIQUE NOT NULL,
  payment_id TEXT UNIQUE,
  signature TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  plan TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  company TEXT,
  gst_number TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  payment_id UUID UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  gst DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'paid',
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_email ON payments(email);
CREATE INDEX idx_invoices_payment_id ON invoices(payment_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

-- Policy: Service role can manage all payments
CREATE POLICY "Service role can manage payments" ON payments
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Policy: Users can view their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments 
      WHERE payments.id = invoices.payment_id 
      AND (payments.user_id = auth.uid() OR payments.email = auth.jwt()->>'email')
    )
  );

-- Policy: Service role can manage all invoices
CREATE POLICY "Service role can manage invoices" ON invoices
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
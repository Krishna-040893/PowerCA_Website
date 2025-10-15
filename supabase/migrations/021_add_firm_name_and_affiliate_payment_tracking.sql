-- =====================================================
-- Add firm_name to payment tables and create dedicated affiliate referral payments table
-- =====================================================

-- 1. Add firm_name to payment_orders table
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS firm_name TEXT;

-- Add index for firm_name
CREATE INDEX IF NOT EXISTS idx_payment_orders_firm_name
ON public.payment_orders(firm_name);

-- 2. Add firm_name to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS firm_name TEXT;

-- 3. Create dedicated affiliate_referral_payments table
-- This table specifically tracks payments made through affiliate referrals
CREATE TABLE IF NOT EXISTS public.affiliate_referral_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referral tracking
  referral_id UUID REFERENCES public.affiliate_referrals(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  affiliate_id TEXT NOT NULL,

  -- Payment details
  order_id TEXT NOT NULL,
  payment_id TEXT,
  razorpay_signature TEXT,

  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_firm_name TEXT,
  customer_company TEXT,
  customer_gst TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_state TEXT,
  customer_postcode TEXT,

  -- Amount details
  payment_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  gst_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,

  -- Product/Plan details
  product_id TEXT,
  plan_type TEXT,

  -- Commission tracking
  commission_amount DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  commission_paid BOOLEAN DEFAULT FALSE,
  commission_paid_at TIMESTAMP WITH TIME ZONE,

  -- Status
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_completed_at TIMESTAMP WITH TIME ZONE,

  -- Additional notes
  notes JSONB
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_referral_id
ON public.affiliate_referral_payments(referral_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_referral_code
ON public.affiliate_referral_payments(referral_code);

CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_customer_id
ON public.affiliate_referral_payments(customer_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_affiliate_id
ON public.affiliate_referral_payments(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_order_id
ON public.affiliate_referral_payments(order_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_payment_id
ON public.affiliate_referral_payments(payment_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_customer_email
ON public.affiliate_referral_payments(customer_email);

CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_payment_status
ON public.affiliate_referral_payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_affiliate_referral_payments_created_at
ON public.affiliate_referral_payments(created_at);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_affiliate_referral_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER affiliate_referral_payments_updated_at
  BEFORE UPDATE ON public.affiliate_referral_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_referral_payments_updated_at();

-- Enable Row Level Security
ALTER TABLE public.affiliate_referral_payments ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage affiliate_referral_payments"
  ON public.affiliate_referral_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Affiliates can view their own referral payments
CREATE POLICY "Affiliates can view own referral payments"
  ON public.affiliate_referral_payments
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT affiliate_id
      FROM public.affiliate_registrations
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.affiliate_referral_payments IS 'Dedicated table for tracking all payments made through affiliate referrals';
COMMENT ON COLUMN public.affiliate_referral_payments.referral_id IS 'Foreign key to affiliate_referrals table';
COMMENT ON COLUMN public.affiliate_referral_payments.customer_id IS 'Unique customer ID assigned by affiliate';
COMMENT ON COLUMN public.affiliate_referral_payments.commission_amount IS 'Commission earned by affiliate (typically 10% of payment_amount)';
COMMENT ON COLUMN public.affiliate_referral_payments.commission_paid IS 'Whether commission has been paid to affiliate';

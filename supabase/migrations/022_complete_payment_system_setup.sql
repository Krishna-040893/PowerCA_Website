-- =====================================================
-- Complete Payment System Setup
-- This migration ensures all tables have the necessary columns
-- for proper payment and affiliate tracking
-- =====================================================

-- =====================================================
-- PART 1: Update payment_orders table
-- =====================================================

-- Add missing columns to payment_orders
ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS firm_name TEXT,
ADD COLUMN IF NOT EXISTS customer_id TEXT,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS is_affiliate_purchase BOOLEAN DEFAULT FALSE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_payment_orders_firm_name
ON public.payment_orders(firm_name);

CREATE INDEX IF NOT EXISTS idx_payment_orders_customer_id
ON public.payment_orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_payment_orders_referral_code
ON public.payment_orders(referral_code);

CREATE INDEX IF NOT EXISTS idx_payment_orders_is_affiliate_purchase
ON public.payment_orders(is_affiliate_purchase);

-- Add comments
COMMENT ON COLUMN public.payment_orders.firm_name IS 'Firm or company name of the customer';
COMMENT ON COLUMN public.payment_orders.customer_id IS 'Unique customer ID assigned by affiliate (e.g., CUS001)';
COMMENT ON COLUMN public.payment_orders.referral_code IS 'Affiliate referral code used for this order';
COMMENT ON COLUMN public.payment_orders.is_affiliate_purchase IS 'Whether this order was made through an affiliate referral';

-- =====================================================
-- PART 2: Update payments table
-- =====================================================

-- Add firm_name to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS firm_name TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_payments_firm_name
ON public.payments(firm_name);

COMMENT ON COLUMN public.payments.firm_name IS 'Firm or company name of the customer';

-- =====================================================
-- PART 3: Create affiliate_referral_payments table
-- =====================================================

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS public.affiliate_referral_payments CASCADE;

-- Create dedicated affiliate_referral_payments table
CREATE TABLE public.affiliate_referral_payments (
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
  notes JSONB,

  -- Constraints
  CONSTRAINT unique_order_payment UNIQUE(order_id, payment_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_affiliate_referral_payments_referral_id
ON public.affiliate_referral_payments(referral_id);

CREATE INDEX idx_affiliate_referral_payments_referral_code
ON public.affiliate_referral_payments(referral_code);

CREATE INDEX idx_affiliate_referral_payments_customer_id
ON public.affiliate_referral_payments(customer_id);

CREATE INDEX idx_affiliate_referral_payments_affiliate_id
ON public.affiliate_referral_payments(affiliate_id);

CREATE INDEX idx_affiliate_referral_payments_order_id
ON public.affiliate_referral_payments(order_id);

CREATE INDEX idx_affiliate_referral_payments_payment_id
ON public.affiliate_referral_payments(payment_id);

CREATE INDEX idx_affiliate_referral_payments_customer_email
ON public.affiliate_referral_payments(customer_email);

CREATE INDEX idx_affiliate_referral_payments_payment_status
ON public.affiliate_referral_payments(payment_status);

CREATE INDEX idx_affiliate_referral_payments_commission_paid
ON public.affiliate_referral_payments(commission_paid);

CREATE INDEX idx_affiliate_referral_payments_created_at
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
COMMENT ON TABLE public.affiliate_referral_payments IS 'Dedicated table for tracking all payments made through affiliate referrals with commission details';
COMMENT ON COLUMN public.affiliate_referral_payments.referral_id IS 'Foreign key to affiliate_referrals table';
COMMENT ON COLUMN public.affiliate_referral_payments.customer_id IS 'Unique customer ID assigned by affiliate';
COMMENT ON COLUMN public.affiliate_referral_payments.commission_amount IS 'Commission earned by affiliate (typically 10% of payment_amount)';
COMMENT ON COLUMN public.affiliate_referral_payments.commission_paid IS 'Whether commission has been paid to affiliate';
COMMENT ON COLUMN public.affiliate_referral_payments.payment_status IS 'Status of the payment: pending, processing, completed, failed, refunded';

-- =====================================================
-- PART 4: Data validation view
-- =====================================================

-- Create a view to easily check payment tracking completeness
CREATE OR REPLACE VIEW payment_tracking_status AS
SELECT
  po.order_id,
  po.customer_email,
  po.firm_name as order_firm_name,
  po.referral_code,
  po.is_affiliate_purchase,
  p.payment_id,
  p.firm_name as payment_firm_name,
  p.status as payment_status,
  s.plan as subscription_plan,
  ar.status as referral_status,
  arp.id as affiliate_payment_tracked,
  arp.commission_paid
FROM payment_orders po
LEFT JOIN payments p ON p.order_id = po.order_id
LEFT JOIN subscriptions s ON s.user_id::text = (
  SELECT id::text FROM registration_forms WHERE email = po.customer_email LIMIT 1
)
LEFT JOIN affiliate_referrals ar ON ar.referral_code = po.referral_code
  AND ar.customer_id = po.customer_id
LEFT JOIN affiliate_referral_payments arp ON arp.order_id = po.order_id
ORDER BY po.created_at DESC;

COMMENT ON VIEW payment_tracking_status IS 'Comprehensive view showing payment tracking across all related tables';

-- =====================================================
-- VERIFICATION QUERIES (Run these after migration)
-- =====================================================

-- Verify payment_orders columns
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'payment_orders'
-- ORDER BY ordinal_position;

-- Verify payments columns
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'payments'
-- ORDER BY ordinal_position;

-- Verify affiliate_referral_payments table exists
-- SELECT COUNT(*) FROM affiliate_referral_payments;

-- Check payment tracking status
-- SELECT * FROM payment_tracking_status LIMIT 10;

-- Create affiliate_registrations table for comprehensive affiliate data
CREATE TABLE IF NOT EXISTS affiliate_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES registration_forms(id) ON DELETE CASCADE,

  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,

  -- Business Information
  business_type TEXT DEFAULT 'individual' CHECK (business_type IN ('individual', 'company', 'partnership')),
  company_name TEXT,
  designation TEXT,
  experience TEXT,
  website TEXT,

  -- Affiliate Information
  promotion_method TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  monthly_leads TEXT,

  -- Payment Information
  payment_email TEXT NOT NULL,
  pan_number TEXT,
  gst_number TEXT,

  -- Status & Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  referral_code TEXT UNIQUE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_user_id ON affiliate_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_email ON affiliate_registrations(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_status ON affiliate_registrations(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_referral_code ON affiliate_registrations(referral_code);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_affiliate_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER affiliate_registrations_updated_at
  BEFORE UPDATE ON affiliate_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_registrations_updated_at();

-- Enable Row Level Security
ALTER TABLE affiliate_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliate_registrations table
-- Users can view their own registration
CREATE POLICY "Users can view own affiliate registration"
  ON affiliate_registrations
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Service role can do everything
CREATE POLICY "Service role can manage affiliate registrations"
  ON affiliate_registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can insert their own registration
CREATE POLICY "Users can insert own affiliate registration"
  ON affiliate_registrations
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM affiliate_registrations WHERE referral_code = code) INTO exists;

    -- Exit loop if code is unique
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code when affiliate is approved
CREATE OR REPLACE FUNCTION set_referral_code_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.referral_code IS NULL THEN
    NEW.referral_code = generate_referral_code();
    NEW.approved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
  BEFORE UPDATE ON affiliate_registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code_on_approval();

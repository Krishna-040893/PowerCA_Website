-- =====================================================
-- Add customer_id column to existing affiliate_referrals table
-- This migration fixes the missing customer_id column
-- =====================================================

-- Add customer_id column to affiliate_referrals table
ALTER TABLE public.affiliate_referrals
ADD COLUMN IF NOT EXISTS customer_id TEXT UNIQUE;

-- Create index for customer_id
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_customer_id
ON public.affiliate_referrals(customer_id);

-- Function to generate unique customer ID (CUS001, CUS002, etc.)
CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  new_customer_id TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Get the maximum customer ID number
    SELECT COALESCE(
      MAX(
        CAST(
          SUBSTRING(customer_id FROM 4) AS INTEGER
        )
      ),
      0
    ) + 1 INTO next_id
    FROM affiliate_referrals
    WHERE customer_id ~ '^CUS[0-9]+$';

    -- Format the new customer ID with leading zeros (CUS001, CUS002, etc.)
    new_customer_id := 'CUS' || LPAD(next_id::TEXT, 3, '0');

    -- Check if this ID already exists
    SELECT EXISTS(
      SELECT 1 FROM affiliate_referrals WHERE customer_id = new_customer_id
    ) INTO exists;

    -- Exit loop if ID is unique
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate customer ID when referral is created
CREATE OR REPLACE FUNCTION set_customer_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NULL THEN
    NEW.customer_id = generate_customer_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate customer ID on insert
DROP TRIGGER IF EXISTS set_customer_id ON public.affiliate_referrals;
CREATE TRIGGER set_customer_id
  BEFORE INSERT ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_id_on_insert();

-- Generate customer IDs for any existing referrals (if any)
UPDATE public.affiliate_referrals
SET customer_id = generate_customer_id()
WHERE customer_id IS NULL;

-- =====================================================
-- Update Customer ID Generation to be Affiliate-Specific
-- Each affiliate gets their own customer ID sequence
-- AFF001: CUS001, CUS002, CUS003...
-- AFF002: CUS001, CUS002, CUS003...
-- =====================================================

-- Drop the old trigger first
DROP TRIGGER IF EXISTS set_customer_id ON public.affiliate_referrals;

-- Drop the old functions
DROP FUNCTION IF EXISTS set_customer_id_on_insert();
DROP FUNCTION IF EXISTS generate_customer_id();

-- Create new function to generate affiliate-specific customer ID
-- This function now takes affiliate_id as a parameter
CREATE OR REPLACE FUNCTION generate_customer_id_for_affiliate(p_affiliate_id TEXT)
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  new_customer_id TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Get the maximum customer ID number FOR THIS SPECIFIC AFFILIATE
    SELECT COALESCE(
      MAX(
        CAST(
          SUBSTRING(customer_id FROM 4) AS INTEGER
        )
      ),
      0
    ) + 1 INTO next_id
    FROM affiliate_referrals
    WHERE customer_id ~ '^CUS[0-9]+$'
      AND affiliate_id = p_affiliate_id;  -- Filter by affiliate_id

    -- Format the new customer ID with leading zeros (CUS001, CUS002, etc.)
    new_customer_id := 'CUS' || LPAD(next_id::TEXT, 3, '0');

    -- Check if this ID already exists FOR THIS AFFILIATE
    SELECT EXISTS(
      SELECT 1
      FROM affiliate_referrals
      WHERE customer_id = new_customer_id
        AND affiliate_id = p_affiliate_id
    ) INTO exists;

    -- Exit loop if ID is unique for this affiliate
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger function that passes affiliate_id
CREATE OR REPLACE FUNCTION set_customer_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate customer_id if not already provided
  IF NEW.customer_id IS NULL THEN
    -- Check if affiliate_id exists
    IF NEW.affiliate_id IS NULL OR NEW.affiliate_id = '' THEN
      RAISE EXCEPTION 'affiliate_id is required to generate customer_id';
    END IF;

    -- Generate affiliate-specific customer ID
    NEW.customer_id = generate_customer_id_for_affiliate(NEW.affiliate_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_customer_id
  BEFORE INSERT ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_id_on_insert();

-- Add comments
COMMENT ON FUNCTION generate_customer_id_for_affiliate(TEXT) IS 'Generates sequential customer IDs per affiliate (e.g., AFF001 gets CUS001, CUS002; AFF002 gets CUS001, CUS002)';

-- Verification query (comment out in production)
-- SELECT
--   affiliate_id,
--   customer_id,
--   referred_name,
--   referred_email,
--   created_at
-- FROM public.affiliate_referrals
-- ORDER BY affiliate_id, customer_id;

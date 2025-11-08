-- Add affiliate_id column to affiliate_registrations table
ALTER TABLE affiliate_registrations
ADD COLUMN IF NOT EXISTS affiliate_id TEXT UNIQUE;

-- Create index for affiliate_id
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_affiliate_id ON affiliate_registrations(affiliate_id);

-- Function to generate unique affiliate ID (AFF001, AFF002, etc.)
CREATE OR REPLACE FUNCTION generate_affiliate_id()
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  new_affiliate_id TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Get the maximum affiliate ID number
    SELECT COALESCE(
      MAX(
        CAST(
          SUBSTRING(affiliate_id FROM 4) AS INTEGER
        )
      ),
      0
    ) + 1 INTO next_id
    FROM affiliate_registrations
    WHERE affiliate_id ~ '^AFF[0-9]+$';

    -- Format the new affiliate ID with leading zeros (AFF001, AFF002, etc.)
    new_affiliate_id := 'AFF' || LPAD(next_id::TEXT, 3, '0');

    -- Check if this ID already exists
    SELECT EXISTS(
      SELECT 1 FROM affiliate_registrations WHERE affiliate_id = new_affiliate_id
    ) INTO exists;

    -- Exit loop if ID is unique
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN new_affiliate_id;
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger to also generate affiliate_id on approval
CREATE OR REPLACE FUNCTION set_referral_code_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Generate referral code if not exists
    IF NEW.referral_code IS NULL THEN
      NEW.referral_code = generate_referral_code();
    END IF;

    -- Generate affiliate ID if not exists
    IF NEW.affiliate_id IS NULL THEN
      NEW.affiliate_id = generate_affiliate_id();
    END IF;

    -- Set approved_at timestamp
    NEW.approved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS set_referral_code ON affiliate_registrations;
CREATE TRIGGER set_referral_code
  BEFORE UPDATE ON affiliate_registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code_on_approval();

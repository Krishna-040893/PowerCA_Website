-- Migration: Add order expiration tracking to payment_orders
-- This prevents database pollution from abandoned orders

-- Step 1: Add expires_at column to track when order expires
ALTER TABLE payment_orders
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Update existing orders to expire 30 minutes after creation
UPDATE payment_orders
SET expires_at = created_at + INTERVAL '30 minutes'
WHERE expires_at IS NULL;

-- Step 3: Drop existing status constraint
ALTER TABLE payment_orders
DROP CONSTRAINT IF EXISTS payment_orders_status_check;

-- Step 4: Add new status constraint including 'expired' and 'failed'
-- Status flow: created -> attempted -> paid/expired/failed
ALTER TABLE payment_orders
ADD CONSTRAINT payment_orders_status_check
CHECK (status IN ('created', 'attempted', 'paid', 'expired', 'failed'));

-- Step 5: Create index for efficient expiration queries
CREATE INDEX IF NOT EXISTS idx_payment_orders_expires_at ON payment_orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status_created_at ON payment_orders(status, created_at);

-- Step 6: Mark old 'created' orders (older than 30 minutes) as 'expired'
UPDATE payment_orders
SET status = 'expired'
WHERE status = 'created'
  AND created_at < NOW() - INTERVAL '30 minutes';

-- Step 7: Create function to auto-expire old orders
CREATE OR REPLACE FUNCTION expire_old_payment_orders()
RETURNS void AS $$
BEGIN
  UPDATE payment_orders
  SET status = 'expired'
  WHERE status IN ('created', 'attempted')
    AND expires_at < NOW()
    AND status != 'paid';
END;
$$ LANGUAGE plpgsql;

-- Migration complete
-- payment_orders now supports: created, attempted, paid, expired, failed
-- Orders automatically expire 30 minutes after creation

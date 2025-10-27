-- Migration: Use actual Razorpay payment statuses
-- This migration updates the payments table to use actual Razorpay statuses instead of custom ones

-- Step 1: Drop the old CHECK constraint FIRST (so we can update data)
-- Razorpay Payment Statuses: created, authorized, captured, refunded, failed
ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_status_check;

-- Step 2: Update existing data to match Razorpay statuses
UPDATE payments
SET status = 'captured'
WHERE status = 'success' OR status = 'paid';

UPDATE payments
SET status = 'created'
WHERE status = 'pending';

-- Step 3: Add new CHECK constraint with Razorpay payment statuses
ALTER TABLE payments
ADD CONSTRAINT payments_status_check
CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed'));

-- Step 4: Update payment_orders table to use Razorpay order statuses
-- Razorpay Order Statuses: created, attempted, paid

-- First drop the old constraint
ALTER TABLE payment_orders
DROP CONSTRAINT IF EXISTS payment_orders_status_check;

-- Update existing data in payment_orders to match Razorpay order statuses
UPDATE payment_orders
SET status = 'paid'
WHERE status = 'success' OR status = 'captured';

UPDATE payment_orders
SET status = 'created'
WHERE status = 'pending';

-- Add new constraint with Razorpay order statuses
ALTER TABLE payment_orders
ADD CONSTRAINT payment_orders_status_check
CHECK (status IN ('created', 'attempted', 'paid'));

-- Step 5: Add indexes for better query performance on status
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);

-- Step 6: Update default status for payments to use Razorpay status
ALTER TABLE payments
ALTER COLUMN status SET DEFAULT 'created';

-- Migration complete
-- Payments table now uses: created, authorized, captured, refunded, failed
-- Payment_orders table now uses: created, attempted, paid

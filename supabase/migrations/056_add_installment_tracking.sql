-- Add installment tracking columns

-- payment_orders: track which installment number this payment is for
ALTER TABLE payment_orders
ADD COLUMN IF NOT EXISTS installment_number INTEGER DEFAULT NULL;

-- subscriptions: track installment progress
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS installments_paid INTEGER DEFAULT 0;

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS total_installments INTEGER DEFAULT 10;

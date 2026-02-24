-- Add commission_amount and commission_status columns to affiliate_referrals
-- commission_status: 'pending' (default) | 'due' (admin entered amount) | 'processing' | 'paid' (disbursed)

ALTER TABLE affiliate_referrals
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS commission_status TEXT DEFAULT 'pending';

-- Backfill: if there's already a paid record in affiliate_referral_payments, mark as 'paid'
UPDATE affiliate_referrals ar
SET commission_status = 'paid'
WHERE EXISTS (
  SELECT 1 FROM affiliate_referral_payments arp
  WHERE arp.referral_id = ar.id
  AND arp.commission_paid = true
);

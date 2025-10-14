# Complete Payment System Deployment Guide

## Overview

This guide will help you deploy the complete payment tracking system with all required tables and proper data flow.

## Current Status

✅ **Code Updates Complete**

- Payment creation API: Properly stores all order data
- Payment verification API: Handles all table updates
- Subscription management: Creates user subscriptions
- Affiliate tracking: Full commission tracking system

⚠️ **Database Migration Needed**
The database tables need to be updated with the latest migration.

---

## Step 1: Apply Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project at https://supabase.com/dashboard
   - Navigate to SQL Editor

2. **Run Migration Script**
   - Copy the entire contents of: `supabase/migrations/022_complete_payment_system_setup.sql`
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Verify Success**
   - You should see: "Success. No rows returned"
   - This means all tables were created/updated successfully

### Option B: Using Supabase CLI

```bash
# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase migration up
```

---

## Step 2: Verify Migration Success

Run these verification queries in Supabase SQL Editor:

```sql
-- 1. Check payment_orders has new columns
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'payment_orders'
  AND column_name IN ('firm_name', 'customer_id', 'referral_code', 'is_affiliate_purchase');
-- Expected: 4 rows

-- 2. Check payments has firm_name
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name = 'firm_name';
-- Expected: 1 row

-- 3. Check affiliate_referral_payments table exists
SELECT COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_name = 'affiliate_referral_payments';
-- Expected: 1

-- 4. Check subscriptions table exists
SELECT COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_name = 'subscriptions';
-- Expected: 1

-- 5. View all tables in your schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## Step 3: Test Payment Flow

### Test Scenario 1: Regular Payment (No Referral)

1. **Navigate to pricing page**

   ```
   http://localhost:3001/pricing
   ```

2. **Click "Book Now"** on Launch Offer card

3. **Register/Login** (if not already)

4. **Fill checkout form** with test data:
   - First Name: Test User
   - **Firm Name:** Test & Associates _(this is new field)_
   - Email: test@example.com
   - Phone: 9876543210
   - Company: Test Company
   - GST: 29ABCDE1234F1Z5

5. **Complete Payment** using Razorpay test card:
   - Card: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: Any future date

6. **Verify Data Stored:**

```sql
-- Check payment_orders
SELECT
  order_id,
  firm_name,
  referral_code,
  is_affiliate_purchase,
  customer_email
FROM payment_orders
ORDER BY created_at DESC
LIMIT 1;

-- Check payments
SELECT
  payment_id,
  firm_name,
  amount,
  status
FROM payments
ORDER BY created_at DESC
LIMIT 1;

-- Check subscriptions
SELECT
  plan,
  status,
  current_period_end
FROM subscriptions
ORDER BY created_at DESC
LIMIT 1;

-- Expected Results:
-- ✅ firm_name should be "Test & Associates"
-- ✅ subscription plan should be "launch_offer"
-- ✅ status should be "ACTIVE"
```

---

### Test Scenario 2: Affiliate Referral Payment

1. **Create Affiliate** (if not already done)
   - Go to: http://localhost:3001/affiliate-program/register
   - Fill form and submit
   - Admin approves at: http://localhost:3001/admin/affiliates

2. **Login as Affiliate**
   - Go to: http://localhost:3001/affiliate-login
   - Login with approved affiliate credentials

3. **Create Referral Customer**
   - Go to affiliate dashboard
   - Click "Create New Referral"
   - Enter customer details:
     - Name: Referral Customer
     - Email: referral@example.com
     - Phone: 9876543211
   - Copy the generated referral link

4. **Customer Makes Payment**
   - Open referral link in incognito/private window
   - Should see: "🎁 You're purchasing through an affiliate referral!"
   - Register as new user
   - Complete checkout with:
     - First Name: Referral
     - **Firm Name:** Referred Associates
     - Fill other details
   - Complete payment

5. **Verify Complete Data Flow:**

```sql
-- Get the latest order details
SELECT
  po.order_id,
  po.customer_email,
  po.firm_name,
  po.referral_code,
  po.customer_id,
  po.is_affiliate_purchase,
  p.payment_id,
  p.status as payment_status,
  ar.status as referral_status,
  ar.payment_amount,
  arp.commission_amount,
  arp.commission_paid
FROM payment_orders po
LEFT JOIN payments p ON p.order_id = po.order_id
LEFT JOIN affiliate_referrals ar ON ar.referral_code = po.referral_code
  AND ar.customer_id = po.customer_id
LEFT JOIN affiliate_referral_payments arp ON arp.order_id = po.order_id
WHERE po.is_affiliate_purchase = true
ORDER BY po.created_at DESC
LIMIT 1;

-- Expected Results:
-- ✅ is_affiliate_purchase: true
-- ✅ referral_code: Should have 8-character code (e.g., 6C7D7684)
-- ✅ customer_id: Should have customer ID (e.g., CUS001)
-- ✅ firm_name: "Referred Associates"
-- ✅ referral_status: "completed"
-- ✅ payment_amount: 50000 (or actual amount)
-- ✅ commission_amount: 5000 (10% of payment_amount)
-- ✅ commission_paid: false
```

---

## Step 4: Verify Admin Dashboard

### Check Affiliate Payments Page

1. **Login as Admin**

   ```
   http://localhost:3001/admin-login
   Username: superadmin
   Password: Admin@123
   ```

2. **Navigate to Affiliate Payments**

   ```
   http://localhost:3001/admin/affiliate-payments
   ```

3. **Verify Display:**
   - ✅ Should show all affiliate referral payments
   - ✅ Shows customer firm names
   - ✅ Shows commission amounts
   - ✅ Can filter by status (pending/completed)
   - ✅ Can mark commissions as paid

### Check Affiliate Referrals Page

1. **Navigate to Affiliate Referrals**

   ```
   http://localhost:3001/admin/affiliate-referrals
   ```

2. **Verify Display:**
   - ✅ Shows referrals grouped by affiliate
   - ✅ Shows statistics (total, pending, completed)
   - ✅ Expandable to show customer details
   - ✅ Shows customer firm names

---

## Step 5: Fix Existing Missed Payment

If you have the payment from `order_RS8Zzx1XfdUUTt` that wasn't tracked:

```sql
-- Run this query to create the missing record
-- (Adjust values as needed based on actual payment data)

WITH payment_data AS (
  SELECT
    po.order_id,
    po.referral_code,
    po.customer_id,
    po.customer_name,
    po.customer_email,
    po.customer_phone,
    po.firm_name,
    po.company,
    po.gst_number,
    p.payment_id,
    p.signature as razorpay_signature,
    p.amount as payment_amount,
    p.created_at
  FROM payment_orders po
  LEFT JOIN payments p ON p.order_id = po.order_id
  WHERE po.order_id = 'order_RS8Zzx1XfdUUTt'
),
referral_data AS (
  SELECT
    id as referral_id,
    affiliate_id,
    referral_code,
    customer_id
  FROM affiliate_referrals
  WHERE referral_code = '6C7D7684'
    AND customer_id = (SELECT customer_id FROM payment_data)
  LIMIT 1
)
INSERT INTO affiliate_referral_payments (
  referral_id,
  referral_code,
  customer_id,
  affiliate_id,
  order_id,
  payment_id,
  razorpay_signature,
  customer_name,
  customer_email,
  customer_phone,
  customer_firm_name,
  customer_company,
  customer_gst,
  payment_amount,
  currency,
  gst_amount,
  total_amount,
  commission_amount,
  commission_rate,
  commission_paid,
  payment_status,
  payment_completed_at,
  notes
)
SELECT
  rd.referral_id,
  pd.referral_code,
  pd.customer_id,
  rd.affiliate_id,
  pd.order_id,
  pd.payment_id,
  pd.razorpay_signature,
  pd.customer_name,
  pd.customer_email,
  pd.customer_phone,
  pd.firm_name,
  pd.company,
  pd.gst_number,
  pd.payment_amount,
  'INR',
  ROUND(pd.payment_amount * 0.18, 2),
  ROUND(pd.payment_amount * 1.18, 2),
  ROUND(pd.payment_amount * 0.10, 2),
  10.00,
  false,
  'completed',
  pd.created_at,
  jsonb_build_object(
    'manual_entry', true,
    'created_from_script', true,
    'original_order_id', 'order_RS8Zzx1XfdUUTt',
    'referral_code', '6C7D7684'
  )
FROM payment_data pd
CROSS JOIN referral_data rd
WHERE NOT EXISTS (
  SELECT 1 FROM affiliate_referral_payments
  WHERE order_id = 'order_RS8Zzx1XfdUUTt'
);
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     COMPLETE PAYMENT FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Book Now"
   ↓
2. POST /api/payment/create-order
   ├─→ Razorpay order created
   └─→ INSERT into payment_orders
       ├─ order_id
       ├─ firm_name ✨ NEW
       ├─ customer_id ✨ NEW
       ├─ referral_code ✨ NEW
       └─ is_affiliate_purchase ✨ NEW
   ↓
3. User completes payment on Razorpay
   ↓
4. POST /api/payment/verify
   ├─→ Verify signature
   ├─→ INSERT into payments
   │   └─ firm_name ✨ NEW
   ├─→ INSERT into subscriptions ✨ NEW
   │   ├─ plan: 'launch_offer'
   │   ├─ status: 'ACTIVE'
   │   └─ current_period_end: +1 year
   ├─→ IF affiliate referral:
   │   ├─→ UPDATE affiliate_referrals
   │   │   └─ status: pending → completed
   │   └─→ INSERT into affiliate_referral_payments ✨ NEW
   │       ├─ customer_firm_name
   │       ├─ commission_amount (10%)
   │       ├─ commission_paid: false
   │       └─ payment_status: completed
   └─→ Generate & send invoice
   ↓
5. Redirect to /payment-success
```

---

## Troubleshooting

### Issue: Table not found errors

**Solution:** Run the migration script again. Check that you're connected to the correct database.

### Issue: Column not found errors

**Solution:** The schema cache might be stale. Restart your Supabase project or wait a few minutes.

### Issue: Payments not creating subscription

**Solution:** Ensure the user is logged in during payment. Guest checkouts won't create subscriptions.

### Issue: Affiliate payment not tracked

**Solution:**

1. Check that `is_affiliate_purchase` is true in payment_orders
2. Verify referral_code and customer_id match in affiliate_referrals table
3. Check logs for any errors during payment verification

---

## Success Criteria

✅ All tables exist with proper columns
✅ Regular payment creates: payment_orders, payments, subscriptions
✅ Affiliate payment creates: all above + updates affiliate_referrals + creates affiliate_referral_payments
✅ Admin dashboard shows all payment data
✅ Commission tracking works correctly
✅ No console errors on pricing page

---

## Next Steps After Deployment

1. **Monitor First Real Payment**
   - Watch logs during first live transaction
   - Verify all tables populated correctly

2. **Set Up Commission Payout Process**
   - Create workflow for marking commissions as paid
   - Set up payment reminders for affiliates

3. **Configure Webhooks** (Optional but recommended)
   - Set up Razorpay webhooks for payment confirmation
   - Add backup payment verification

4. **Enable Analytics**
   - Track conversion rates
   - Monitor affiliate performance
   - Analyze firm name data

---

## Support

If you encounter any issues:

1. Check the logs: `src/lib/logger.ts`
2. Review error messages in browser console
3. Verify database connection in Supabase dashboard
4. Check that all environment variables are set correctly

---

**Last Updated:** 2025-10-11
**Migration Version:** 022
**Status:** Ready for deployment

# Affiliate Payment Tracking System - Setup Guide

## Overview

A complete affiliate referral payment tracking system that stores all payment details separately for easy management and commission tracking.

## Changes Made

### 1. Checkout Page Updates (`src/app/checkout/page.tsx`)

- ✅ Changed "Last Name" field to "Firm Name" with required asterisk
- ✅ Updated form validation to require firm name
- ✅ All payment APIs now receive firm name instead of last name

### 2. Database Changes (`supabase/migrations/021_add_firm_name_and_affiliate_payment_tracking.sql`)

#### New Columns Added:

- `payment_orders.firm_name` - Customer firm name
- `payments.firm_name` - Customer firm name

#### New Table: `affiliate_referral_payments`

A dedicated table for tracking all affiliate referral payments:

**Key Fields:**

- Referral tracking: `referral_id`, `referral_code`, `customer_id`, `affiliate_id`
- Payment details: `order_id`, `payment_id`, `razorpay_signature`
- Customer info: `customer_name`, `customer_email`, `customer_phone`, `customer_firm_name`, etc.
- Amounts: `payment_amount`, `gst_amount`, `total_amount`
- Commission: `commission_amount`, `commission_rate`, `commission_paid`, `commission_paid_at`
- Status: `payment_status` (pending, processing, completed, failed, refunded)

### 3. API Updates

#### Payment Create Order (`src/app/api/payment/create-order/route.ts`)

- Stores `firm_name` in payment_orders table
- Tracks referral information (referral_code, customer_id)

#### Payment Verification (`src/app/api/payment/verify/route.ts`)

- Enhanced logging to track affiliate referral processing
- Retrieves ALL data from payment_orders including firm_name
- When referral payment is completed:
  1. Updates `affiliate_referrals` status to "completed"
  2. **Creates detailed record in `affiliate_referral_payments` table**
  3. Calculates 10% commission automatically
  4. Stores complete customer and payment information

#### Admin API (`src/app/api/admin/affiliate-payments/route.ts`)

- GET: Fetch all affiliate referral payments with filtering
- PUT: Mark commissions as paid
- Returns summary statistics (total payments, commissions, pending, paid)

### 4. Admin Dashboard (`src/app/admin/affiliate-payments/page.tsx`)

A complete admin interface to view and manage affiliate payments:

**Features:**

- 📊 Summary cards showing key metrics
- 🔍 Search by customer name, email, firm, affiliate ID, referral code
- 🎯 Filter by payment status
- ✅ Mark commissions as paid
- 📈 Real-time statistics

**Access:** http://localhost:3001/admin/affiliate-payments

## Setup Instructions

### Step 1: Apply Database Migration

**Option A: Using Supabase CLI**

```bash
cd supabase
supabase db push
```

**Option B: Via Supabase Dashboard**

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Open file: `supabase/migrations/021_add_firm_name_and_affiliate_payment_tracking.sql`
4. Copy all contents
5. Paste and execute in SQL Editor

### Step 2: Verify Tables Created

Run this SQL to check if tables exist:

```sql
-- Check if firm_name columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('payment_orders', 'payments')
AND column_name = 'firm_name';

-- Check if affiliate_referral_payments table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'affiliate_referral_payments';

-- View structure
\d affiliate_referral_payments;
```

### Step 3: Test the Complete Flow

1. **Register Affiliate**
   - Go to: http://localhost:3001/affiliate-program/register
   - Fill in all details
   - Submit registration

2. **Admin Approval**
   - Login as admin: http://localhost:3001/admin-login
   - Go to Affiliates page
   - Approve the new affiliate
   - Note the referral code (e.g., 6C7D7684)

3. **Create Referral Link**
   - Affiliate logs in: http://localhost:3001/affiliate-login
   - Create new referral with customer details
   - Email with referral link sent to customer

4. **Customer Purchase**
   - Customer clicks referral link
   - Registers and goes to checkout
   - Fills in form (including Firm Name ✓)
   - Completes payment

5. **Verify Payment Tracking**
   - Check logs for: `📦 Payment order data retrieved`
   - Check logs for: `✅ Affiliate referral payment record created`
   - Go to: http://localhost:3001/admin/affiliate-payments
   - Verify payment appears in the table

## How Payment Tracking Works

### Flow Diagram:

```
Customer clicks referral link (ref=CODE&cus=ID)
    ↓
Checkout page (firm name field)
    ↓
create-order API (stores in payment_orders with referral info)
    ↓
Payment completed via Razorpay
    ↓
verify API called
    ↓
Retrieves payment_orders data (including referral info)
    ↓
IF referral purchase:
    ├─ Update affiliate_referrals (status: completed)
    ├─ Calculate commission (10% of payment amount)
    └─ INSERT INTO affiliate_referral_payments
         (complete customer, payment, commission details)
    ↓
Admin can view in affiliate-payments dashboard
```

### Database Structure:

**payment_orders** (Order tracking)

- Stores initial order with referral_code, customer_id, firm_name
- Linked to Razorpay order

**affiliate_referrals** (Referral tracking)

- Tracks referral status (pending → completed)
- Stores basic referral information

**affiliate_referral_payments** (✨ NEW - Detailed payment tracking)

- Complete payment record for each affiliate referral
- All customer information including firm name
- Commission tracking and payment status
- Easy reporting and filtering

## Admin Dashboard Features

### Summary Cards

- **Total Payments**: Count of all affiliate payments
- **Total Amount**: Sum of all payment amounts
- **Total Commission**: Sum of all commissions
- **Pending**: Unpaid commissions
- **Paid**: Commissions already paid to affiliates

### Actions

- 🔍 **Search**: Find payments by any field
- 🎯 **Filter**: Filter by payment status
- ✅ **Mark Paid**: Update commission payment status
- 🔄 **Refresh**: Reload latest data

### Export (Future Enhancement)

- Can add CSV/Excel export functionality
- Can add commission payment batch processing

## Troubleshooting

### Issue: Payment not showing in affiliate_referral_payments table

**Check 1: Migration Applied?**

```sql
SELECT * FROM information_schema.tables
WHERE table_name = 'affiliate_referral_payments';
```

If empty, run the migration.

**Check 2: Check Logs**
Look for in server logs:

- `📦 Payment order data retrieved` - Shows if referral info was found
- `✅ Affiliate referral payment record created` - Confirms record creation
- Any error messages

**Check 3: Verify payment_orders has referral data**

```sql
SELECT order_id, referral_code, customer_id, is_affiliate_purchase, firm_name
FROM payment_orders
WHERE order_id = 'order_RS8Zzx1XfdUUTt';
```

**Check 4: Verify affiliate_referrals exists**

```sql
SELECT * FROM affiliate_referrals
WHERE referral_code = '6C7D7684'
AND customer_id = 'CUS002';
```

**Check 5: Check for error creating record**

```sql
-- Check if table structure is correct
\d affiliate_referral_payments;

-- Try manual insert to test
INSERT INTO affiliate_referral_payments (
  referral_code,
  customer_id,
  affiliate_id,
  order_id,
  payment_id,
  customer_name,
  customer_email,
  payment_amount,
  commission_amount,
  commission_rate,
  payment_status
) VALUES (
  'TEST001',
  'TESTCUS',
  'TESTAFF',
  'test_order',
  'test_payment',
  'Test Customer',
  'test@test.com',
  1000,
  100,
  10,
  'completed'
);
```

## For the Specific Payment: order_RS8Zzx1XfdUUTt

To check why this payment wasn't tracked:

```sql
-- 1. Check if order exists and has referral data
SELECT * FROM payment_orders
WHERE order_id = 'order_RS8Zzx1XfdUUTt';

-- 2. Check if referral exists
SELECT * FROM affiliate_referrals
WHERE referral_code = '6C7D7684';

-- 3. Check if payment was recorded
SELECT * FROM payments
WHERE order_id = 'order_RS8Zzx1XfdUUTt';

-- 4. Check if affiliate payment record exists
SELECT * FROM affiliate_referral_payments
WHERE order_id = 'order_RS8Zzx1XfdUUTt';
```

## Commission Management

### View Pending Commissions

```sql
SELECT
  affiliate_id,
  COUNT(*) as payment_count,
  SUM(commission_amount) as total_commission
FROM affiliate_referral_payments
WHERE commission_paid = false
GROUP BY affiliate_id;
```

### Mark Commissions as Paid

Use the admin UI or API:

```bash
curl -X PUT http://localhost:3001/api/admin/affiliate-payments \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "uuid-here",
    "commissionPaid": true
  }'
```

## Next Steps

1. ✅ Apply the database migration
2. ✅ Test a new payment flow end-to-end
3. ✅ Verify data appears in admin dashboard
4. 📝 Add additional reporting features as needed
5. 💰 Implement commission payment workflow
6. 📊 Add analytics and charts

## Files Modified/Created

### Modified:

- `src/app/checkout/page.tsx` - Firm name field
- `src/app/api/payment/create-order/route.ts` - Store firm_name
- `src/app/api/payment/verify/route.ts` - Enhanced tracking

### Created:

- `supabase/migrations/021_add_firm_name_and_affiliate_payment_tracking.sql` - Database migration
- `src/app/api/admin/affiliate-payments/route.ts` - Admin API
- `src/app/admin/affiliate-payments/page.tsx` - Admin dashboard
- `docs/AFFILIATE_PAYMENT_TRACKING_SETUP.md` - This document

## Support

For questions or issues:

1. Check server logs for error messages
2. Verify database migration was applied
3. Test with a new payment (not the old one)
4. Review this documentation

---

**System Status:**

- ✅ Checkout page updated (Firm Name field)
- ✅ Database migration created
- ✅ Payment APIs updated
- ✅ Admin dashboard created
- ⏳ Database migration needs to be applied
- ⏳ New test payment needed to verify

**Server Running:** http://localhost:3001
**Admin Dashboard:** http://localhost:3001/admin/affiliate-payments

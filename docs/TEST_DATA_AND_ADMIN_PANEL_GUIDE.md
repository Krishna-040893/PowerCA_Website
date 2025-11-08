# Test Data and Admin Panel Display Guide

## 🎯 Overview

This guide shows you how to:

1. Insert comprehensive test data
2. View all data in admin panel
3. Verify the missed payment is recovered
4. Test all admin panel features

---

## Step 1: Insert Test Data

### Run SQL Script in Supabase

1. **Open Supabase Dashboard**

   ```
   https://supabase.com/dashboard
   ```

2. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Run Test Data Script**
   - Open file: `supabase/TEST_DATA_INSERT.sql`
   - Copy entire file contents
   - Paste into SQL Editor
   - Click "RUN"

4. **Verify Success**
   You should see output like:
   ```
   ✅ Test data inserted successfully!
   ✅ Affiliate ID: AFB2A9CF-7B34-46C8-BA18-D51E3A8A7F89
   ✅ Referral 1 (CUS001): <uuid> - Commission PAID
   ✅ Referral 2 (CUS002): <uuid> - Commission PENDING
   ```

### What Test Data Includes

The script creates:

**4 Test Users:**

- Rajesh Kumar (Regular customer)
- Priya Sharma (Regular customer)
- Amit Patel (Affiliate referral customer - CUS001)
- Nikila Rajan (Affiliate referral customer - CUS002 - MISSED PAYMENT)

**4 Payment Orders:**

1. ✅ Regular payment - R.K. & Associates
2. ✅ Regular payment - Sharma Financial Consultants
3. ✅ Affiliate payment - A.P. & Partners (CUS001)
4. ✅ Affiliate payment - Nikila & Associates (CUS002 - **RECOVERED**)

**4 Completed Payments:**

1. pay_TEST001 - ₹59,000
2. pay_TEST002 - ₹59,000
3. pay_TEST003 - ₹59,000
4. **pay_RS8b9ZoxGnEStg** - ₹59,000 (RECOVERED)

**4 Active Subscriptions:**

- All users have "launch_offer" plan
- Status: ACTIVE
- Valid for 1 year

**2 Affiliate Referrals:**

1. CUS001 - Amit Patel - Status: Completed
2. CUS002 - Nikila Rajan - Status: Completed (RECOVERED)

**2 Affiliate Payment Records:**

1. CUS001 - Commission: ₹5,000 - **PAID** ✅
2. CUS002 - Commission: ₹5,000 - **PENDING** ⏳

---

## Step 2: View Data in Admin Panel

### Login to Admin

1. **Navigate to Admin Login**

   ```
   http://localhost:3001/admin-login
   ```

2. **Login Credentials**
   ```
   Username: superadmin
   Password: Powerca@25
   ```

---

## Admin Panel Pages - What You'll See

### 📊 Dashboard (`/admin`)

**Overview Cards:**

```
┌─────────────────────────────────────────────────┐
│  📋 Total Bookings           🎯 Pending         │
│     5                            2              │
├─────────────────────────────────────────────────┤
│  📝 Total Registrations     ⭐ Active           │
│     4                            4              │
└─────────────────────────────────────────────────┘
```

---

### 👥 All Affiliates (`/admin/affiliates`)

**What You'll See:**

```
┌────────────────────────────────────────────────────────────────┐
│  All Affiliate Partners                    Total: 1 Affiliate  │
├────────────────────────────────────────────────────────────────┤
│  Name          Email             Company        Referrals      │
│  ────────────────────────────────────────────────────────────  │
│  John          john@gmail.com    John Co.       2             │
│  Ref Code: 6C7D7684              Status: Approved             │
└────────────────────────────────────────────────────────────────┘
```

**Features:**

- ✅ Shows total affiliate count
- ✅ Shows referral statistics
- ✅ Shows approval status
- ✅ Can search by name/email

---

### ✅ Approvals Page (`/admin/affiliates/approve`)

**What You'll See:**

```
┌────────────────────────────────────────────────────────────────┐
│  Approved Affiliates                                           │
├────────────────────────────────────────────────────────────────┤
│  Approved Affiliates: 1                                        │
│  Approved Today: 0                                             │
│  Total Affiliates: 1                                           │
├────────────────────────────────────────────────────────────────┤
│  Applicant         Company     Referrals  Status   Actions     │
│  ────────────────────────────────────────────────────────────  │
│  John              John Co.     2          Approved  Review    │
│  john@gmail.com                                                │
│  Applied: Oct 11, 2025                                         │
└────────────────────────────────────────────────────────────────┘
```

**Features:**

- ✅ Shows ONLY approved affiliates
- ✅ Filters out pending/rejected
- ✅ Shows statistics
- ✅ Can review details

---

### 👨‍👩‍👧‍👦 Affiliate Referrals (`/admin/affiliate-referrals`)

**What You'll See:**

```
┌────────────────────────────────────────────────────────────────┐
│  Affiliate Referrals                                           │
├────────────────────────────────────────────────────────────────┤
│  Summary Statistics                                            │
│  ┌─────────────┬──────────┬───────────┬─────────────────┐    │
│  │ Total: 2    │ Pending: │ Completed:│ Active Affiliates│    │
│  │             │    0     │     2     │        1        │    │
│  └─────────────┴──────────┴───────────┴─────────────────┘    │
├────────────────────────────────────────────────────────────────┤
│  📧 john@gmail.com (John) - Code: 6C7D7684                    │
│  Total: 2  |  Pending: 0  |  Completed: 2                     │
│  [Click to expand ▼]                                           │
├────────────────────────────────────────────────────────────────┤
│  When expanded, shows:                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Customer ID  Name           Email              Firm    │  │
│  │ ──────────────────────────────────────────────────────│  │
│  │ CUS001       Amit Patel     test.customer3@   A.P. &  │  │
│  │              Status: ✅ Completed  Payment: ₹59,000    │  │
│  │              Created: Sep 21, 2025                     │  │
│  │                                                        │  │
│  │ CUS002       Nikila Rajan   nikila.test@     Nikila & │  │
│  │              Status: ✅ Completed  Payment: ₹59,000    │  │
│  │              Created: Oct 10, 2025 (RECOVERED)        │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Features:**

- ✅ Groups referrals by affiliate
- ✅ Shows statistics per affiliate
- ✅ Expandable to see customer details
- ✅ Shows firm names
- ✅ Search across all fields
- ✅ Includes recovered payments

---

### 💰 Affiliate Payments (`/admin/affiliate-payments`)

**What You'll See:**

```
┌────────────────────────────────────────────────────────────────┐
│  Affiliate Commission Payments                                 │
├────────────────────────────────────────────────────────────────┤
│  Summary Statistics                                            │
│  ┌──────────────────┬──────────────┬──────────────┐          │
│  │ Total Payments: 2│ Paid: ₹5,000 │ Pending:     │          │
│  │                  │              │ ₹5,000       │          │
│  └──────────────────┴──────────────┴──────────────┘          │
├────────────────────────────────────────────────────────────────┤
│  Filters:  [All] [Pending] [Completed] [Failed]               │
├────────────────────────────────────────────────────────────────┤
│  Customer      Firm Name           Payment   Commission Status │
│  ────────────────────────────────────────────────────────────  │
│  Nikila Rajan  Nikila & Associates ₹59,000   ₹5,000  ⏳ Pending│
│  CUS002        Order: order_RS8Zzx1XfdUUTt                    │
│  Payment: pay_RS8b9ZoxGnEStg (RECOVERED)                      │
│  Created: Oct 10, 2025              [Mark as Paid]            │
│  ────────────────────────────────────────────────────────────  │
│  Amit Patel    A.P. & Partners      ₹59,000   ₹5,000  ✅ Paid │
│  CUS001        Order: order_TEST003                           │
│  Payment: pay_TEST003                                          │
│  Created: Sep 21, 2025   Paid: Oct 1, 2025                   │
└────────────────────────────────────────────────────────────────┘
```

**Features:**

- ✅ Shows all affiliate referral payments
- ✅ Displays firm names prominently
- ✅ Shows commission amounts
- ✅ Filter by payment status
- ✅ Search by customer/firm name
- ✅ "Mark as Paid" button for pending
- ✅ Shows recovered payments with note
- ✅ Displays complete payment IDs

---

## Step 3: Verify Recovered Payment

### Check Nikila's Payment (CUS002)

1. **Go to Affiliate Payments**

   ```
   http://localhost:3001/admin/affiliate-payments
   ```

2. **Look for:**
   - Customer: Nikila Rajan
   - Firm: Nikila & Associates
   - Order ID: order_RS8Zzx1XfdUUTt
   - Payment ID: pay_RS8b9ZoxGnEStg
   - Amount: ₹59,000
   - Commission: ₹5,000
   - Status: ⏳ Pending (Commission not paid yet)
   - Note: RECOVERED

3. **Verify in Affiliate Referrals**

   ```
   http://localhost:3001/admin/affiliate-referrals
   ```

4. **Look for:**
   - Under affiliate john@gmail.com
   - Customer CUS002
   - Name: Nikila Rajan
   - Status: ✅ Completed
   - Payment: ₹59,000

---

## Step 4: Test Admin Features

### Test 1: Search Functionality

**In Affiliate Payments page:**

1. Search for: "Nikila"
   - Should show Nikila's payment
2. Search for: "Associates"
   - Should show both payments with firm names containing "Associates"
3. Search for: "pay_RS8b"
   - Should show the recovered payment

### Test 2: Filter by Status

**In Affiliate Payments page:**

1. Click "Pending" filter
   - Should show only Nikila's payment (commission not paid)
2. Click "Completed" filter
   - Should show only Amit's payment (commission paid)
3. Click "All" filter
   - Should show both payments

### Test 3: Mark Commission as Paid

**In Affiliate Payments page:**

1. Find Nikila's payment (pending)
2. Click "Mark as Paid" button
3. Verify:
   - Status changes to ✅ Paid
   - "Paid on" date appears
   - Payment moves to "Completed" filter

### Test 4: View Referral Details

**In Affiliate Referrals page:**

1. Click on John's affiliate row (6C7D7684)
2. Should expand showing:
   - CUS001 - Amit Patel details
   - CUS002 - Nikila Rajan details
3. Both should show:
   - Firm names
   - Payment amounts
   - Status as Completed
   - Creation dates

---

## Database Verification Queries

Run these in Supabase SQL Editor to verify data:

### Query 1: All Test Payments

```sql
SELECT
  po.order_id,
  po.customer_name,
  po.firm_name,
  po.referral_code,
  po.is_affiliate_purchase,
  p.payment_id,
  p.amount,
  p.status
FROM payment_orders po
LEFT JOIN payments p ON p.order_id = po.order_id
WHERE po.customer_email LIKE '%test%'
   OR po.order_id = 'order_RS8Zzx1XfdUUTt'
ORDER BY po.created_at DESC;
```

### Query 2: Affiliate Commission Summary

```sql
SELECT
  ar.customer_id,
  ar.referred_name,
  ar.referred_email,
  arp.customer_firm_name,
  arp.payment_amount,
  arp.commission_amount,
  arp.commission_paid,
  arp.payment_status
FROM affiliate_referrals ar
JOIN affiliate_referral_payments arp ON arp.referral_id = ar.id
WHERE ar.referral_code = '6C7D7684'
ORDER BY ar.created_at DESC;
```

### Query 3: Complete Payment Tracking

```sql
SELECT
  po.order_id,
  po.firm_name,
  p.payment_id,
  s.plan,
  ar.status as referral_status,
  arp.commission_amount,
  arp.commission_paid
FROM payment_orders po
LEFT JOIN payments p ON p.order_id = po.order_id
LEFT JOIN subscriptions s ON s.user_id::text = (
  SELECT id::text FROM registration_forms WHERE email = po.customer_email
)
LEFT JOIN affiliate_referrals ar ON ar.order_id = po.order_id
LEFT JOIN affiliate_referral_payments arp ON arp.order_id = po.order_id
WHERE po.order_id IN ('order_TEST003', 'order_RS8Zzx1XfdUUTt')
ORDER BY po.created_at DESC;
```

---

## Expected Results Summary

After running test data, you should have:

✅ **4 Complete Payment Records**

- 2 Regular payments (no referral)
- 2 Affiliate payments (with referral code 6C7D7684)

✅ **4 Active Subscriptions**

- All with "launch_offer" plan
- All valid for 1 year

✅ **2 Completed Referrals**

- CUS001: Amit Patel
- CUS002: Nikila Rajan (RECOVERED)

✅ **2 Commission Records**

- CUS001: ₹5,000 - PAID
- CUS002: ₹5,000 - PENDING

✅ **Recovered Payment Visible**

- Order: order_RS8Zzx1XfdUUTt
- Payment: pay_RS8b9ZoxGnEStg
- Shows in all admin panels
- Properly tracked for commission

---

## Troubleshooting

### Issue: No data appears in admin panel

**Solution:**

1. Verify test data was inserted (check SQL editor output)
2. Refresh admin panel page
3. Check browser console for errors
4. Verify you're logged in as admin

### Issue: Affiliate referrals not showing

**Solution:**

1. Verify affiliate with code 6C7D7684 exists and is approved
2. Check that affiliate_id was found in test data script
3. Run verification queries to confirm data exists

### Issue: Commission status not updating

**Solution:**

1. Check network tab for API errors
2. Verify affiliate_referral_payments table exists
3. Check RLS policies allow admin access

---

## Next Steps

After verifying test data:

1. ✅ **Test Real Payment**
   - Make actual payment with referral code
   - Verify it appears immediately

2. ✅ **Test Commission Payout**
   - Mark commission as paid
   - Verify status updates

3. ✅ **Test Search & Filters**
   - Search by various terms
   - Filter by different statuses

4. ✅ **Export Reports**
   - Generate commission reports
   - Export customer lists

---

**All Set!** 🎉

Your payment system is now fully functional with:

- ✅ Complete payment tracking
- ✅ Firm name capture
- ✅ Subscription management
- ✅ Affiliate commission tracking
- ✅ Recovered missed payment
- ✅ Comprehensive admin dashboard

---

**Last Updated:** 2025-10-11
**Test Data Version:** 1.0
**Status:** Ready for production

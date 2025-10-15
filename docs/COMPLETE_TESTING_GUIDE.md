# Complete Testing Guide - Start Fresh

## 🎯 Purpose

Test the entire PowerCA workflow from scratch, including:

- Affiliate registration and approval
- Referral code generation
- Customer registration through referral
- Payment processing with Razorpay
- Commission tracking
- Admin panel verification

---

## ✅ Pre-Requisites

Before starting, ensure:

- [x] Migration 022 has been applied successfully
- [x] Development server is running on port 3001
- [x] You have admin credentials (superadmin / Admin@123)
- [x] Razorpay keys are configured in .env

---

## 📋 Testing Phases

### Phase 1: Insert Test Data (5 minutes)

**Step 1.1: Open Supabase SQL Editor**

```
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
```

**Step 1.2: Run Test Data Script**

```
1. Open file: D:\PowerCA_Website_V1\supabase\TEST_DATA_FINAL.sql
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click "RUN" button
```

**Step 1.3: Verify Success**
You should see output like:

```
✅ SUCCESS: Test affiliate created
✅ SUCCESS: User 1 created (Rajesh Kumar)
✅ SUCCESS: User 2 created (Priya Sharma)
✅ SUCCESS: User 3 created (Amit Patel - CUS001)
✅ SUCCESS: User 4 created (Nikila Rajan - CUS002)
✅ SUCCESS: Payment order 1 created
✅ SUCCESS: Payment order 2 created
✅ SUCCESS: Payment order 3 created
✅ SUCCESS: Payment order 4 created (RECOVERED)
✅ SUCCESS: Payment 1 recorded
✅ SUCCESS: Payment 2 recorded
✅ SUCCESS: Payment 3 recorded
✅ SUCCESS: Payment 4 recorded (pay_RS8b9ZoxGnEStg)
✅ SUCCESS: Subscription 1 created
✅ SUCCESS: Subscription 2 created
✅ SUCCESS: Subscription 3 created
✅ SUCCESS: Subscription 4 created
✅ SUCCESS: Affiliate referral 1 created (CUS001)
✅ SUCCESS: Affiliate referral 2 created (CUS002)
✅ SUCCESS: Commission record 1 created - PAID
✅ SUCCESS: Commission record 2 created - PENDING

==========================================
      TEST DATA INSERTED SUCCESSFULLY!
==========================================
```

---

### Phase 2: Verify Admin Panel (10 minutes)

**Step 2.1: Login to Admin**

```
URL: http://localhost:3001/admin-login
Username: superadmin
Password: Admin@123
```

**Step 2.2: Check Dashboard**

```
URL: http://localhost:3001/admin
Expected:
- Total Bookings: 5
- Pending: 2
- Total Registrations: 4
- Active: 4
```

**Step 2.3: Check All Affiliates**

```
URL: http://localhost:3001/admin/affiliates
Expected:
- Total: 1 Affiliate
- Name: John
- Email: john@gmail.com
- Company: John Co.
- Referral Code: 6C7D7684
- Status: Approved
- Referrals: 2
```

**Step 2.4: Check Approvals Page**

```
URL: http://localhost:3001/admin/affiliates/approve
Expected:
- Approved Affiliates: 1
- Should show ONLY John (approved)
- Should NOT show any pending/rejected
```

**Step 2.5: Check Affiliate Referrals**

```
URL: http://localhost:3001/admin/affiliate-referrals
Expected:
- Total Referrals: 2
- Pending: 0
- Completed: 2
- Active Affiliates: 1

Affiliate: john@gmail.com (John) - Code: 6C7D7684
- Total: 2
- Pending: 0
- Completed: 2

When expanded:
  Customer 1:
  - ID: CUS001
  - Name: Amit Patel
  - Email: test.customer3@gmail.com
  - Firm: A.P. & Partners
  - Status: ✅ Completed
  - Payment: ₹59,000
  - Created: Sep 21, 2025

  Customer 2:
  - ID: CUS002
  - Name: Nikila Rajan
  - Email: nikila.test@gmail.com
  - Firm: Nikila & Associates
  - Status: ✅ Completed
  - Payment: ₹59,000
  - Created: Oct 10, 2025
  - Note: (RECOVERED)
```

**Step 2.6: Check Affiliate Payments**

```
URL: http://localhost:3001/admin/affiliate-payments
Expected:
- Total Payments: 2
- Paid: ₹5,000
- Pending: ₹5,000

Payment 1 (Pending):
- Customer: Nikila Rajan
- Firm: Nikila & Associates
- Customer ID: CUS002
- Order: order_RS8Zzx1XfdUUTt
- Payment: pay_RS8b9ZoxGnEStg
- Amount: ₹59,000
- Commission: ₹5,000
- Status: ⏳ Pending
- Created: Oct 10, 2025
- [Mark as Paid] button visible

Payment 2 (Paid):
- Customer: Amit Patel
- Firm: A.P. & Partners
- Customer ID: CUS001
- Order: order_TEST003
- Payment: pay_TEST003
- Amount: ₹59,000
- Commission: ₹5,000
- Status: ✅ Paid
- Created: Sep 21, 2025
- Paid on: Oct 1, 2025
```

---

### Phase 3: Test Search & Filter Features (5 minutes)

**Test 3.1: Search in Affiliate Payments**

```
1. Go to: http://localhost:3001/admin/affiliate-payments
2. Search for: "Nikila"
   Expected: Shows only Nikila's payment
3. Search for: "Associates"
   Expected: Shows both payments (both have "Associates" in firm name)
4. Search for: "pay_RS8b"
   Expected: Shows Nikila's payment (recovered payment ID)
5. Search for: "CUS001"
   Expected: Shows Amit's payment
```

**Test 3.2: Filter in Affiliate Payments**

```
1. Click "Pending" filter
   Expected: Shows only Nikila's payment (commission not paid yet)
2. Click "Completed" filter
   Expected: Shows only Amit's payment (commission already paid)
3. Click "All" filter
   Expected: Shows both payments
```

**Test 3.3: Search in Affiliate Referrals**

```
1. Go to: http://localhost:3001/admin/affiliate-referrals
2. Search for: "Amit"
   Expected: Shows only John's section with Amit highlighted
3. Search for: "6C7D7684"
   Expected: Shows John's section (referral code match)
4. Search for: "A.P. & Partners"
   Expected: Shows section with Amit's firm
```

---

### Phase 4: Test Commission Payment (2 minutes)

**Test 4.1: Mark Commission as Paid**

```
1. Go to: http://localhost:3001/admin/affiliate-payments
2. Find Nikila's payment (Status: Pending)
3. Click "Mark as Paid" button
4. Verify:
   ✅ Status changes to "Paid"
   ✅ "Paid on" date appears
   ✅ Button disappears
   ✅ Payment moves to "Completed" filter
5. Check statistics:
   - Total Payments: 2
   - Paid: ₹10,000 (both commissions now paid)
   - Pending: ₹0
```

---

### Phase 5: Verify Recovered Payment (3 minutes)

**Test 5.1: Check Razorpay Payment is Tracked**

```
1. Go to: http://localhost:3001/admin/affiliate-payments
2. Search for: "pay_RS8b9ZoxGnEStg"
3. Verify payment exists with:
   ✅ Order ID: order_RS8Zzx1XfdUUTt
   ✅ Payment ID: pay_RS8b9ZoxGnEStg
   ✅ Customer: Nikila Rajan
   ✅ Firm: Nikila & Associates
   ✅ Amount: ₹59,000
   ✅ Referral Code: 6C7D7684
   ✅ Commission: ₹5,000
```

**Test 5.2: Verify in Database**

```sql
-- Run in Supabase SQL Editor
SELECT
  p.payment_id,
  po.order_id,
  po.firm_name,
  po.customer_name,
  p.amount,
  ar.customer_id,
  arp.commission_amount,
  arp.commission_paid
FROM payments p
JOIN payment_orders po ON p.order_id = po.order_id
LEFT JOIN affiliate_referrals ar ON ar.order_id = po.order_id
LEFT JOIN affiliate_referral_payments arp ON arp.payment_id = p.payment_id
WHERE p.payment_id = 'pay_RS8b9ZoxGnEStg';
```

Expected result:

```
payment_id: pay_RS8b9ZoxGnEStg
order_id: order_RS8Zzx1XfdUUTt
firm_name: Nikila & Associates
customer_name: Nikila Rajan
amount: 59000.00
customer_id: CUS002
commission_amount: 5000.00
commission_paid: false (changes to true after marking as paid)
```

---

### Phase 6: Test Live Payment Flow (Optional - 10 minutes)

**Test 6.1: Create New Affiliate (Optional)**

```
1. Go to: http://localhost:3001/affiliate-program/register
2. Fill in new affiliate details
3. Submit application
4. Login to admin and approve
5. Note the referral code
```

**Test 6.2: Customer Registration with Referral**

```
1. Open new incognito window
2. Go to: http://localhost:3001/register?ref=6C7D7684
3. Fill customer details
4. Complete registration
5. Go to checkout
6. Verify referral code is pre-filled
```

**Test 6.3: Make Test Payment**

```
1. Complete checkout form
2. Enter firm name (e.g., "Test Firm Pvt Ltd")
3. Click "Proceed to Payment"
4. Complete Razorpay test payment
5. Verify redirect to success page
```

**Test 6.4: Verify in Admin Panel**

```
1. Go to: http://localhost:3001/admin/affiliate-payments
2. Verify new payment appears
3. Check:
   ✅ Firm name is captured
   ✅ Customer ID is assigned
   ✅ Commission is calculated (10%)
   ✅ Referral code is tracked
   ✅ Order and payment IDs are linked
```

---

## 🔍 Database Verification Queries

Run these in Supabase SQL Editor to verify data integrity:

### Query 1: Complete Payment Overview

```sql
SELECT
  po.order_id,
  po.customer_name,
  po.firm_name,
  po.referral_code,
  po.customer_id,
  p.payment_id,
  p.amount,
  p.status as payment_status,
  s.plan,
  s.status as subscription_status,
  ar.status as referral_status,
  arp.commission_amount,
  arp.commission_paid
FROM payment_orders po
LEFT JOIN payments p ON p.order_id = po.order_id
LEFT JOIN registration_forms rf ON rf.email = po.customer_email
LEFT JOIN subscriptions s ON s.user_id = rf.id
LEFT JOIN affiliate_referrals ar ON ar.order_id = po.order_id
LEFT JOIN affiliate_referral_payments arp ON arp.order_id = po.order_id
WHERE po.customer_email LIKE '%test%'
   OR po.order_id = 'order_RS8Zzx1XfdUUTt'
ORDER BY po.created_at DESC;
```

### Query 2: Affiliate Statistics

```sql
SELECT
  a.full_name,
  a.email,
  a.referral_code,
  a.status,
  COUNT(ar.id) as total_referrals,
  SUM(CASE WHEN ar.status = 'completed' THEN 1 ELSE 0 END) as completed_referrals,
  SUM(CASE WHEN arp.commission_paid THEN arp.commission_amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN NOT arp.commission_paid THEN arp.commission_amount ELSE 0 END) as total_pending
FROM affiliate_registrations a
LEFT JOIN affiliate_referrals ar ON ar.referral_code = a.referral_code
LEFT JOIN affiliate_referral_payments arp ON arp.referral_id = ar.id
WHERE a.referral_code = '6C7D7684'
GROUP BY a.id, a.full_name, a.email, a.referral_code, a.status;
```

### Query 3: Commission Summary

```sql
SELECT
  COUNT(*) as total_commissions,
  SUM(commission_amount) as total_commission_amount,
  SUM(CASE WHEN commission_paid THEN commission_amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN NOT commission_paid THEN commission_amount ELSE 0 END) as pending_amount,
  COUNT(CASE WHEN commission_paid THEN 1 END) as paid_count,
  COUNT(CASE WHEN NOT commission_paid THEN 1 END) as pending_count
FROM affiliate_referral_payments
WHERE referral_code = '6C7D7684';
```

---

## ✅ Success Criteria

Your system is working correctly if:

- [x] All 4 test users are created
- [x] All 4 payment orders exist
- [x] All 4 payments are recorded (including pay_RS8b9ZoxGnEStg)
- [x] All 4 subscriptions are active
- [x] 2 affiliate referrals are tracked
- [x] 2 commission records exist (1 paid, 1 pending)
- [x] Admin panel shows correct counts
- [x] Search functionality works across all fields
- [x] Filter functionality works correctly
- [x] "Mark as Paid" updates commission status
- [x] Recovered payment (pay_RS8b9ZoxGnEStg) is visible
- [x] Firm names are captured and displayed
- [x] Customer IDs are properly assigned

---

## 🐛 Troubleshooting

### Issue: Test data script fails

**Solution:**

1. Check migration 022 was applied successfully
2. Verify all required tables exist
3. Check for existing conflicting data
4. Try running DIAGNOSE_DATABASE.sql first

### Issue: Admin panel shows no data

**Solution:**

1. Verify test data was inserted (check SQL output)
2. Clear browser cache and cookies
3. Re-login to admin panel
4. Check browser console for errors
5. Verify RLS policies allow admin access

### Issue: Search not working

**Solution:**

1. Check network tab for API errors
2. Verify search terms are correct
3. Refresh the page
4. Check API route logs

### Issue: Commission status not updating

**Solution:**

1. Check network tab when clicking "Mark as Paid"
2. Verify API endpoint is working
3. Check database permissions
4. Verify RLS policies

---

## 📊 Expected Data Summary

After running TEST_DATA_FINAL.sql:

**Users:**

- Rajesh Kumar (rajesh_kumar)
- Priya Sharma (priya_sharma)
- Amit Patel (amit_patel) - CUS001
- Nikila Rajan (nikila_rajan) - CUS002

**Payment Orders:**

1. order_TEST001 - R.K. & Associates - ₹59,000 (Regular)
2. order_TEST002 - Sharma Financial Consultants - ₹59,000 (Regular)
3. order_TEST003 - A.P. & Partners - ₹59,000 (Affiliate - CUS001)
4. order_RS8Zzx1XfdUUTt - Nikila & Associates - ₹59,000 (Affiliate - CUS002, RECOVERED)

**Payments:**

1. pay_TEST001 - ₹59,000 - Completed
2. pay_TEST002 - ₹59,000 - Completed
3. pay_TEST003 - ₹59,000 - Completed
4. pay_RS8b9ZoxGnEStg - ₹59,000 - Completed (RECOVERED)

**Subscriptions:**

- All 4 users have active "launch_offer" subscriptions
- Valid for 1 year from creation

**Affiliate Referrals:**

1. CUS001 - Amit Patel - Status: Completed - Commission: ₹5,000 (PAID)
2. CUS002 - Nikila Rajan - Status: Completed - Commission: ₹5,000 (PENDING)

**Affiliate:**

- Name: John
- Email: john@gmail.com
- Company: John Co.
- Referral Code: 6C7D7684
- Status: Approved
- Total Referrals: 2

---

## 🎯 Testing Checklist

Print this checklist and mark each item as you test:

### Basic Setup

- [ ] Migration 022 applied successfully
- [ ] Development server running on port 3001
- [ ] Admin credentials working (superadmin / Admin@123)
- [ ] TEST_DATA_FINAL.sql executed without errors

### Admin Panel - Navigation

- [ ] Dashboard accessible
- [ ] All Affiliates page accessible
- [ ] Approvals page accessible
- [ ] Affiliate Referrals page accessible
- [ ] Affiliate Payments page accessible

### Admin Panel - Data Display

- [ ] Dashboard shows correct counts
- [ ] All Affiliates shows 1 affiliate
- [ ] Approvals shows only approved affiliates
- [ ] Affiliate Referrals shows 2 referrals grouped by affiliate
- [ ] Affiliate Payments shows 2 commission records

### Admin Panel - Features

- [ ] Search works in Affiliate Payments
- [ ] Search works in Affiliate Referrals
- [ ] Filter by status works
- [ ] Expandable sections work
- [ ] "Mark as Paid" button works
- [ ] Commission status updates correctly

### Data Verification

- [ ] Recovered payment (pay_RS8b9ZoxGnEStg) is visible
- [ ] Firm names are displayed correctly
- [ ] Customer IDs are properly assigned
- [ ] Commission amounts are correct (10% of payment)
- [ ] Payment and order IDs are linked correctly

### Database Queries

- [ ] Complete Payment Overview query returns data
- [ ] Affiliate Statistics query returns correct counts
- [ ] Commission Summary query calculates totals correctly

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check network tab for failed API calls
3. Run DIAGNOSE_DATABASE.sql to verify table structure
4. Check database logs in Supabase dashboard
5. Verify RLS policies allow admin access

---

**Last Updated:** 2025-10-11
**Version:** 1.0
**Status:** Ready for Testing

---

## 🚀 Quick Start Commands

```bash
# Start development server
npm run dev

# Open admin panel
http://localhost:3001/admin-login

# Open Supabase SQL Editor
https://supabase.com/dashboard -> SQL Editor

# Run test data
Copy TEST_DATA_FINAL.sql -> Paste in SQL Editor -> RUN
```

---

**Happy Testing!** 🎉

Your payment system is now complete with:
✅ Full payment tracking
✅ Firm name capture
✅ Subscription management
✅ Affiliate commission tracking
✅ Recovered missed payment
✅ Comprehensive admin dashboard

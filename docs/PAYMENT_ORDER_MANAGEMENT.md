# Payment Order Management System

## Overview

This document explains the improved payment order management system that prevents database pollution from abandoned payment orders.

## Problem Statement

**Previous Issue:**

- When users clicked "Place Order", an order was created in the database with status `'created'`
- If users closed the payment popup without completing payment, the order remained in the database forever
- This caused:
  - Database pollution with incomplete orders
  - Inflated analytics and order counts
  - No way to distinguish between "user didn't try" vs "user tried but abandoned"

## Solution: 3-Layer Protection System

### Layer 1: Proper Status Tracking

**Order Status Flow:**

```
created → attempted → paid
         ↓
      expired (after 30 minutes)
```

**Status Definitions:**

- `created`: Order created in backend, payment popup not opened yet
- `attempted`: User opened payment popup (showing payment intent)
- `paid`: Payment completed and verified successfully
- `expired`: Order expired after 30 minutes without payment
- `failed`: Payment attempt failed

### Layer 2: Order Expiration

**Automatic Expiration:**

- All orders have an `expires_at` timestamp (30 minutes from creation)
- Orders are automatically marked as `expired` if not paid within 30 minutes
- Cleanup API can be called to bulk-expire old orders

**Benefits:**

- Clean database with only relevant orders
- Easy to identify abandoned orders
- Better analytics and reporting

### Layer 3: Webhook Safety Net

**Already Implemented:**

- Razorpay webhook captures payments even if user closes browser
- Updates order status to `paid` automatically
- Generates invoice and sends confirmation email

---

## Implementation Details

### 1. Database Migration

**File:** `supabase/migrations/999_add_payment_order_expiration.sql`

**Changes:**

- Added `expires_at` column to `payment_orders` table
- Updated status constraint to include `'expired'` and `'failed'`
- Created `expire_old_payment_orders()` function for bulk cleanup
- Added indexes for efficient queries

**Run Migration:**

```bash
# Apply migration to Supabase
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/999_add_payment_order_expiration.sql
```

### 2. API Endpoints

#### Create Order API

**Updated Files:**

- `src/app/api/payment/create-order/route.ts` (Razorpay)
- `src/app/api/payment/cashfree/create-order/route.ts` (Cashfree)

**Changes:**

- Sets `expires_at` to 30 minutes from now when creating order
- Order starts with status `'created'`

#### Mark Attempted API

**New File:** `src/app/api/payment/mark-attempted/route.ts`

**Purpose:**

- Called when payment popup opens
- Updates order status from `'created'` to `'attempted'`
- Validates order ownership and expiration

**Usage:**

```javascript
await fetch('/api/payment/mark-attempted', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: 'order_xyz' }),
})
```

#### Cleanup Expired Orders API

**New File:** `src/app/api/payment/cleanup-expired/route.ts`

**Purpose:**

- Marks all expired orders (past `expires_at` time) as `'expired'`
- Protected by API key for security
- Returns stats about expired orders

**Manual Trigger:**

```bash
# Via curl (POST)
curl -X POST https://powerca.in/api/payment/cleanup-expired \
  -H "Authorization: Bearer YOUR_API_KEY"

# Via browser (GET)
https://powerca.in/api/payment/cleanup-expired?key=YOUR_API_KEY
```

**Automated Trigger (Recommended):**
Set up a cron job to run cleanup every hour:

```bash
# Add to crontab
0 * * * * curl -X POST https://powerca.in/api/payment/cleanup-expired -H "Authorization: Bearer YOUR_API_KEY"
```

Or use Vercel Cron Jobs:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/payment/cleanup-expired",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 3. Frontend Updates

**File:** `src/app/checkout/page.tsx`

**Changes:**

- Calls `/api/payment/mark-attempted` before opening Razorpay popup
- Calls `/api/payment/mark-attempted` before opening Cashfree payment
- Non-blocking calls (failures don't stop payment flow)

---

## Database Schema

### payment_orders Table

```sql
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',  -- created, attempted, paid, expired, failed
  expires_at TIMESTAMP WITH TIME ZONE,  -- 30 minutes from creation
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  company TEXT,
  gst_number TEXT,
  product_id TEXT,
  user_id UUID,
  referral_code TEXT,
  customer_id TEXT,
  is_affiliate_purchase BOOLEAN,
  customer_address TEXT,
  customer_city TEXT,
  customer_state TEXT,
  customer_postcode TEXT,
  customer_country TEXT,
  customer_gst_no TEXT,
  firm_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_expires_at ON payment_orders(expires_at);
CREATE INDEX idx_payment_orders_status_created_at ON payment_orders(status, created_at);
```

---

## Analytics Queries

### Active Orders (Not Expired)

```sql
SELECT COUNT(*) FROM payment_orders
WHERE status NOT IN ('expired', 'paid', 'failed');
```

### Conversion Rate

```sql
SELECT
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
  COUNT(CASE WHEN status = 'attempted' THEN 1 END) as attempted_orders,
  COUNT(CASE WHEN status = 'created' THEN 1 END) as created_orders,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_orders,
  ROUND(
    COUNT(CASE WHEN status = 'paid' THEN 1 END)::NUMERIC /
    NULLIF(COUNT(CASE WHEN status = 'attempted' THEN 1 END), 0) * 100,
    2
  ) as conversion_rate_pct
FROM payment_orders
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Orders by Status (Last 7 Days)

```sql
SELECT
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM payment_orders
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY status
ORDER BY count DESC;
```

### Expired Orders in Last 24 Hours

```sql
SELECT
  order_id,
  customer_email,
  amount,
  created_at,
  expires_at,
  EXTRACT(EPOCH FROM (expires_at - created_at))/60 as lifetime_minutes
FROM payment_orders
WHERE status = 'expired'
  AND updated_at >= NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;
```

---

## Monitoring & Alerts

### Recommended Metrics

1. **High Abandonment Rate Alert**
   - If `attempted` orders exceed `paid` orders by >50%
   - May indicate payment gateway issues

2. **Expired Order Volume**
   - Track daily count of expired orders
   - Helps understand user behavior

3. **Cleanup Job Success**
   - Monitor cleanup API responses
   - Alert if cleanup fails

### Sample Monitoring Script

```typescript
// Check abandonment rate
const stats = await fetch('/api/admin/payment-stats').then((r) => r.json())

if (stats.attempted > stats.paid * 1.5) {
  sendAlert('High payment abandonment rate detected')
}
```

---

## Maintenance

### Daily Tasks

- Run cleanup API (automated via cron)
- Review expired order count

### Weekly Tasks

- Analyze conversion rates
- Review payment gateway errors
- Check for unusual abandonment patterns

### Monthly Tasks

- Archive old expired orders (optional)
- Review order expiration time (adjust if needed)
- Update analytics dashboard

---

## Testing Checklist

- [ ] Create order → Check `expires_at` is set
- [ ] Open payment popup → Verify status changes to `'attempted'`
- [ ] Complete payment → Verify status changes to `'paid'`
- [ ] Close popup → Verify order remains `'attempted'`
- [ ] Wait 30+ minutes → Run cleanup → Verify status changes to `'expired'`
- [ ] Check analytics → Verify correct counts
- [ ] Test with both Razorpay and Cashfree

---

## Security Considerations

1. **API Key Protection**
   - Cleanup API requires authorization header
   - Use strong API key from environment variables

2. **User Validation**
   - Mark-attempted API validates user ownership
   - Prevents unauthorized status updates

3. **Webhook Verification**
   - Payment webhook verifies Razorpay signature
   - Prevents fraudulent payment confirmations

---

## Troubleshooting

### Issue: Orders not expiring automatically

**Solution:** Run cleanup API manually or set up cron job

```bash
curl -X POST https://powerca.in/api/payment/cleanup-expired \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Issue: Status stuck at 'created'

**Possible Causes:**

- Mark-attempted API call failed
- User didn't open payment popup
- Network issue

**Solution:** Check browser console for errors

### Issue: Analytics showing incorrect numbers

**Solution:** Exclude expired orders from counts

```sql
SELECT COUNT(*) FROM payment_orders
WHERE status = 'paid'  -- Only count successful payments
```

---

## Migration Checklist

- [x] Create migration file
- [x] Update create-order APIs
- [x] Create mark-attempted API
- [x] Create cleanup API
- [x] Update checkout page
- [ ] Run database migration
- [ ] Test complete flow
- [ ] Set up cron job
- [ ] Update monitoring dashboard
- [ ] Document for team

---

## Contact & Support

For issues or questions about payment order management:

- Check logs: `src/lib/logger.ts`
- Review migration: `supabase/migrations/999_add_payment_order_expiration.sql`
- API documentation: This file

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0

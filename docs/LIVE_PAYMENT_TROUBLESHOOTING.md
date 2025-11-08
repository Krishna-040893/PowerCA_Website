# Razorpay LIVE Payment Troubleshooting

## Issue: Payment Failing in Live Mode

**Error**: "Payment Failed: Business failures/Others"
**Current Amount**: ₹1.18
**Current Keys**: LIVE MODE (`rzp_live_R7BVfJIuxEOHWO`)

---

## Why ₹1.18 is Failing in Live Mode

### Problem 1: Amount Too Low

- Most banks reject transactions below ₹10-100 in live mode
- Razorpay recommends minimum ₹100 for live testing
- Very small amounts are flagged as suspicious/test transactions

### Problem 2: Possible Account Issues

1. KYC might be under review
2. Account not fully activated
3. Payment method restrictions
4. Bank/card issuer blocking small amounts

---

## Solution: Use Realistic Amount for Live Testing

### Step 1: Increase Test Amount to ₹100

Update the checkout page to use ₹100 minimum:

**File**: `src/app/checkout/page.tsx`
**Line**: 64

```typescript
// Change from:
const basePrice = 1 // ₹1 - FOR TESTING ONLY

// To:
const basePrice = 100 // ₹100 - Minimum for live testing
```

This will make the total: ₹100 + GST (18%) = **₹118**

### Step 2: Verify Your Razorpay Account Status

**Check Account Activation:**

1. Login to https://dashboard.razorpay.com/
2. Ensure you're in **LIVE MODE** (toggle at top)
3. Check for banner messages about KYC or activation
4. Go to **Account & Settings** → **Business Details**
5. Verify all sections show "Completed" or "Verified"

**Required Checklist:**

- ✅ Email verified
- ✅ Mobile verified
- ✅ PAN card uploaded
- ✅ Bank account verified
- ✅ Business details completed
- ✅ GST details (if applicable)
- ✅ Address proof uploaded

### Step 3: Check Payment Methods Enabled

1. Go to **Settings** → **Configuration** → **Payment Methods**
2. Ensure these are enabled:
   - ✅ Cards (Visa, Mastercard, RuPay, Amex)
   - ✅ UPI
   - ✅ Net Banking
   - ✅ Wallets

### Step 4: Check Settlement Status

1. Go to **Settings** → **Account & Settings**
2. Check **Settlement Status**: Should be "Active"
3. If "On Hold" or "Under Review", contact Razorpay support

---

## Testing Live Payments Safely

### Recommended Approach

1. **Start with ₹100**: Minimum safe amount
2. **Use Your Own Card**: Test with your personal debit/credit card
3. **Verify Immediate Refund**: Set up refund process
4. **Check Bank Statement**: Verify amount debited and refunded

### Test Flow

```
1. Update basePrice to 100
2. Restart dev server
3. Complete checkout form
4. Use real debit/credit card
5. Complete payment (₹118 will be debited)
6. Check payment success page
7. Verify in Razorpay dashboard
8. Refund the test payment immediately
```

---

## Quick Fix Implementation

### Update Checkout Page

```bash
# Open file
D:\PowerCA_Website_V1\src\app\checkout\page.tsx
```

**Change Line 64:**

```typescript
const basePrice = 100 // Changed from 1 to 100 for live testing
```

This gives you:

- Base: ₹100
- GST (18%): ₹18
- **Total**: ₹118

### Restart Server

After making the change:

```bash
# Stop server (Ctrl+C)
# Restart
npm run dev
```

---

## Immediate Refund After Test

Once payment succeeds, refund immediately:

### Option 1: Dashboard Refund

1. Go to Razorpay Dashboard → **Transactions** → **Payments**
2. Find your test payment
3. Click **Refund**
4. Select "Full Refund"
5. Add reason: "Test transaction"
6. Confirm refund

### Option 2: API Refund (Programmatic)

Create a refund endpoint (optional for testing):

```typescript
// src/app/api/payment/refund/route.ts
import Razorpay from 'razorpay'

export async function POST(req: Request) {
  const { paymentId } = await req.json()

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const refund = await razorpay.payments.refund(paymentId, {
    amount: 11800, // Amount in paise (₹118)
    speed: 'normal',
    notes: {
      reason: 'Test transaction refund',
    },
  })

  return Response.json({ success: true, refund })
}
```

---

## Alternative: Two-Stage Testing

### Stage 1: Test Mode (Free)

- Use test keys: `rzp_test_*`
- Test all flows without real money
- Verify integration works

### Stage 2: Live Mode (Paid)

- Switch to live keys: `rzp_live_*`
- Use ₹100 minimum
- Test with real card
- Verify actual debit/credit
- Refund immediately

---

## Common Live Mode Issues & Fixes

| Issue                           | Reason                   | Fix                           |
| ------------------------------- | ------------------------ | ----------------------------- |
| Payment fails with small amount | Banks reject < ₹100      | Use ₹100 minimum              |
| "KYC pending" error             | Account not activated    | Complete KYC on dashboard     |
| "Account on hold"               | Under review             | Contact Razorpay support      |
| Card declined                   | Bank security            | Try different card or bank    |
| "Merchant not activated"        | Account setup incomplete | Complete all account sections |

---

## Verify Payment Success

After completing payment, check:

### 1. Frontend

- Redirects to success page
- Shows order ID and invoice number
- Email sent to customer

### 2. Database

```sql
-- Check payment record
SELECT * FROM payments
WHERE payment_id = 'pay_XXXXX'
ORDER BY created_at DESC
LIMIT 1;

-- Check affiliate commission (if applicable)
SELECT * FROM affiliate_referral_payments
WHERE payment_id = 'pay_XXXXX';
```

### 3. Razorpay Dashboard

- Go to **Transactions** → **Payments**
- Verify payment shows "captured"
- Check amount matches (₹118)
- Verify customer details

---

## Production Considerations

Before going live with real customers:

1. **Update to Actual Price**

   ```typescript
   const basePrice = 18644.07 // PowerCA Implementation price
   ```

2. **Enable Webhooks**
   - Dashboard → **Settings** → **Webhooks**
   - Add endpoint: `https://yourdomain.com/api/payment/webhook`
   - Enable events: `payment.captured`, `payment.failed`

3. **Set Up Monitoring**
   - Track failed payments
   - Monitor refund requests
   - Set up alerts for issues

4. **Test Refund Flow**
   - Verify refunds work correctly
   - Check refund timing (5-7 days)
   - Test partial refunds

---

## Contact Razorpay Support

If issues persist after these fixes:

1. **Dashboard Support**
   - https://dashboard.razorpay.com/app/support
   - Create ticket with:
     - Payment ID
     - Error message
     - Screenshot of error

2. **Email Support**
   - support@razorpay.com
   - Include: Account ID, Transaction details

3. **Phone Support**
   - Check dashboard for phone number
   - Available 24/7 for LIVE mode issues

---

## Summary: Quick Steps to Fix

1. ✅ Update `basePrice` from 1 to 100 in checkout page
2. ✅ Restart server
3. ✅ Verify Razorpay account is fully activated (check dashboard)
4. ✅ Test with real card (₹118 will be debited)
5. ✅ Verify success in dashboard
6. ✅ Refund immediately
7. ✅ Once working, update to actual price (₹18,644.07)

---

_This ensures you can test live payments with minimal cost (₹100) while verifying real money flow._

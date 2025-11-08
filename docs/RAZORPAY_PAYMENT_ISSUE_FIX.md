# Razorpay Payment Failure Fix

## Issue

**Error**: "Payment Failed: Business failures/Others" when trying to complete payment via Razorpay

## Root Cause Analysis

### Current Configuration

- **Mode**: LIVE MODE (`rzp_live_R7BVfJIuxEOHWO`)
- **Test Amount**: ₹1.18
- **Account Status**: Live account may not be fully activated

### Why It's Failing

Razorpay "Business failures/Others" error occurs when:

1. **Live Account Not Activated**: KYC documents pending approval
2. **Testing with Live Keys**: Using live keys for small test amounts
3. **Account Restrictions**: Live account in restricted/review mode
4. **Minimum Amount**: Some banks reject very small amounts (₹1-2)

## Solutions

### Solution 1: Use TEST Mode (Recommended for Development)

#### Step 1: Get Test Keys from Razorpay Dashboard

1. Login to https://dashboard.razorpay.com/
2. Switch to **TEST MODE** (toggle at top)
3. Go to **Settings** → **API Keys**
4. **Generate Test Keys** if not already generated
5. Copy:
   - **Key ID**: `rzp_test_XXXXXXXXXXXXX`
   - **Key Secret**: `YYYYYYYYYYYYYYY`

#### Step 2: Update `.env.local`

Replace your LIVE keys with TEST keys:

```env
# Replace these LIVE keys
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_test_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX

# Keep these the same
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

#### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

#### Step 4: Test Payment

1. Go to checkout page
2. Use Razorpay test cards:
   - **Successful Payment**: `4111 1111 1111 1111`
   - **CVV**: Any 3 digits (e.g., 123)
   - **Expiry**: Any future date
   - **OTP**: 123456 (for UPI test mode)

#### Test Mode Features

✅ No real money charged
✅ Works with test cards
✅ No KYC required
✅ Can test all payment flows
✅ No amount restrictions

---

### Solution 2: Activate LIVE Account (For Production)

If you want to use LIVE mode, complete these steps:

#### Step 1: Complete KYC on Razorpay Dashboard

1. Go to https://dashboard.razorpay.com/
2. Click on **Account & Settings**
3. Complete **KYC Verification**:
   - Upload PAN card
   - Upload business documents (GST certificate, incorporation docs)
   - Bank account verification
   - Address proof

#### Step 2: Wait for Approval

- Review time: 24-48 hours
- You'll receive email notification once approved

#### Step 3: Increase Test Amount

While testing in LIVE mode, use realistic amounts:

- Minimum: ₹100 (recommended ₹500+ for testing)
- Update `checkout/page.tsx`:

```typescript
// Line 64 in checkout/page.tsx
const basePrice = 100 // Use ₹100 minimum for live testing
```

#### Step 4: Enable Payment Methods

1. In Razorpay Dashboard → **Settings** → **Payment Methods**
2. Enable required payment methods:
   - Cards (Visa, Mastercard, RuPay)
   - UPI
   - Net Banking
   - Wallets

---

## Quick Fix for Immediate Testing

### Update Environment Variables

1. Open `.env.local`
2. Replace LIVE keys with TEST keys
3. Save file
4. Restart server

### Example `.env.local` Configuration

```env
# RAZORPAY - TEST MODE (For Development)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=test_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# When ready for production, switch to LIVE keys:
# RAZORPAY_KEY_ID=rzp_live_R7BVfJIuxEOHWO
# RAZORPAY_KEY_SECRET=j3JXJNuF4kMhfqjB8bP13Dyw
```

---

## Verification

After applying the fix, verify:

1. **Check Mode in Console**:

   ```
   🔑 Razorpay Key Mode: TEST MODE
   🔑 Key ID: rzp_test_XXX...
   ```

2. **Test Payment Flow**:
   - Fill checkout form
   - Click "Place Order"
   - Razorpay checkout should open
   - Use test card: `4111 1111 1111 1111`
   - Payment should succeed

3. **Check Payment Verification**:
   - Should redirect to success page
   - Check database for payment record
   - Verify affiliate commission tracking (if applicable)

---

## Testing Different Scenarios

### Test Mode Card Numbers

| Card Number         | Purpose              |
| ------------------- | -------------------- |
| 4111 1111 1111 1111 | Success              |
| 4012 0010 3714 0010 | Success (Visa)       |
| 5555 5555 5555 4444 | Success (Mastercard) |
| 4000 0000 0000 0002 | Card declined        |
| 4000 0000 0000 0069 | Card expired         |
| 4000 0000 0000 0119 | Insufficient funds   |

### Test UPI

- **UPI ID**: `success@razorpay`
- **OTP**: `123456`

---

## Production Checklist

Before going live:

- [ ] Complete Razorpay KYC
- [ ] Account activated and verified
- [ ] Switch to LIVE keys
- [ ] Update amount from ₹1 to actual price (₹22,000)
- [ ] Test with real bank account (small amount)
- [ ] Enable all required payment methods
- [ ] Configure webhooks for payment notifications
- [ ] Test refund flow
- [ ] Set up monitoring and alerts

---

## Common Razorpay Errors

| Error                    | Reason                     | Solution                                |
| ------------------------ | -------------------------- | --------------------------------------- |
| Business failures/Others | Live account not activated | Use TEST mode or complete KYC           |
| Invalid API Key          | Wrong key or key expired   | Check dashboard for correct keys        |
| Payment amount invalid   | Amount too low/high        | Use ₹100+ for live, any amount for test |
| Card declined            | Bank rejection             | Try different card or use test cards    |
| 3D Secure failed         | Authentication failure     | Enable 3D Secure in dashboard           |

---

## Support Resources

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Test Mode Guide**: https://razorpay.com/docs/payments/test-mode/
- **Support**: https://dashboard.razorpay.com/app/support

---

## Current Status

**Environment**: `.env.local`

```
RAZORPAY_KEY_ID=rzp_live_R7BVfJIuxEOHWO (LIVE MODE)
```

**Recommendation**: Switch to TEST MODE immediately for development and testing.

---

_Document Last Updated: October 14, 2025_

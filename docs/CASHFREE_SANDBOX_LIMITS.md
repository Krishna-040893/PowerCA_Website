# Cashfree Sandbox Payment Limit Issue

## Problem

When attempting to process payments via Cashfree payment gateway, you encounter the error:

```
"order amount cannot be greater than the max order amount set with Cashfree"
```

## Root Cause

Your Cashfree App ID starts with **"TEST"** which means you're using the **Cashfree Sandbox (Test) environment**. Sandbox accounts have strict transaction limits for testing purposes:

- **Maximum transaction amount**: Typically ₹5,000 to ₹10,000
- **Your product price**: ₹59,000 (₹50,000 + 18% GST)
- **Result**: Transaction amount exceeds sandbox limit

## Console Error Explained

The console error you see:

```
Refused to get unsafe header "x-rtb-fingerprint-id"
```

This is a **browser security warning** and is not the cause of the failure. This happens because Cashfree's SDK tries to read certain headers that browsers block for security reasons. This is normal and can be ignored.

## Solutions

### Option 1: Use Razorpay (Recommended for Now)

Razorpay is working correctly and supports your transaction amount. Use Razorpay for actual payments until Cashfree Production is configured.

### Option 2: Switch to Cashfree Production

To use Cashfree for real payments, you need Production credentials:

1. **Get Production Credentials from Cashfree**:
   - Login to [Cashfree Dashboard](https://merchant.cashfree.com/)
   - Navigate to: Developers → API Keys
   - Generate Production API keys

2. **Update Environment Variables** in `.env.local`:

   ```env
   # Replace TEST credentials with Production credentials
   NEXT_PUBLIC_CASHFREE_APP_ID=<your_production_app_id>  # Does NOT start with TEST
   CASHFREE_SECRET_KEY=<your_production_secret_key>
   ```

3. **Important Production Setup**:
   - Verify your business details with Cashfree
   - Complete KYC requirements
   - Configure webhook URLs in Cashfree dashboard
   - Test with small amounts first

### Option 3: Lower Test Amount (For Development Only)

If you want to test Cashfree integration with sandbox:

1. Temporarily change the product price to ₹5,000 or less in `src/config/features.ts`
2. Test the Cashfree flow
3. Restore original pricing before going to production

**Note**: This is only for testing integration, not for actual sales.

## Code Changes Made

### 1. Better Error Handling in API Route

File: `src/app/api/payment/cashfree/create-order/route.ts`

- Added detection for amount limit errors
- Provides user-friendly error messages
- Shows environment (sandbox vs production)
- Suggests solutions

### 2. Improved Error Display in Checkout

File: `src/app/checkout/page.tsx`

- Shows clear error message when amount limit is exceeded
- Suggests using Razorpay as alternative
- Provides actionable guidance to users

## Testing Checklist

After switching to Production credentials:

- [ ] Verify Cashfree dashboard shows "Production" mode
- [ ] Test with small amount (₹100) first
- [ ] Confirm webhook is receiving payment updates
- [ ] Check payment status in database
- [ ] Verify email notifications are sent
- [ ] Test complete purchase flow end-to-end

## Environment Detection

The system automatically detects the environment based on App ID:

- App ID starts with **"TEST"** → Sandbox mode
- App ID is numeric → Production mode

Current configuration: **Sandbox** (TEST credentials)

## Related Files

- `/src/app/api/payment/cashfree/create-order/route.ts` - Order creation
- `/src/app/checkout/page.tsx` - Checkout page
- `/docs/CASHFREE_FIX.md` - General Cashfree integration guide
- `/docs/CASHFREE_PRODUCTION_CHECKLIST.md` - Production deployment checklist

## Support

If you need help:

1. Check Cashfree dashboard for account limits
2. Contact Cashfree support for limit increases
3. Use Razorpay for immediate payment processing
4. Verify all environment variables are correctly set

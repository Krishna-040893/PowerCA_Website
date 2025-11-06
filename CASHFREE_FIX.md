# Cashfree Authentication Error - Diagnosis & Fix

## Issue Summary

"authentication Failed" error occurs on production site when using Cashfree payment gateway, but Razorpay works fine.

## Root Cause Analysis

After thorough investigation, I've identified the issue is **NOT** with your credentials (they're valid), but likely with how Vercel environment variables are configured.

### What We Confirmed ✅

1. **Credentials are valid**: Your production credentials work correctly:
   - App ID: `11132785a98ff499e959b1945938723111` ✅
   - Secret Key: `cfsk_ma_prod_fbe28e7df86df86e1f76b992d08e1b51_50aacfb0` ✅
   - API authentication test: **PASSED** ✅

2. **Code is correct**: The implementation properly detects environment and initializes SDK

3. **Environment detection works**: Production App IDs are correctly identified (no longer using the flawed `includes('prod')` check)

### Most Likely Issue ⚠️

**The `NEXT_PUBLIC_CASHFREE_APP_ID` environment variable is NOT available on the frontend in production.**

This happens when:

- The env variable is set in Vercel but not marked for the correct environment (Production/Preview/Development)
- The variable was set after the last deployment (requires redeployment)
- There's a typo in the variable name in Vercel dashboard

## How to Fix

### Step 1: Verify Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/)
2. Select your PowerCA project
3. Go to **Settings** → **Environment Variables**
4. Check that these variables exist with **EXACTLY** these names:

   ```
   NEXT_PUBLIC_CASHFREE_APP_ID
   CASHFREE_SECRET_KEY
   ```

5. **CRITICAL**: Ensure `NEXT_PUBLIC_CASHFREE_APP_ID` is checked for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

   The `NEXT_PUBLIC_` prefix means it needs to be available on the client-side.

### Step 2: Set the Correct Values

#### For Production Environment:

```bash
NEXT_PUBLIC_CASHFREE_APP_ID=11132785a98ff499e959b1945938723111
CASHFREE_SECRET_KEY=cfsk_ma_prod_fbe28e7df86df86e1f76b992d08e1b51_50aacfb0
```

#### For Development/Preview (Optional - use test credentials):

```bash
NEXT_PUBLIC_CASHFREE_APP_ID=TEST1085715981941fed0665ce30214e95175801
CASHFREE_SECRET_KEY=cfsk_ma_test_7fcf9ddc889611c28d14e2ad8216b36a_85ff98a7
```

### Step 3: Redeploy

After updating environment variables:

**Option A - Trigger Redeploy in Vercel:**

1. Go to **Deployments** tab
2. Click the `•••` menu on the latest deployment
3. Click **Redeploy**
4. Make sure "Use existing Build Cache" is **UNCHECKED**

**Option B - Push a New Commit:**

```bash
git commit --allow-empty -m "Trigger rebuild after env var update"
git push
```

### Step 4: Verify in Production

After deployment, test the configuration:

1. **Open your production site**: `https://your-domain.com/api/test/cashfree-config`
2. **Check the response**:
   - `hasAppId: true` ✅
   - `hasSecretKey: true` ✅
   - `appIdFormat: "Production credentials"` ✅
   - `apiTest.status: "✅ API authentication successful"` ✅

3. **If any field shows `false` or `Missing`**, the environment variable is not set correctly in Vercel.

## Testing Endpoints Created

I've created two test endpoints to help you debug:

### 1. Configuration Test

**URL**: `/api/test/cashfree-config`
**Method**: GET
**Purpose**: Verifies environment variables are set and credentials are valid

**Example**:

```bash
curl https://your-domain.com/api/test/cashfree-config
```

### 2. Order Creation Test

**URL**: `/api/test/cashfree-order`
**Method**: POST
**Purpose**: Tests actual order creation flow

**Example**:

```bash
curl -X POST https://your-domain.com/api/test/cashfree-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 1}'
```

## Code Changes Made

### 1. Fixed Environment Detection

**File**: `src/app/api/payment/cashfree/create-order/route.ts`

**Old Code** (line 30):

```typescript
const environment = appId.includes('prod') ? 'production' : 'sandbox'
```

**New Code** (line 31):

```typescript
const environment = appId.toUpperCase().startsWith('TEST') ? 'sandbox' : 'production'
```

**Why**: Cashfree TEST credentials start with "TEST", production credentials are numeric.

### 2. Enhanced Frontend Error Handling

**File**: `src/app/checkout/page.tsx`

- Added console logs for debugging (lines 403-404, 416)
- Better error messages for authentication failures (lines 425-426)
- Explicit environment mode handling (line 407)

### 3. Added Debug Logging

**File**: `src/app/api/payment/cashfree/create-order/route.ts`

Added environment detection logging (lines 37-41):

```typescript
console.log('🔧 Cashfree Environment Detection:', {
  appId: appId.substring(0, 10) + '...',
  detectedEnvironment: environment,
  baseUrl,
})
```

**Note**: These logs won't appear in production due to `next.config.ts` removing console.logs. Check Vercel Function Logs instead.

## Common Issues & Solutions

### Issue 1: "authentication Failed" Error

**Solution**: Environment variable `NEXT_PUBLIC_CASHFREE_APP_ID` is not set or not exposed to client-side
**Fix**: Follow Step 1-3 above

### Issue 2: Environment Mismatch

**Symptom**: Backend detects "production" but frontend expects "sandbox"
**Solution**: Ensure App ID and Secret Key are from the same environment (both TEST or both PROD)

### Issue 3: Variables Not Updating

**Symptom**: Changed env vars in Vercel but still seeing old values
**Solution**: Clear build cache when redeploying

### Issue 4: Works Locally but Not in Production

**Symptom**: Cashfree works with `npm run dev` but fails on Vercel
**Solution**: This confirms it's an environment variable issue. Double-check Vercel settings.

## Vercel Function Logs

To see backend logs in production:

1. Go to your Vercel project
2. Click on a deployment
3. Click **Functions** tab
4. Find the failing function (e.g., `/api/payment/cashfree/create-order`)
5. View logs to see the console.log output showing detected environment

## Security Notes

✅ **Safe to commit**:

- Test/Sandbox credentials (they're meant for testing)
- The test endpoints (they only work with your credentials)

❌ **NEVER commit**:

- Production credentials in `.env` files
- Production credentials in code
- Keep production credentials **only** in Vercel environment variables

## Next Steps

1. ✅ Update Vercel environment variables (see Step 1-2)
2. ✅ Redeploy (see Step 3)
3. ✅ Test using `/api/test/cashfree-config` endpoint
4. ✅ Test actual payment flow on production
5. ✅ Monitor Vercel Function Logs for any errors

## Support

If the issue persists after following these steps:

1. Check Vercel Function Logs for the exact error
2. Verify credentials in [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchants/credentials)
3. Ensure your Cashfree account is activated for production
4. Contact Cashfree support if credentials are rejected

## Files Modified

- ✅ `src/app/api/payment/cashfree/create-order/route.ts` - Fixed environment detection
- ✅ `src/app/checkout/page.tsx` - Enhanced error handling and logging
- ✅ `src/app/api/test/cashfree-config/route.ts` - New test endpoint
- ✅ `src/app/api/test/cashfree-order/route.ts` - New order test endpoint

---

**Created**: $(date)
**Status**: Ready for deployment and testing

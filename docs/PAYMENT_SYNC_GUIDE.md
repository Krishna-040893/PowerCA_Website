# Payment Sync & Recovery Guide

## Problem: Payments in Razorpay but not in Database

If a payment is successful in Razorpay dashboard but **not showing** in your admin panel, it's because:

1. **User closed browser** after payment (before verification handler executed)
2. **Network error** during payment verification
3. **Page crashed** after payment completion

## Solution: Two-Part Fix

### Part 1: Recover Missing Payments (Yesterday's Payment)

Run the manual sync script to fetch all missing payments from Razorpay:

```bash
# Sync last 7 days (default)
npx tsx scripts/sync-missing-payments.ts

# Sync specific date range
npx tsx scripts/sync-missing-payments.ts --from=2025-10-17 --to=2025-10-18

# Sync just yesterday
npx tsx scripts/sync-missing-payments.ts --from=2025-10-17
```

**What it does:**

- Fetches all payments from Razorpay for the date range
- Checks which ones are missing from your database
- Inserts them with status `captured` or `authorized`
- Updates `payment_orders` status to `paid`

### Part 2: Prevent Future Issues (Setup Webhook)

Set up Razorpay webhooks so future payments are automatically saved even if the user closes the browser.

#### Step 1: Get your webhook URL

Your webhook URL is:

```
https://your-domain.com/api/payment/webhook
```

For local testing (use ngrok):

```bash
ngrok http 3000
# Use: https://your-ngrok-url.ngrok.io/api/payment/webhook
```

#### Step 2: Create Webhook Secret

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Click **Create Webhook Secret** or note your existing secret
3. Copy the secret (looks like: `whsec_xxxxxxxxxxxxxxxx`)

#### Step 3: Add Secret to .env.local

```env
RAZORPAY_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### Step 4: Configure Webhook in Razorpay Dashboard

1. Go to **Settings** → **Webhooks** → **Create New Webhook**
2. **Webhook URL**: `https://your-domain.com/api/payment/webhook`
3. **Active Events**: Select these:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `payment.authorized`
   - ✅ `order.paid`
4. **Alert Email**: Your email
5. Click **Create Webhook**

#### Step 5: Test the Webhook

1. Make a test payment in your checkout
2. Check Razorpay Dashboard → Webhooks → see if webhook was triggered
3. Check your database - payment should appear even if you close browser!

## How It Works Now

### Before (Broken):

```
User pays → Frontend handler saves to DB
             ↑
             If this fails (browser closed), payment is lost!
```

### After (Fixed):

```
User pays → Frontend handler saves to DB
         ↓
         Razorpay sends webhook → Webhook saves to DB
                                   ↑
                                   Backup! Works even if frontend fails
```

## Verification Checklist

After setup, verify everything works:

- [ ] Ran sync script - yesterday's payment now in database
- [ ] Added `RAZORPAY_WEBHOOK_SECRET` to `.env.local`
- [ ] Webhook configured in Razorpay dashboard
- [ ] Test payment completed successfully
- [ ] Payment appears in admin panel
- [ ] Payment_orders table shows `status: 'paid'`
- [ ] Payments table shows `status: 'captured'`

## Webhook Security

The webhook handler verifies Razorpay signatures to prevent fake requests:

```typescript
// Automatic signature verification
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(body)
  .digest('hex')

if (signature !== expectedSignature) {
  return 401 Unauthorized
}
```

## Troubleshooting

### Webhook not triggering?

1. Check Razorpay Dashboard → Webhooks → Logs
2. Look for failed webhook deliveries
3. Check webhook URL is accessible (not localhost without ngrok)

### Sync script fails?

```bash
# Check environment variables
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Ensure they're all set in .env.local
```

### Payment still not showing?

1. Check Razorpay payment status (must be `captured` or `authorized`)
2. Run sync script with date range covering the payment date
3. Check server logs for errors: `src/app/api/payment/webhook/route.ts`

## Database Migration Required

After webhook fix, run the migration to update status values:

```bash
# Run in Supabase SQL Editor
supabase/migrations/030_use_razorpay_payment_statuses.sql
```

This updates your database to use actual Razorpay statuses (`captured`, `authorized`, `failed`) instead of custom ones (`success`, `paid`).

## Support

If you still have issues:

1. Check Razorpay webhook logs
2. Check your server logs
3. Verify `.env.local` has all required variables
4. Ensure database migration ran successfully

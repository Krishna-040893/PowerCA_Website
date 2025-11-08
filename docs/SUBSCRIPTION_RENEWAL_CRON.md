# Subscription Renewal Email Automation

## Overview

This system automatically sends email notifications to users when they complete 11 months of their annual subscription, notifying them that they can now renew their subscription.

## How It Works

1. **Eligibility Check**: Users who purchased the Launch Offer/First Year plan become eligible for annual subscription renewal after 11 months (changed from 12 months)
2. **Automatic Notification**: A cron job checks daily for eligible users and sends them an email notification
3. **Deduplication**: The system tracks sent notifications in the `renewal_notifications` table to avoid sending duplicate emails

## Components

### 1. Updated Subscription Hook (`useSubscription.ts`)

- Changed renewal eligibility from 12 months to 11 months
- Users can now see the "Renewal Now" button enabled after 11 months

### 2. Email Template

- Location: `src/lib/email-templates/subscription-renewal-available.tsx`
- Beautiful HTML email with pricing details and CTA button
- Sent to user's registered email address

### 3. API Endpoint

- Endpoint: `/api/subscriptions/check-renewal-eligibility`
- Method: POST
- Checks all active subscriptions and sends emails to eligible users
- Requires authorization header for security

### 4. Database Table

- Table: `renewal_notifications`
- Tracks which users have received renewal notifications
- Prevents duplicate email sends

## Setting Up the Cron Job

### Option 1: Vercel Cron Jobs (Recommended for Production)

1. **Create `vercel.json` configuration** (if not exists):

```json
{
  "crons": [
    {
      "path": "/api/subscriptions/check-renewal-eligibility",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9:00 AM UTC.

2. **Set Environment Variable**:
   - Add `CRON_SECRET` to your Vercel environment variables
   - Generate a secure random string: `openssl rand -base64 32`
   - The cron job will use this for authorization

3. **Vercel Configuration**:
   - Vercel automatically handles cron job execution
   - No additional setup needed
   - View logs in Vercel Dashboard > Functions > Logs

### Option 2: External Cron Service (EasyCron, Cron-Job.org)

1. **Sign up** for a cron service like:
   - [EasyCron](https://www.easycron.com/)
   - [Cron-Job.org](https://cron-job.org/)
   - [cron-job.org](https://console.cron-job.org/)

2. **Configure the cron job**:
   - URL: `https://your-domain.com/api/subscriptions/check-renewal-eligibility`
   - Method: POST
   - Schedule: Daily at 9:00 AM (0 9 \* \* \*)
   - Add Header: `Authorization: Bearer YOUR_CRON_SECRET`

3. **Test the endpoint**:

```bash
curl -X POST https://your-domain.com/api/subscriptions/check-renewal-eligibility \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option 3: GitHub Actions (For Self-Hosted)

1. **Create `.github/workflows/check-renewals.yml`**:

```yaml
name: Check Subscription Renewals

on:
  schedule:
    - cron: '0 9 * * *' # Daily at 9:00 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  check-renewals:
    runs-on: ubuntu-latest
    steps:
      - name: Call Renewal Check API
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/subscriptions/check-renewal-eligibility \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

2. **Add secrets** to GitHub repository:
   - `APP_URL`: Your production URL
   - `CRON_SECRET`: Your cron secret key

## Environment Variables Required

Add these to your `.env.local` (development) and Vercel/Production environment:

```env
# Cron Job Security
CRON_SECRET=your-secure-random-string-here

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=PowerCA <noreply@powerca.in>

# Application URL
NEXTAUTH_URL=https://your-domain.com

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing

### Manual Test

You can manually trigger the cron job for testing:

```bash
# Local testing
curl -X POST http://localhost:3000/api/subscriptions/check-renewal-eligibility \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Production testing
curl -X POST https://powerca.in/api/subscriptions/check-renewal-eligibility \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:

```json
{
  "success": true,
  "message": "Processed 25 subscriptions",
  "eligibleUsers": 3,
  "emailsSent": 3
}
```

### Database Migration

Run the migration to create the `renewal_notifications` table:

```bash
# If using Supabase CLI
supabase db push

# Or apply manually via Supabase Dashboard > SQL Editor
```

## Monitoring

### Check Sent Notifications

Query the database to see sent notifications:

```sql
SELECT
  rn.*,
  u.email,
  u.name,
  us.plan,
  us.created_at as subscription_start
FROM renewal_notifications rn
JOIN auth.users u ON u.id = rn.user_id
JOIN user_subscriptions us ON us.id = rn.subscription_id
ORDER BY rn.sent_at DESC;
```

### Check Eligible Users (Not Yet Notified)

```sql
SELECT
  u.id,
  u.email,
  u.name,
  us.plan,
  us.created_at,
  DATE(us.created_at + INTERVAL '11 months') as eligible_date
FROM user_subscriptions us
JOIN auth.users u ON u.id = us.user_id
WHERE
  us.plan IN ('launch_offer', 'first_year')
  AND us.status = 'ACTIVE'
  AND us.created_at + INTERVAL '11 months' <= NOW()
  AND NOT EXISTS (
    SELECT 1 FROM renewal_notifications rn
    WHERE rn.user_id = us.user_id
    AND rn.subscription_id = us.id
    AND rn.notification_type = '11_month_renewal'
  );
```

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is valid
2. Verify `EMAIL_FROM` domain is verified in Resend
3. Check API logs for errors
4. Ensure `CRON_SECRET` matches in environment and cron configuration

### Duplicate Emails

- The system automatically prevents duplicates using the `renewal_notifications` table
- If duplicates occur, check database constraints

### Users Not Receiving Emails

1. Verify user has completed 11 months: Check `user_subscriptions.created_at`
2. Check if notification was already sent: Query `renewal_notifications` table
3. Verify user email is correct in database
4. Check Resend dashboard for delivery status

## Customization

### Change Notification Schedule

Edit the cron schedule in `vercel.json`:

```json
"schedule": "0 9 * * *"  // Daily at 9 AM
"schedule": "0 */12 * * *"  // Every 12 hours
"schedule": "0 0 * * 0"  // Weekly on Sunday
```

### Change Email Content

Edit the email template:

- File: `src/lib/email-templates/subscription-renewal-available.tsx`
- Modify HTML/CSS as needed
- Test with a sample user

### Change Eligibility Period

Edit `src/hooks/useSubscription.ts`:

```typescript
// Current: 11 months
elevenMonthsLater.setMonth(elevenMonthsLater.getMonth() + 11)

// Change to different period:
elevenMonthsLater.setMonth(elevenMonthsLater.getMonth() + 10) // 10 months
elevenMonthsLater.setMonth(elevenMonthsLater.getMonth() + 9) // 9 months
```

## Support

For issues or questions:

- Contact: contact@powerca.in
- Check logs in Vercel Dashboard
- Review Resend dashboard for email delivery status

# Fix Admin Email Notifications for New Registrations

## Problem

When a client registers on PowerCA:

- ✅ Client receives welcome email successfully
- ❌ Admin (contact@powerca.in) does NOT receive notification email

## Root Cause

**The issue:** Email was being sent FROM and TO the same address (`contact@powerca.in`)

```javascript
// ❌ BEFORE (BROKEN):
from: 'PowerCA <contact@powerca.in>'
to: 'contact@powerca.in' // Same address!
```

**Why this fails:** Most email services, including Resend, block emails where the sender and recipient are the same address. This is an anti-spam measure.

## Solution

Changed the FROM address to use `noreply@powerca.in`:

```javascript
// ✅ AFTER (FIXED):
from: 'PowerCA Notifications <noreply@powerca.in>'
to: 'contact@powerca.in' // Different addresses!
```

## Steps to Complete the Fix

### 1. **Verify Domain in Resend**

First, make sure `powerca.in` is verified in Resend:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Check if `powerca.in` is listed and verified
3. If not verified, follow Resend's DNS verification steps

### 2. **Add noreply@powerca.in to Allowed Senders** (if needed)

Some Resend plans require you to explicitly add sender emails:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click on your domain (`powerca.in`)
3. Go to **Settings** or **Allowed Senders**
4. Add `noreply@powerca.in` if it's not already there
5. Click **Save**

### 3. **Update Environment Variables on Vercel**

Update your Vercel environment variables:

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: `PowerCA_Website`
3. Go to **Settings → Environment Variables**
4. Find or add `EMAIL_FROM`
5. Set value to: `PowerCA Notifications <noreply@powerca.in>`
6. Apply to: Production, Preview, Development
7. Click **Save**
8. **Redeploy** your application

### 4. **Test the Fix**

After updating environment variables and redeploying:

1. Go to your website registration page
2. Register a new test client
3. Check both email inboxes:
   - ✅ Client should receive welcome email
   - ✅ contact@powerca.in should receive admin notification

### 5. **Check Logs for Confirmation**

The code now includes logging. Check server logs for:

```
Sending admin notification email: {
  from: 'PowerCA Notifications <noreply@powerca.in>',
  to: 'contact@powerca.in'
}
Admin notification email sent successfully: { id: '...', ... }
```

If you see errors:

```
Failed to send admin notification: { error: '...' }
```

This indicates an issue with Resend configuration.

## Email Flow After Fix

```
┌─────────────────────────────────────────────────┐
│  Client Registers                                │
└─────────────────┬───────────────────────────────┘
                  │
                  ├─────────────────────────────────┐
                  │                                 │
                  ▼                                 ▼
    ┌─────────────────────────┐      ┌──────────────────────────┐
    │  Welcome Email          │      │  Admin Notification      │
    │  FROM: noreply@         │      │  FROM: noreply@          │
    │  TO: client@email.com   │      │  TO: contact@powerca.in  │
    └─────────────────────────┘      └──────────────────────────┘
```

## Troubleshooting

### Issue: Emails still not arriving

**Check 1: Resend Logs**

1. Go to [Resend Dashboard → Logs](https://resend.com/logs)
2. Look for recent emails sent
3. Check delivery status

**Check 2: Spam Folder**

- Check the spam/junk folder of contact@powerca.in
- Mark as "Not Spam" if found there

**Check 3: DNS Records**
Verify your domain's DNS records are correct:

- SPF record
- DKIM record
- DMARC record (optional but recommended)

**Check 4: Rate Limits**

- Free Resend plans have limits (100 emails/day)
- Check if you've hit the limit

### Issue: "Domain not verified" error

1. Go to [Resend Domains](https://resend.com/domains)
2. Click your domain
3. Copy the DNS records shown
4. Add them to your domain DNS settings (usually in your domain registrar)
5. Wait 24-48 hours for DNS propagation
6. Click "Verify" in Resend dashboard

### Issue: Welcome emails work, but admin notifications don't

This likely means:

1. The FROM address (`noreply@powerca.in`) isn't verified
2. Solution: Add `noreply@powerca.in` to your domain's allowed senders in Resend

## Code Changes Made

### 1. Updated Email Sending Function

**File:** `src/lib/send-emails.ts`

- Changed FROM address to use `noreply@powerca.in`
- Added logging to track email sending
- Added error handling with detailed error messages

### 2. Updated Environment Variable

**File:** `.env.local`

```env
# Before
EMAIL_FROM=PowerCA <contact@powerca.in>

# After
EMAIL_FROM=PowerCA Notifications <noreply@powerca.in>
```

### 3. Registration APIs

**Files:**

- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/simple-register/route.ts`

Already configured to send both emails (no changes needed)

## Testing Checklist

- [ ] Domain verified in Resend
- [ ] `noreply@powerca.in` added to allowed senders (if required)
- [ ] Environment variables updated on Vercel
- [ ] Application redeployed
- [ ] Test registration completed
- [ ] Client receives welcome email
- [ ] Admin receives notification email at contact@powerca.in
- [ ] Both emails display correctly (not in spam)

## Support

If issues persist:

1. **Check Resend Status**: [https://resend.com/status](https://resend.com/status)
2. **Resend Documentation**: [https://resend.com/docs](https://resend.com/docs)
3. **Resend Support**: [support@resend.com](mailto:support@resend.com)
4. **View Server Logs**: Check Vercel deployment logs for email sending errors

## Related Files

- `/src/lib/send-emails.ts` - Email sending functions
- `/src/emails/admin-registration-notification.tsx` - Admin email template
- `/src/emails/welcome-email.tsx` - Client welcome email template
- `/src/app/api/auth/register/route.ts` - Main registration API
- `/src/app/api/auth/simple-register/route.ts` - Simple registration API

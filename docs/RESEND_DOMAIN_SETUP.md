# Resend Domain Verification Setup

## Why You're Not Receiving Emails

If the contact form is saving to the database but emails are not being received at contact@powerca.in, the most likely cause is that **your domain (powerca.in) is not verified in Resend**.

## Issue Details

- **Current Status**: Form submissions save to database ✅
- **Email Status**: Not sending ❌
- **Likely Cause**: Domain not verified in Resend

## Solution: Verify Your Domain in Resend

### Step 1: Access Resend Dashboard

1. Go to https://resend.com/login
2. Log in with your account
3. Navigate to **Domains** in the left sidebar

### Step 2: Add Your Domain

1. Click **"Add Domain"**
2. Enter your domain: `powerca.in`
3. Click **"Add"**

### Step 3: Add DNS Records

Resend will provide you with DNS records that need to be added to your domain. You'll need to add these records:

#### 1. SPF Record (TXT)

```
Type: TXT
Name: @ or powerca.in
Value: v=spf1 include:_spf.resend.com ~all
```

#### 2. DKIM Records (TXT)

Resend will provide specific DKIM records. Example:

```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend]
```

#### 3. DMARC Record (TXT)

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:contact@powerca.in
```

### Step 4: Add DNS Records to Your Domain Provider

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add the DNS records provided by Resend.

**Example for Cloudflare:**

1. Log in to Cloudflare
2. Select your domain `powerca.in`
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Add each TXT record provided by Resend

### Step 5: Verify in Resend

1. Go back to Resend dashboard
2. Click **"Verify"** next to your domain
3. Wait for verification (can take a few minutes to 48 hours)
4. Status should change from "Pending" to "Verified" ✅

## Temporary Solution: Use Resend's Test Domain

While waiting for domain verification, you can use Resend's test domain for testing:

### Update .env.local:

```env
EMAIL_FROM=PowerCA <onboarding@resend.dev>
```

**Note**: `onboarding@resend.dev` is Resend's test domain and works without verification. However:

- ⚠️ Limited to 100 emails per day
- ⚠️ Only for testing purposes
- ⚠️ May be marked as spam
- ⚠️ Not suitable for production

## Current Configuration

Your current email configuration:

```env
EMAIL_FROM=PowerCA <noreply@powerca.in>
CONTACT_EMAIL=contact@powerca.in
RESEND_API_KEY=re_BHpihZ2L_GdXPKMHC5Usraiwi1Xc5JZEW
```

## How to Test

### Option 1: Use Test Domain (Immediate)

1. Update `.env.local`:

   ```env
   EMAIL_FROM=PowerCA <onboarding@resend.dev>
   ```

2. Restart dev server:

   ```bash
   npm run dev
   ```

3. Submit contact form
4. Check email at contact@powerca.in

### Option 2: Wait for Domain Verification (Recommended for Production)

1. Add DNS records to your domain
2. Wait for Resend verification
3. Keep current configuration:

   ```env
   EMAIL_FROM=PowerCA <noreply@powerca.in>
   ```

4. Submit contact form
5. Emails will be delivered from your verified domain

## Verification Checklist

- [ ] Access Resend dashboard
- [ ] Add domain `powerca.in` to Resend
- [ ] Copy DNS records provided by Resend
- [ ] Add DNS records to domain registrar
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify domain in Resend
- [ ] Test email sending

## Troubleshooting

### DNS Records Not Propagating

Check DNS propagation:

```bash
nslookup -type=TXT powerca.in
```

Or use online tool: https://www.whatsmydns.net/

### Still Not Receiving Emails

1. **Check Resend Logs**:
   - Go to https://resend.com/emails
   - Check for recent email attempts
   - Look for error messages

2. **Check Spam Folder**:
   - Emails might be in spam/junk folder

3. **Verify API Key**:
   - Ensure `RESEND_API_KEY` is correct
   - Check it hasn't expired

4. **Check Server Logs**:
   - Look for errors in terminal where `npm run dev` is running

## Support Resources

- Resend Docs: https://resend.com/docs
- Domain Verification Guide: https://resend.com/docs/dashboard/domains/introduction
- DNS Setup Guide: https://resend.com/docs/dashboard/domains/add-dns-records

## Next Steps

After domain verification is complete:

1. Test the contact form
2. Verify emails are received at contact@powerca.in
3. Check email formatting and content
4. Set up email monitoring in Resend dashboard

## Summary

**The contact form is working correctly** - submissions are being saved to the database. The only remaining issue is email delivery, which requires domain verification in Resend. Use the test domain for immediate testing or verify your domain for production use.

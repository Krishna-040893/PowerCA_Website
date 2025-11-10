# Resend Domain Configuration Guide for PowerCA

## Overview

This guide will help you configure your `powerca.in` domain with Resend to send and receive emails using `contact@powerca.in`.

## Prerequisites

- Access to your domain DNS settings (GoDaddy, Namecheap, Cloudflare, etc.)
- A Resend account (https://resend.com)
- Admin access to PowerCA project

## Step 1: Add Your Domain to Resend

1. **Login to Resend Dashboard**
   - Go to https://resend.com/domains
   - Click "Add Domain"

2. **Enter Your Domain**
   - Domain: `powerca.in`
   - Region: Select the region closest to your users (e.g., US East, EU, Asia)

3. **Configure Domain Settings**
   - Enable "Open Tracking" (optional)
   - Enable "Click Tracking" (optional)
   - Click "Add Domain"

## Step 2: Add DNS Records

Resend will provide you with DNS records to add to your domain. You need to add these records to verify domain ownership and enable email sending.

### Required DNS Records

#### 1. **TXT Record (Domain Verification)**

```
Type: TXT
Name: @ (or leave blank)
Value: resend-verification=xxxxxxxxxxxxxxxxxxxxx
TTL: 3600 (or Auto)
```

#### 2. **DKIM Records** (for email authentication)

```
Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSq...
TTL: 3600
```

#### 3. **SPF Record** (Sender Policy Framework)

```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

**Note:** If you already have an SPF record, you need to add `include:resend.com` to your existing SPF record.

Example existing SPF:

```
v=spf1 include:_spf.google.com ~all
```

Update to:

```
v=spf1 include:_spf.google.com include:resend.com ~all
```

#### 4. **DMARC Record** (optional but recommended)

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:contact@powerca.in
TTL: 3600
```

#### 5. **MX Records** (if you want to receive emails at contact@powerca.in)

If you're using Gmail/Google Workspace for receiving emails:

```
Type: MX
Name: @
Priority: 1
Value: aspmx.l.google.com
TTL: 3600

Type: MX
Name: @
Priority: 5
Value: alt1.aspmx.l.google.com
TTL: 3600

Type: MX
Name: @
Priority: 5
Value: alt2.aspmx.l.google.com
TTL: 3600
```

If you're using another email provider, add their MX records instead.

## Step 3: Add DNS Records to Your Domain Provider

### For GoDaddy:

1. Login to GoDaddy
2. Go to "My Products" → "Domains"
3. Click on your domain `powerca.in`
4. Click "DNS" or "Manage DNS"
5. Add each record as specified above
6. Save changes

### For Cloudflare:

1. Login to Cloudflare
2. Select your domain `powerca.in`
3. Go to "DNS" section
4. Click "Add record"
5. Add each DNS record
6. Make sure "Proxy status" is set to "DNS only" (grey cloud) for MX and TXT records
7. Save changes

### For Namecheap:

1. Login to Namecheap
2. Go to "Domain List"
3. Click "Manage" next to `powerca.in`
4. Go to "Advanced DNS" tab
5. Add each DNS record
6. Save changes

## Step 4: Verify Domain in Resend

1. After adding all DNS records, wait 5-10 minutes for DNS propagation
2. Go back to Resend Dashboard → Domains
3. Click "Verify Domain"
4. Resend will check your DNS records
5. Once verified, you'll see a green checkmark

**Note:** DNS propagation can take up to 24-48 hours in some cases, but usually completes within 10-30 minutes.

## Step 5: Configure Email Forwarding (Optional)

If you want all emails sent to `contact@powerca.in` to be forwarded to another email address:

### Using Google Workspace:

1. Login to Google Admin Console
2. Go to Apps → Google Workspace → Gmail → Routing
3. Create a new rule to forward emails from `contact@powerca.in` to your desired email

### Using Email Forwarding Service:

Many domain providers offer email forwarding:

**GoDaddy:**

1. Go to Email & Office → Email Forwarding
2. Set up forwarding from `contact@powerca.in` to your email

**Cloudflare:**

1. Go to Email → Email Routing
2. Enable Email Routing
3. Add destination address
4. Create forwarding rule: `contact@powerca.in` → your email

## Step 6: Update Environment Variables

Make sure your `.env.local` file has the correct configuration:

```env
# Email Service (Resend)
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=PowerCA <contact@powerca.in>
CONTACT_EMAIL=contact@powerca.in
```

For production (`.env.production` or Vercel environment variables):

```env
RESEND_API_KEY=re_your_production_api_key
EMAIL_FROM=PowerCA <contact@powerca.in>
CONTACT_EMAIL=contact@powerca.in
```

## Step 7: Test Email Sending

### Test from the application:

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3009/contact

3. Submit a test contact form

4. Check if:
   - Email is sent successfully (check Resend logs)
   - Email arrives in the recipient's inbox
   - Email is not marked as spam
   - Sender shows as "PowerCA <contact@powerca.in>"

### Test using API endpoint:

```bash
curl -X POST http://localhost:3009/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-test-email@example.com"}'
```

## Step 8: Monitor Email Delivery

1. **Resend Dashboard**
   - Go to https://resend.com/emails
   - Monitor sent emails
   - Check delivery status
   - View bounce and complaint rates

2. **Email Logs**
   - Check application logs for any email errors
   - Monitor Resend webhook events (optional)

## Troubleshooting

### Domain Not Verifying

- **Check DNS records:** Use https://dnschecker.org to verify your DNS records are propagating globally
- **Wait longer:** DNS can take up to 24-48 hours in rare cases
- **Check for typos:** Make sure all DNS records are entered exactly as provided by Resend

### Emails Going to Spam

- **DKIM/SPF/DMARC:** Ensure all three are properly configured
- **Domain reputation:** New domains may initially go to spam; it improves over time
- **Email content:** Avoid spam trigger words, use proper HTML structure
- **Warm up your domain:** Start with small volumes and gradually increase

### Emails Not Being Received at contact@powerca.in

- **Check MX records:** Verify MX records are properly configured
- **Email forwarding:** If using forwarding, check it's set up correctly
- **Provider settings:** Check your email provider's settings (Gmail, etc.)
- **Test with dig:** Run `dig powerca.in MX` to verify MX records

### Rate Limiting

- **Free tier limits:** Resend free tier has 100 emails/day limit
- **Upgrade plan:** Consider upgrading to a paid plan for higher limits
- **Implement queuing:** Use a queue system for bulk emails

## Production Deployment Checklist

Before deploying to production:

- [ ] Domain verified in Resend
- [ ] All DNS records properly configured and propagated
- [ ] SPF, DKIM, DMARC records all passing
- [ ] Test emails sending successfully
- [ ] Test emails being received at contact@powerca.in
- [ ] Environment variables updated in production
- [ ] Email templates tested and working
- [ ] Monitoring and alerting configured
- [ ] Email forwarding (if applicable) tested
- [ ] Spam score checked (use mail-tester.com)

## Useful Commands

### Check DNS Records

```bash
# Check TXT records
dig powerca.in TXT

# Check MX records
dig powerca.in MX

# Check DKIM
dig resend._domainkey.powerca.in TXT

# Check SPF
dig powerca.in TXT | grep spf
```

### Test Email Deliverability

- https://www.mail-tester.com - Test spam score
- https://mxtoolbox.com - Check DNS, blacklists, MX records
- https://dnschecker.org - Check DNS propagation worldwide

## Support

If you encounter any issues:

1. **Resend Support:** support@resend.com
2. **Documentation:** https://resend.com/docs
3. **Status Page:** https://status.resend.com
4. **Community:** https://resend.com/discord

## Summary

Once properly configured:

- ✅ All emails will be sent from `contact@powerca.in`
- ✅ Emails will have proper authentication (SPF, DKIM, DMARC)
- ✅ Lower chance of emails going to spam
- ✅ Professional appearance with your domain
- ✅ Ability to receive emails at `contact@powerca.in`

## Quick Reference

| Setting             | Value                              |
| ------------------- | ---------------------------------- |
| **From Email**      | PowerCA <contact@powerca.in>       |
| **Reply-To**        | contact@powerca.in                 |
| **Support Email**   | contact@powerca.in                 |
| **Contact Email**   | contact@powerca.in                 |
| **Resend Region**   | US East (or your preferred region) |
| **DNS Propagation** | 10-30 minutes (typically)          |

---

**Last Updated:** January 2025
**Status:** Ready for Production

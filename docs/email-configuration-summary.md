# PowerCA Email Configuration Summary

## Current Email Setup

All emails in the PowerCA application now use **`contact@powerca.in`** as the primary email address.

## Changes Made

### 1. Environment Variables Updated

```env
EMAIL_FROM=PowerCA <contact@powerca.in>
CONTACT_EMAIL=contact@powerca.in
```

### 2. Email Addresses Standardized

| Old Email            | New Email            | Purpose                      |
| -------------------- | -------------------- | ---------------------------- |
| `noreply@powerca.in` | `contact@powerca.in` | System emails, notifications |
| `support@powerca.in` | `contact@powerca.in` | Support emails, help desk    |
| (various)            | `contact@powerca.in` | All outgoing emails          |

### 3. Files Updated (25+ files)

**Core Email Libraries:**

- `src/lib/email.ts`
- `src/lib/send-emails.ts`
- `src/lib/resend.ts`

**API Routes:**

- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/bookings/route.ts`
- `src/app/api/bookings/supabase/route.ts`
- `src/app/api/newsletter/subscribe/route.ts`
- `src/app/api/affiliate/apply/route.ts`
- `src/app/api/registrations/route.ts`
- `src/app/api/payment/verify/route.ts`
- `src/app/api/payment/cashfree/webhook/route.ts`
- `src/app/api/payment/cashfree/process-payment/route.ts`
- `src/app/api/subscriptions/check-renewal-eligibility/route.ts`

**Email Templates:**

- `src/emails/welcome-email.tsx`
- `src/lib/email-templates/payment-confirmation.tsx`

**UI Components:**

- `src/components/layout/footer.tsx`
- `src/app/(marketing)/contact/page.tsx`
- `src/app/Contact page/components/ContactForm.tsx`
- `src/app/Contact page/imports/ContactPage.tsx`
- `src/app/Pricing Page/imports/PricingPage.tsx`
- `src/app/payment-failed/page.tsx`

**Invoice Templates:**

- `src/lib/invoice-generator.ts`
- `src/lib/invoice-tbs-template.ts`

## Email Use Cases

### 1. Transactional Emails

**From:** PowerCA <contact@powerca.in>

- Welcome emails
- Password reset
- Payment confirmations
- Booking confirmations
- Registration confirmations

### 2. Notification Emails

**From:** PowerCA <contact@powerca.in>

- Subscription renewals
- Affiliate approvals
- Order status updates

### 3. Marketing Emails

**From:** PowerCA <contact@powerca.in>

- Newsletter
- Product updates
- Special offers

### 4. Support/Contact Forms

**To:** contact@powerca.in

- Contact form submissions
- Demo booking requests
- General inquiries

## What You Need to Do

### 1. Configure Resend Domain (CRITICAL)

Follow the guide in `docs/resend-domain-setup.md` to:

1. **Add domain to Resend**
   - Login to https://resend.com
   - Add domain: `powerca.in`

2. **Add DNS records** (provided by Resend)
   - TXT record for domain verification
   - TXT record for DKIM
   - Update SPF record
   - Add DMARC record (recommended)

3. **Configure email receiving** (choose one option)

   **Option A: Gmail/Google Workspace** (Recommended)
   - Add MX records for Google
   - Set up email forwarding in Google Admin

   **Option B: Domain Provider Email Forwarding**
   - Use GoDaddy/Cloudflare/Namecheap email forwarding
   - Forward contact@powerca.in to your email

   **Option C: Third-party Email Service**
   - Use a service like ImprovMX, ForwardEmail.net
   - Forward to your existing email

4. **Verify domain in Resend**
   - Wait for DNS propagation (10-30 minutes)
   - Click "Verify Domain" in Resend dashboard

### 2. Update Production Environment Variables

In Vercel/production environment:

```env
RESEND_API_KEY=re_your_production_key
EMAIL_FROM=PowerCA <contact@powerca.in>
CONTACT_EMAIL=contact@powerca.in
```

### 3. Test Email Functionality

After DNS configuration:

```bash
# Start dev server
npm run dev

# Test contact form
Visit: http://localhost:3009/contact
Submit a test form

# Check email delivery
- Check Resend logs
- Verify email arrives
- Check spam folder
- Verify sender shows as "PowerCA <contact@powerca.in>"
```

## Quick Troubleshooting

### Emails not sending

- Check `RESEND_API_KEY` is set correctly
- Check Resend dashboard for errors
- Check application logs

### Emails going to spam

- Verify SPF, DKIM, DMARC records are configured
- Check domain is verified in Resend
- Test with mail-tester.com

### Not receiving emails at contact@powerca.in

- Check MX records are configured
- Check email forwarding is set up
- Test with `dig powerca.in MX`

## Testing Checklist

Before going to production:

- [ ] Domain verified in Resend
- [ ] DNS records configured and propagated
- [ ] Test email sent successfully
- [ ] Test email received (not in spam)
- [ ] Contact form working
- [ ] Password reset email working
- [ ] Payment confirmation email working
- [ ] Welcome email working
- [ ] Email forwarding to contact@powerca.in working
- [ ] Sender shows as "PowerCA <contact@powerca.in>"

## Scripts Available

### Clear Test Data

```bash
node scripts/clear-test-data.js
```

Clears all test data from database (use with caution!)

### Restore Admin Users

```bash
node scripts/restore-admin-users.js
```

Restores default admin accounts after clearing data.

### Update Email Addresses

```bash
node scripts/update-email-addresses.js
```

Updates all email addresses in codebase (already run).

## Production Deployment

When deploying to production:

1. **Update environment variables** in Vercel
2. **Verify domain** is configured in Resend
3. **Test all email types** work correctly
4. **Monitor Resend dashboard** for delivery issues
5. **Set up alerts** for failed emails

## Summary

- ✅ All code updated to use `contact@powerca.in`
- ✅ 25+ files updated
- ✅ 15+ email address references changed
- ⏳ **Next step:** Configure Resend domain (see docs/resend-domain-setup.md)
- ⏳ **Then:** Test all email functionality
- ⏳ **Finally:** Deploy to production

## Contact

For issues with:

- **Resend:** support@resend.com
- **Domain DNS:** Your domain provider support
- **PowerCA Code:** Check application logs

---

**Last Updated:** January 2025
**Status:** Code updated, awaiting DNS configuration

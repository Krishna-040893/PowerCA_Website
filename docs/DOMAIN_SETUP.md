# Domain Setup Guide - powerca.in

## Overview

This guide explains how to properly configure your domain `powerca.in` to redirect all traffic (including `www.powerca.in` and the Vercel subdomain) to the main domain `https://powerca.in`.

## Changes Made

### 1. Vercel Configuration (`vercel.json`)

Added redirect rules to handle:

- `www.powerca.in` → `https://powerca.in`
- `power-ca-website.vercel.app` → `https://powerca.in`

These redirects are **permanent (301)** redirects, which is best for SEO.

## DNS Configuration Steps

### Required DNS Records

You need to configure the following DNS records in your domain registrar's DNS settings:

#### A Records (for root domain)

```
Type: A
Name: @ (or leave blank for root domain)
Value: 76.76.21.21 (Vercel's IP)
TTL: 3600 (or Auto)
```

#### CNAME Record (for www subdomain)

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### Vercel Dashboard Configuration

1. **Go to Vercel Dashboard**
   - Navigate to your project: power-ca-website
   - Go to Settings → Domains

2. **Add Your Domains**
   - Add `powerca.in` as the primary domain
   - Add `www.powerca.in` (it will automatically redirect to the primary)
   - The Vercel subdomain `power-ca-website.vercel.app` will also redirect

3. **Set Primary Domain**
   - Make sure `powerca.in` is set as the **Primary Domain** (not www)
   - This ensures all redirects point to the non-www version

4. **SSL Certificate**
   - Vercel automatically provisions SSL certificates for all domains
   - Wait for SSL certificate to be issued (usually takes a few minutes)

## Verification Steps

After deploying and configuring DNS:

1. **Test www redirect:**

   ```bash
   curl -I https://www.powerca.in
   # Should show 301 redirect to https://powerca.in
   ```

2. **Test Vercel subdomain redirect:**

   ```bash
   curl -I https://power-ca-website.vercel.app
   # Should show 301 redirect to https://powerca.in
   ```

3. **Test main domain:**

   ```bash
   curl -I https://powerca.in
   # Should show 200 OK
   ```

4. **Browser Test:**
   - Visit `http://www.powerca.in` → should redirect to `https://powerca.in`
   - Visit `https://www.powerca.in` → should redirect to `https://powerca.in`
   - Visit `https://power-ca-website.vercel.app` → should redirect to `https://powerca.in`

## Deployment

After making these changes:

1. **Commit the changes:**

   ```bash
   git add vercel.json docs/DOMAIN_SETUP.md
   git commit -m "feat: add domain redirects from www and Vercel subdomain to primary domain"
   git push
   ```

2. **Wait for Vercel deployment** (automatic on push)

3. **Verify redirects are working** using the verification steps above

## DNS Propagation

- DNS changes can take **up to 48 hours** to propagate globally
- Use [DNS Checker](https://dnschecker.org) to verify DNS propagation
- Vercel SSL certificate provisioning is automatic but may take 5-10 minutes

## Troubleshooting

### Issue: www still showing Vercel subdomain

- **Solution:** Make sure you've added both domains in Vercel Dashboard
- **Solution:** Check DNS records are pointing to Vercel correctly

### Issue: SSL certificate error

- **Solution:** Wait for Vercel to provision SSL (5-10 minutes)
- **Solution:** Ensure DNS records are correct

### Issue: Redirect not working

- **Solution:** Clear browser cache
- **Solution:** Wait for DNS propagation (check with DNS Checker)
- **Solution:** Verify vercel.json redirects are deployed

### Issue: Still seeing power-ca-website.vercel.app

- **Solution:** The redirect rules in vercel.json will handle this
- **Solution:** Make sure the latest deployment includes vercel.json changes

## Important Notes

- **Primary Domain:** Always use `powerca.in` (without www) as the canonical URL
- **SEO:** 301 redirects are permanent and preserve SEO ranking
- **HTTPS:** All redirects force HTTPS for security
- **Email Links:** Update all email templates to use `https://powerca.in`

## References

- [Vercel Custom Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Vercel Redirects Documentation](https://vercel.com/docs/project-configuration#redirects)
- [DNS Configuration Guide](https://vercel.com/docs/concepts/projects/domains/add-a-domain)

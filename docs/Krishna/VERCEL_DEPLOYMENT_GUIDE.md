# PowerCA Website - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Completed Steps

- [x] Created `vercel.json` configuration file
- [x] Verified build scripts in `package.json`
- [x] Production build tested locally (compiles with warnings)
- [x] Environment variables documented

### 🚀 Deployment Steps

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm i -g vercel
```

## Step 2: Connect Your GitHub Repository to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `Krishna-040893/PowerCA_Website`
4. Vercel will automatically detect Next.js framework

### Option B: Via CLI

```bash
vercel login
vercel
```

## Step 3: Configure Environment Variables in Vercel

### Required Environment Variables

Go to your project settings on Vercel Dashboard → Environment Variables

Add the following variables:

#### 🔐 Essential Variables (MUST HAVE)

```env
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email Service (Resend)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXX
EMAIL_FROM=noreply@powerca.in

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### 📊 Optional Variables

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# HubSpot Integration
HUBSPOT_PRIVATE_APP_TOKEN=your_token
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=your_portal_id

# Monitoring (if using Sentry)
SENTRY_DSN=your_sentry_dsn
```

### ⚠️ Important Notes on Environment Variables:

1. **NEXTAUTH_URL**: Must be your production domain (e.g., `https://powerca.in` or `https://powerca.vercel.app`)
2. **Razorpay Keys**: Use LIVE keys for production, not test keys
3. **Supabase Keys**: Get from Supabase Dashboard → Settings → API
4. **NEXTAUTH_SECRET**: Generate using: `openssl rand -base64 32`

## Step 4: Configure Vercel Project Settings

### Build & Development Settings

- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Root Directory

- Leave as default (repository root)

### Node.js Version

- Select: 20.x (recommended for Next.js 15)

### Environment Variables Configuration

- Add all variables for:
  - Production
  - Preview
  - Development (optional)

## Step 5: Configure Domain (Optional)

### Custom Domain Setup

1. Go to Settings → Domains
2. Add your domain: `powerca.in`
3. Configure DNS records:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## Step 6: Deploy

### First Deployment

1. If using Dashboard: Click "Deploy"
2. If using CLI: Run `vercel --prod`

### Monitor Deployment

- Watch build logs in real-time
- Check for any build errors
- Verify all environment variables are loaded

## Step 7: Post-Deployment Verification

### ✅ Verify These Features:

1. **Homepage**: Loads correctly
2. **Authentication**:
   - User login/register at `/login` and `/register`
   - Admin login at `/admin-login`
3. **Payment Integration**: Test with Razorpay test mode first
4. **Database Connection**: Check Supabase logs
5. **Email Sending**: Test contact form
6. **Analytics**: Verify Google Analytics tracking (if configured)

### 🔍 Check Logs

- Function Logs: Vercel Dashboard → Functions tab
- Build Logs: Vercel Dashboard → Deployments
- Runtime Logs: Vercel Dashboard → Functions → Logs

## Step 8: Configure Webhooks

### Razorpay Webhook

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://your-domain.vercel.app/api/payment/webhook`
3. Select events:
   - payment.captured
   - payment.failed
   - order.paid

## 🚨 Troubleshooting Common Issues

### Build Failures

```bash
# Clear cache and rebuild
vercel --force

# Check build logs
vercel logs
```

### Environment Variable Issues

- Ensure no quotes in Vercel environment variable values
- Check variable names match exactly (case-sensitive)
- Verify all required variables are set

### Database Connection Issues

- Check Supabase project is not paused
- Verify service role key is correct
- Check connection pooling settings

### Payment Integration Issues

- Verify Razorpay keys (live vs test)
- Check webhook secret matches
- Ensure domain is whitelisted in Razorpay

## 📊 Performance Optimization

### Vercel Analytics (Optional)

```bash
npm i @vercel/analytics
```

Add to `src/app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Speed Insights (Optional)

```bash
npm i @vercel/speed-insights
```

## 🔄 Continuous Deployment

### Automatic Deployments

- Every push to `main` branch triggers deployment
- Pull requests create preview deployments

### Manual Deployments

```bash
# Deploy to production
vercel --prod

# Create preview deployment
vercel
```

## 📝 Important Configuration Files

### vercel.json (Already Created)

- Configures regions (Mumbai - bom1)
- Sets function timeouts
- Adds security headers
- Configures redirects and rewrites

### next.config.ts (Already Configured)

- Security headers
- Image optimization
- CSP policies

## 🎯 Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Razorpay webhooks configured
- [ ] Email service verified
- [ ] Admin credentials changed from defaults
- [ ] Database migrations completed
- [ ] Monitoring/Analytics configured
- [ ] Backup strategy in place

## 🆘 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase + Vercel Guide](https://supabase.com/docs/guides/integrations/vercel)
- [Razorpay Integration](https://razorpay.com/docs/)

## 📧 Contact for Issues

If you encounter deployment issues:

1. Check Vercel status page
2. Review build logs
3. Check environment variables
4. Verify external service connections

---

**Note**: ESLint warnings in the build are non-blocking and can be addressed post-deployment. The application will deploy successfully despite these warnings.

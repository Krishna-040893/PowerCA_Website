# Vercel Environment Variables Checklist

## Production Deployment: PowerCA Website

This checklist ensures all required environment variables are properly configured in Vercel for the affiliate system and overall application to work correctly.

---

## 🔍 How to Access Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **PowerCA Website**
3. Navigate to: **Settings** → **Environment Variables**
4. Verify each variable below is present and correct

---

## ✅ Required Environment Variables

### 🗄️ Database Configuration (Supabase)

- [ ] **NEXT_PUBLIC_SUPABASE_URL**
  - Value: `https://gevwzzrztriktdazfbpw.supabase.co`
  - Environment: Production, Preview, Development
  - Public: ✅ Yes (starts with NEXT*PUBLIC*)

- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY**
  - Value: Your Supabase anonymous key (starts with `eyJhbGciOi...`)
  - Environment: Production, Preview, Development
  - Public: ✅ Yes (starts with NEXT*PUBLIC*)

- [ ] **SUPABASE_SERVICE_ROLE_KEY** ⚠️ **CRITICAL FOR AFFILIATE SYSTEM**
  - Value: Your Supabase service role key (starts with `eyJhbGciOi...`)
  - Environment: Production, Preview, Development
  - Public: ❌ No (server-side only)
  - **Why Critical:** Without this, database writes (affiliate registrations) will fail with permission errors

---

### 🔐 Authentication Configuration (NextAuth)

- [ ] **NEXTAUTH_URL**
  - Production Value: `https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app`
  - Or your custom domain: `https://powerca.in`
  - Environment: Production, Preview (use deployment URL for preview)
  - Public: ❌ No

- [ ] **NEXTAUTH_SECRET**
  - Value: Your secret key (e.g., `AZEQp25nsVGN3EzYj4fVdaU5+wWQgwTP3mrNok60cog=`)
  - Environment: Production, Preview, Development
  - Public: ❌ No
  - **Note:** Also used for admin JWT authentication

---

### 💳 Payment Gateway (Razorpay)

- [ ] **RAZORPAY_KEY_ID**
  - Value: Your Razorpay key ID (e.g., `rzp_test_RQsgJgVFwM7kov` or `rzp_live_...`)
  - Environment: Production (use live key), Preview/Dev (use test key)
  - Public: ❌ No

- [ ] **RAZORPAY_KEY_SECRET**
  - Value: Your Razorpay secret key
  - Environment: Production, Preview, Development
  - Public: ❌ No

- [ ] **RAZORPAY_WEBHOOK_SECRET** (Optional but recommended)
  - Value: Your webhook secret from Razorpay dashboard
  - Environment: Production, Preview
  - Public: ❌ No

---

### 📧 Email Service (Resend)

- [ ] **RESEND_API_KEY** ⚠️ **REQUIRED FOR AFFILIATE EMAILS**
  - Value: Your Resend API key (e.g., `re_BHpihZ2L_GdXPKMHC5Usraiwi1Xc5JZEW`)
  - Environment: Production, Preview, Development
  - Public: ❌ No
  - **Why Important:** Affiliate confirmation and admin notification emails won't send without this

- [ ] **EMAIL_FROM**
  - Value: `contact@powerca.in`
  - Environment: Production, Preview, Development
  - Public: ❌ No
  - **Note:** Domain must be verified in Resend dashboard

---

### 📊 Analytics & Tracking (Optional)

- [ ] **NEXT_PUBLIC_GA_ID**
  - Value: `G-P15M72BCQ6`
  - Environment: Production, Preview
  - Public: ✅ Yes

---

### 🌐 Application URLs

- [ ] **NEXT_PUBLIC_APP_URL**
  - Production Value: `https://powerca.in` or your deployment URL
  - Preview Value: Use Vercel's automatic deployment URL
  - Environment: Production, Preview, Development
  - Public: ✅ Yes

---

## 🚨 Common Issues & Troubleshooting

### Issue 1: Affiliate Registration Fails with "Permission Denied"

**Cause:** Missing or incorrect `SUPABASE_SERVICE_ROLE_KEY`

**Solution:**

1. Go to Supabase Dashboard → Project Settings → API
2. Copy the `service_role` secret key (not anon key!)
3. Add/update in Vercel environment variables
4. Redeploy the application

---

### Issue 2: No Email Notifications Received

**Cause:** Missing `RESEND_API_KEY` or `EMAIL_FROM` not verified

**Solution:**

1. Verify `RESEND_API_KEY` is set in Vercel
2. Ensure `contact@powerca.in` is verified in Resend dashboard
3. Check Resend dashboard for failed email logs
4. Redeploy the application

---

### Issue 3: Affiliate Login Redirects to Error Page

**Cause:** Missing `NEXTAUTH_SECRET` or incorrect `NEXTAUTH_URL`

**Solution:**

1. Ensure `NEXTAUTH_SECRET` matches across all environments
2. Update `NEXTAUTH_URL` to match your deployment URL
3. Redeploy the application

---

### Issue 4: Payment Integration Not Working

**Cause:** Using test keys in production or missing webhook secret

**Solution:**

1. Use `rzp_live_*` keys for production
2. Use `rzp_test_*` keys for preview/development
3. Configure webhook secret for payment verification
4. Redeploy the application

---

## 🔄 After Adding/Updating Variables

**Important:** Environment variables are only loaded during build time!

1. After adding or updating any environment variable
2. Go to: **Deployments** tab in Vercel
3. Find the latest deployment
4. Click the **⋮** menu → **Redeploy**
5. Or push a new commit to trigger automatic deployment

---

## 📝 Environment-Specific Notes

### Production Environment

- Use `rzp_live_*` Razorpay keys
- Set `NEXTAUTH_URL` to your production domain
- Ensure all keys are production-ready

### Preview Environment

- Can use test Razorpay keys
- `NEXTAUTH_URL` should match preview deployment URL
- Good for testing before production

### Development Environment

- Use test/sandbox credentials
- `NEXTAUTH_URL` typically `http://localhost:3000`

---

## ✅ Final Verification Steps

After setting all variables:

1. [ ] All variables marked as required are present
2. [ ] `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not anon)
3. [ ] `EMAIL_FROM` domain is verified in Resend
4. [ ] `NEXTAUTH_URL` matches your deployment URL
5. [ ] Razorpay keys match environment (test vs live)
6. [ ] Redeployed application after adding variables
7. [ ] Test affiliate registration on live site
8. [ ] Check admin receives notification email
9. [ ] Verify affiliate receives confirmation email

---

## 🎯 Quick Test: Affiliate System

To verify everything is working:

1. Visit: `https://your-domain.vercel.app/affiliate/apply`
2. Fill out the affiliate registration form
3. Submit the application
4. Expected results:
   - ✅ Success message appears
   - ✅ Admin receives notification email at `contact@powerca.in`
   - ✅ Applicant receives confirmation email
   - ✅ Application appears in admin dashboard
   - ✅ No console errors in browser

---

## 📞 Support

If issues persist after following this checklist:

- Check Vercel deployment logs: **Deployments** → Click deployment → **Function Logs**
- Check Supabase logs: Supabase Dashboard → **Logs** → **API Logs**
- Check Resend logs: Resend Dashboard → **Logs**

---

**Last Updated:** 2025-10-21
**Project:** PowerCA Website
**Branch:** feature-branch-3

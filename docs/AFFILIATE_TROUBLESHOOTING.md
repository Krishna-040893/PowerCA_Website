# Affiliate System Troubleshooting Guide

## ⚠️ Critical Information

### Correct Registration URLs

- ✅ **CORRECT:** `/affiliate-program/register` - Full registration form that matches backend
- ❌ **WRONG:** `/affiliate/apply` - Old/incomplete form with field mismatch

**Always use:** https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app/affiliate-program/register

---

## 🔍 Common Issues and Solutions

### Issue 1: "Permission Denied" or Database Error

**Symptoms:**

- Error message: "Failed to submit affiliate registration"
- Console shows: "permission denied for table affiliate_registrations"

**Root Cause:**
Missing `SUPABASE_SERVICE_ROLE_KEY` environment variable in Vercel

**Solution:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `SUPABASE_SERVICE_ROLE_KEY` with value from Supabase Dashboard
3. **Important:** Use the `service_role` key, NOT the `anon` key
4. Redeploy the application

**How to get the correct key:**

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy the `service_role` secret (NOT the anon key)
5. Add to Vercel as `SUPABASE_SERVICE_ROLE_KEY`

---

### Issue 2: Email Notifications Not Sent

**Symptoms:**

- Registration succeeds but no emails received
- Console warning: "Resend API key not configured"

**Root Cause:**
Missing or incorrect `RESEND_API_KEY` in Vercel

**Solution:**

1. Verify domain `powerca.in` is verified in Resend dashboard
2. Add `RESEND_API_KEY` environment variable in Vercel
3. Add `EMAIL_FROM=contact@powerca.in` environment variable
4. Redeploy

---

### Issue 3: Form Submission Fails Silently

**Symptoms:**

- Click "Register as Affiliate" button
- Nothing happens or generic error

**Root Cause:**

- Network error
- CORS issue
- Missing required fields

**Solution:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try submitting again
4. Look for red error messages
5. Go to Network tab → Look for `/api/affiliate/apply` request
6. Check the Response tab for detailed error

**Common errors and fixes:**

- `"All required fields must be provided"` → Fill all required fields marked with \*
- `"This email already has a pending/approved affiliate application"` → Use different email or contact admin
- `500 Internal Server Error` → Check Vercel function logs

---

### Issue 4: Wrong Registration Page

**Symptoms:**

- Form doesn't match expected fields
- Missing password field
- Different layout

**Root Cause:**
Using old `/affiliate/apply` page instead of new `/affiliate-program/register`

**Solution:**
Navigate to: `/affiliate-program/register`

---

## 🧪 Testing Checklist

### Step 1: Verify Environment Variables

Run this in browser console on your Vercel deployment:

```javascript
fetch('/api/affiliate/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}), // Send empty to check validation
})
  .then((r) => r.json())
  .then(console.log)
```

**Expected response:**

```json
{
  "error": "All required fields must be provided"
}
```

**If you see:**

- `"Missing Supabase environment variables"` → Add Supabase env vars
- Network error → Check Vercel deployment status
- 504 Timeout → Check Supabase connection

---

### Step 2: Test Database Connection

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

```sql
SELECT count(*) as total_affiliates
FROM affiliate_registrations;
```

**Expected:** Should return a number (even if 0)

**If error:**

- "relation does not exist" → Run migrations
- "permission denied" → Check RLS policies

---

### Step 3: Test RLS Policies

In Supabase SQL Editor, run:

```sql
-- This should work (service_role bypasses RLS)
SELECT * FROM affiliate_registrations LIMIT 1;

-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'affiliate_registrations';
```

**Expected:** Should show at least one policy for `service_role`

---

### Step 4: Test Full Registration Flow

1. Navigate to `/affiliate-program/register`
2. Fill out form with test data:
   - Use a unique email
   - Password: Test@123456
   - Phone: 9876543210
   - Fill all required fields
3. Check browser console for errors
4. Expected: Redirect to `/affiliate-login` with success message

---

## 📋 Required Form Fields

### Personal Information (Required)

- Full Name
- Email Address
- Mobile Number (10 digits starting with 6-9)
- Password (min 8 characters)
- City
- State

### Affiliate Information (Required)

- Promotion Strategy (min 50 characters)
- Target Audience

### Business Information (Optional)

- Business Type (default: individual)
- Company Name (required if business type is "company")
- Designation
- Experience
- Expected Monthly Referrals

### Payment Information (Optional but Recommended)

- Bank Account Number
- IFSC Code
- PAN Number
- GST Number

---

## 🐛 Debugging Steps

### 1. Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Click on your deployment
3. Go to "Functions" tab
4. Find `/api/affiliate/apply`
5. Click to see logs
6. Look for error messages

**Common errors:**

- `"Missing Supabase environment variables"` → Check env vars
- `"duplicate key value violates unique constraint"` → Email already registered
- `"null value in column violates not-null constraint"` → Missing required field

---

### 2. Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Select "API" logs
4. Look for recent POST requests to `affiliate_registrations`
5. Check for errors

---

### 3. Test API Directly with cURL

```bash
curl -X POST https://your-deployment.vercel.app/api/affiliate/apply \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "Test@123456",
    "city": "Mumbai",
    "state": "Maharashtra",
    "promotionMethod": "I will promote through social media and my professional network to CA students and practicing CAs",
    "targetAudience": "Chartered Accountants and CA students looking for practice management solutions"
  }'
```

**Expected response:**

```json
{
  "success": true,
  "message": "Affiliate registration submitted successfully!",
  "registrationId": "some-uuid"
}
```

---

## 🔧 Quick Fixes

### Fix 1: Reset Failed Registration

If you get "email already exists" but can't login:

1. Go to Supabase Dashboard → Table Editor
2. Select `affiliate_registrations` table
3. Find your email
4. Either:
   - Delete the row (if test data)
   - Update `status` to `approved` and login
   - Contact admin to approve

---

### Fix 2: Email Syntax Error (Already Fixed)

The admin email had a syntax error (extra `>` character) which has been fixed in commit `ca6e551`.

Before:

```typescript
to: 'contact@powerca.in>',  // ❌ WRONG
```

After:

```typescript
to: 'contact@powerca.in',  // ✅ CORRECT
```

---

### Fix 3: Verify Supabase Connection

Create a test API route:

```typescript
// app/api/test-db/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { count, error } = await supabase
    .from('affiliate_registrations')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ count, error, configured: true })
}
```

Visit `/api/test-db` to verify connection.

---

## 📞 Still Having Issues?

If none of the above solutions work:

1. **Check Vercel Deployment Status**
   - Ensure deployment succeeded
   - No build errors

2. **Verify Database Migrations**
   - Run `npm run supabase:push` locally
   - Or manually run migrations in Supabase dashboard

3. **Test Locally First**

   ```bash
   npm run dev
   # Visit http://localhost:3000/affiliate-program/register
   ```

4. **Collect Debug Information**
   - Browser console errors
   - Vercel function logs
   - Supabase API logs
   - Network request/response

5. **Check Required Services**
   - ✅ Supabase project is active
   - ✅ Vercel deployment succeeded
   - ✅ Environment variables are set
   - ✅ Database migrations are applied

---

## ✅ Success Indicators

When everything works correctly:

1. Form submission shows loading state
2. No console errors
3. Success toast notification appears
4. Redirects to `/affiliate-login`
5. Admin receives email notification
6. Applicant receives confirmation email
7. Record appears in Supabase `affiliate_registrations` table
8. Can login with registered email/password (after approval)

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt before storage
- Service role key should never be exposed to frontend
- Email domain must be verified in Resend
- RLS policies protect data access
- HTTPS is enforced on all endpoints

---

**Last Updated:** 2025-10-21
**Version:** 2.0
**Related Files:**

- `/src/app/affiliate-program/register/page.tsx` - Registration form
- `/src/app/api/affiliate/apply/route.ts` - API endpoint
- `/supabase/migrations/009_create_affiliate_registrations_table.sql` - Database schema

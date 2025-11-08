# Login & Redirect Issues Fix for Vercel Deployment

## 🚨 Issues Identified

Your affiliate and admin login processes are failing to redirect properly on Vercel due to:

1. **Cookie Settings**: `sameSite: 'strict'` doesn't work well with Vercel's edge functions
2. **localStorage Timing**: `router.push()` might not wait for localStorage to sync
3. **Session Establishment**: NextAuth sessions need more time to establish on Vercel's serverless functions
4. **Missing NEXTAUTH_URL**: Environment variable might not match deployment URL

---

## ✅ Fixes Applied

### 1. Admin Login Improvements

**File:** `src/app/api/admin/auth/login/route.ts`

**Changes:**

- Changed `sameSite: 'strict'` to `sameSite: 'lax'` for better Vercel compatibility
- Added explicit `path: '/'` to cookie settings
- Added logging to track authentication flow

**File:** `src/app/admin-login/page.tsx`

**Changes:**

- Replaced `router.push('/admin')` with `window.location.href = '/admin'`
- This ensures localStorage is fully written before redirect on Vercel

### 2. Affiliate Login Improvements

**File:** `src/app/affiliate-login/page.tsx`

**Changes:**

- Increased session establishment wait time from 500ms to 800ms
- Added comprehensive console logging for debugging
- Simplified redirect logic using `window.location.href` directly
- Added session verification logging

---

## 🔧 Required Vercel Configuration

### Environment Variables to Verify

**Critical for Login Redirects:**

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Supabase (Required for authentication)
NEXT_PUBLIC_SUPABASE_URL=https://gevwzzrztriktdazfbpw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Steps to Configure in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. **CRITICAL**: Update `NEXTAUTH_URL` to match your deployment URL:
   - For feature-branch-1: `https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app`
   - DO NOT include trailing slash
   - DO NOT use `http://localhost:3000` in production
5. Ensure all environment variables are set for **Production**, **Preview**, AND **Development**
6. Click **Save**
7. Go to **Deployments** → Find latest → Click **⋮** → **Redeploy**

---

## 🧪 Testing the Fixes

### Test Admin Login

1. Visit: `https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app/admin-login`
2. Open browser DevTools (F12) → Console tab
3. Enter credentials:
   - Username: `superadmin`
   - Password: `Powerca@25`
4. Click "Admin Sign In"
5. **Expected behavior:**
   - Console shows: `✅ Admin authentication successful`
   - Page redirects to `/admin` dashboard
   - No errors in console

**If it fails:**

- Check console for errors
- Verify `adminToken` in Application → Cookies
- Check Vercel function logs

### Test Affiliate Login

1. Visit: `https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app/affiliate-login`
2. Open browser DevTools (F12) → Console tab
3. Register a test affiliate first at `/affiliate-program/register`
4. Use admin portal to approve the affiliate
5. Try logging in with affiliate credentials
6. **Expected console output:**
   ```
   ✅ Affiliate login successful, verifying session...
   📋 Session data: { role: 'affiliate', status: 'approved' }
   ✅ Affiliate verified, redirecting to: /affiliate/account
   ```
7. Should redirect to affiliate dashboard

**If it fails:**

- Check console for specific error messages
- Verify affiliate is approved in admin panel
- Check browser Application → Cookies for `next-auth.session-token`
- Verify `NEXTAUTH_URL` matches deployment URL exactly

---

## 🔍 Common Issues & Solutions

### Issue 1: "Redirect loop" or "Session not found"

**Cause:** `NEXTAUTH_URL` doesn't match deployment URL

**Solution:**

1. Check Vercel deployment URL (copy from Deployments page)
2. Update `NEXTAUTH_URL` environment variable to exact match
3. Remove any trailing slashes
4. Redeploy

**Example:**

```bash
❌ WRONG: NEXTAUTH_URL=http://localhost:3000
❌ WRONG: NEXTAUTH_URL=https://power-ca-website.vercel.app/
✅ CORRECT: NEXTAUTH_URL=https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app
```

---

### Issue 2: Admin login succeeds but redirects back to login

**Cause:** Cookie not being set or localStorage not persisting

**Solution:**

1. Check browser console for errors
2. Verify cookie is set: DevTools → Application → Cookies → Look for `adminToken`
3. Check localStorage: DevTools → Application → Local Storage → Look for `adminToken` and `adminUser`
4. If missing, check Vercel function logs for API errors

**Debug steps:**

```javascript
// Run in browser console after login attempt
console.log('adminToken:', localStorage.getItem('adminToken'))
console.log('adminUser:', localStorage.getItem('adminUser'))
console.log('Cookie:', document.cookie)
```

---

### Issue 3: Affiliate login shows "not an affiliate" error

**Cause:**

- Affiliate not approved in database
- Role not set correctly
- Session not established

**Solution:**

1. Check affiliate status in admin panel
2. Ensure status is `approved` not `pending`
3. Verify role in database is `affiliate` (lowercase)
4. Check session:

```javascript
// Run in console after login
fetch('/api/auth/session')
  .then((r) => r.json())
  .then(console.log)
```

---

### Issue 4: "Invalid credentials" but password is correct

**Cause:**

- Database connection issue
- Password hash mismatch
- User not found

**Solution:**

**For Admin:**

1. Verify admin user exists in `admin_users` table
2. Check Vercel function logs for database errors
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set

**For Affiliate:**

1. Check `affiliate_registrations` table for user
2. Verify `password` column has bcrypt hash
3. Test password was set during registration

---

### Issue 5: Page loads but stays on login screen

**Cause:** JavaScript redirect not executing

**Solution:**

1. Check browser console for JavaScript errors
2. Verify no Content Security Policy blocking redirects
3. Check Network tab for failed API calls
4. Ensure `window.location.href` is supported (it should be)

**Manual test:**

```javascript
// Run in console on login page
window.location.href = '/admin' // For admin
window.location.href = '/affiliate/account' // For affiliate
```

If manual redirect works but login doesn't, check the login response.

---

## 📊 Debugging Checklist

When login fails, check in this order:

### 1. Browser Console

- [ ] No JavaScript errors
- [ ] Sees login success messages
- [ ] Shows session data (for affiliate)

### 2. Browser DevTools → Network Tab

- [ ] POST to `/api/admin/auth/login` (admin) or `/api/auth/signin/credentials` (affiliate) returns 200
- [ ] Response contains token/session
- [ ] No CORS errors
- [ ] No 401/403 errors

### 3. Browser DevTools → Application Tab

- [ ] **Cookies:** Check for `adminToken` (admin) or `next-auth.session-token` (affiliate)
- [ ] **Local Storage:** Check for `adminToken` and `adminUser` (admin only)
- [ ] Cookies are for correct domain

### 4. Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Click "Functions" tab
4. Find the auth function
5. Check for errors:
   - Missing environment variables
   - Database connection errors
   - JWT signing errors

### 5. Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" → "API"
3. Look for authentication queries
4. Check for:
   - User not found
   - Password verification
   - Connection errors

---

## 🎯 Success Indicators

When everything works correctly:

### Admin Login

1. Console shows: `✅ Admin authentication successful`
2. Token stored in localStorage
3. Cookie `adminToken` is set
4. Immediate redirect to `/admin`
5. Admin dashboard loads without redirect to login

### Affiliate Login

1. Console shows: `✅ Affiliate login successful, verifying session...`
2. Console shows: `📋 Session data: { role: 'affiliate', status: 'approved' }`
3. Console shows: `✅ Affiliate verified, redirecting to: /affiliate/account`
4. Cookie `next-auth.session-token` is set
5. Redirects to affiliate dashboard
6. Dashboard loads without redirect to login

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt (never stored in plain text)
- Admin uses JWT tokens in HTTP-only cookies
- Affiliates use NextAuth sessions
- Cookies use `secure: true` in production (HTTPS only)
- `sameSite: 'lax'` prevents some CSRF while working with Vercel

---

## 📞 Still Having Issues?

If you've followed all steps and login still doesn't work:

1. **Collect Debug Info:**
   - Screenshot of browser console
   - Screenshot of Network tab showing auth request/response
   - Screenshot of Vercel function logs
   - List of environment variables (names only, not values)

2. **Verify Prerequisites:**
   - Supabase project is active
   - Database tables exist (`admin_users`, `affiliate_registrations`)
   - Test user exists in database
   - All environment variables are set in Vercel

3. **Try Local Testing:**
   ```bash
   npm run dev
   # Test login at http://localhost:3000
   ```
   If it works locally but not on Vercel, it's likely an environment variable issue.

---

**Last Updated:** 2025-10-21
**Affected Files:**

- `src/app/api/admin/auth/login/route.ts` (Admin auth API)
- `src/app/admin-login/page.tsx` (Admin login page)
- `src/app/affiliate-login/page.tsx` (Affiliate login page)
- `src/lib/auth.ts` (NextAuth configuration)
- `src/middleware.ts` (Route protection)

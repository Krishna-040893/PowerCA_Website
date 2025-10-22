# Vercel Deployment Guide - Authentication Fix

This document explains the fixes implemented for affiliate and admin login redirect issues on Vercel.

## Issues Identified

### 1. Affiliate Login Redirect Issue

- **Problem**: After successful login, users remained on the login page instead of being redirected to `/affiliate/account`
- **Root Cause**: Session cookies were not fully established before redirect on Vercel's edge network
- **Solution**: Implemented retry mechanism with increased delays to ensure session is established

### 2. Admin Login Redirect Issue

- **Problem**: Admin users stuck on login page after successful authentication
- **Root Cause**: localStorage writes were not completing before redirect on Vercel edge
- **Solution**: Added verification step to ensure localStorage is written before redirect

## Fixes Implemented

### Affiliate Login (`src/app/affiliate-login/page.tsx`)

1. **Increased Initial Delay**: Extended from 800ms to 1200ms for Vercel edge network
2. **Retry Mechanism**: Implemented 3-attempt retry to fetch session with proper cache headers
3. **Session Verification**: Enhanced session validation with multiple checks
4. **Cache Prevention**: Added no-cache headers to prevent stale session data

```typescript
// Retry session fetch up to 3 times
let session = null
let retries = 0
const maxRetries = 3

while (retries < maxRetries) {
  const response = await fetch('/api/auth/session', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  })
  // ... retry logic
}
```

### Admin Login (`src/app/admin-login/page.tsx`)

1. **localStorage Verification**: Added 100ms delay and verification step
2. **Error Handling**: Proper error message if localStorage fails to save
3. **Cookie Configuration**: Enhanced cookie settings in API route

```typescript
// Wait for localStorage to be fully written
await new Promise((resolve) => setTimeout(resolve, 100))

// Verify storage was successful
const storedToken = localStorage.getItem('adminToken')
if (!storedToken) {
  setError('Failed to save session. Please try again.')
  return
}
```

### NextAuth Configuration (`src/lib/auth.ts`)

1. **Cookie Configuration**: Added Vercel-optimized cookie settings
2. **Session Updates**: Configured session update frequency
3. **Secure Cookies**: Environment-aware secure cookie configuration

```typescript
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax', // Important for Vercel
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  }
},
useSecureCookies: process.env.NODE_ENV === 'production',
```

## Required Environment Variables for Vercel

### Critical for Authentication

```bash
# NextAuth - MUST match your Vercel deployment URL
NEXTAUTH_URL="https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app"
NEXTAUTH_SECRET="your-secret-here"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Important Notes

1. **NEXTAUTH_URL**: Must EXACTLY match your Vercel deployment URL (including https://)
2. **NEXTAUTH_SECRET**: Use the same secret across all deployments
3. **Cookie Domain**: Automatically handled by NextAuth with proper NEXTAUTH_URL

## Vercel Environment Variable Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update these variables:

   ```
   NEXTAUTH_URL = https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app
   NEXTAUTH_SECRET = [your-secret]
   NEXT_PUBLIC_SUPABASE_URL = [your-url]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-key]
   SUPABASE_SERVICE_ROLE_KEY = [your-key]
   ```

4. Click **Save**
5. **Redeploy** your application for changes to take effect

## Testing the Fixes

### Affiliate Login Test

1. Go to: `https://your-vercel-url.vercel.app/affiliate-login`
2. Enter affiliate credentials
3. Click "Sign In"
4. **Expected**: Loading state for 1-2 seconds, then redirect to `/affiliate/account`
5. **Verify**: You see the affiliate dashboard, not the login page

### Admin Login Test

1. Go to: `https://your-vercel-url.vercel.app/admin-login`
2. Enter admin credentials (username: `superadmin`, password: `Admin@123`)
3. Click "Admin Sign In"
4. **Expected**: Immediate redirect to `/admin` dashboard
5. **Verify**: You see the admin dashboard with sidebar

### If Still Having Issues

1. **Check Browser Console** for errors
2. **Verify Environment Variables** in Vercel dashboard
3. **Clear Browser Cache** and cookies for your domain
4. **Check Network Tab** to see cookie/session responses
5. **Try Incognito Mode** to rule out cached credentials

## Deployment Checklist

- [ ] Update `NEXTAUTH_URL` to match exact Vercel deployment URL
- [ ] Verify all Supabase environment variables are set
- [ ] Ensure `NEXTAUTH_SECRET` is set and matches across environments
- [ ] Redeploy after environment variable changes
- [ ] Test affiliate login flow end-to-end
- [ ] Test admin login flow end-to-end
- [ ] Verify session persistence (refresh page, stay logged in)
- [ ] Check middleware is protecting routes correctly

## Additional Optimizations

### For Better Performance

1. **Edge Runtime**: Consider using Edge Runtime for auth routes
2. **Session Caching**: Already configured with 24-hour update frequency
3. **Cookie Settings**: Optimized for Vercel edge network with `sameSite: 'lax'`

### Security Considerations

1. **HTTPS Only**: Cookies are secure=true in production
2. **HttpOnly**: Prevents XSS attacks on session tokens
3. **SameSite**: Prevents CSRF attacks
4. **Admin JWT**: Separate authentication system from user auth

## Troubleshooting Common Issues

### Issue: "Failed to save session"

- **Cause**: localStorage write failed
- **Solution**: User should try again, or clear browser data

### Issue: "Session not found" after login

- **Cause**: Cookie not set properly
- **Solution**: Verify NEXTAUTH_URL matches deployment URL exactly

### Issue: Redirects to login after successful auth

- **Cause**: Middleware not recognizing session
- **Solution**: Check cookie domain and NEXTAUTH_URL configuration

### Issue: Works locally but not on Vercel

- **Cause**: Environment variables not set in Vercel
- **Solution**: Add all variables in Vercel dashboard and redeploy

## Code Changes Summary

### Files Modified

1. `src/app/affiliate-login/page.tsx` - Enhanced session verification
2. `src/app/admin-login/page.tsx` - Added localStorage verification
3. `src/lib/auth.ts` - Optimized NextAuth cookie configuration
4. `src/app/api/admin/auth/login/route.ts` - Already had proper cookie settings

### No Database Changes Required

All fixes are application-level and don't require database migrations.

## Contact Support

If issues persist after implementing these fixes:

1. Check the browser console for specific error messages
2. Verify all environment variables in Vercel dashboard
3. Ensure you're testing with the latest deployment
4. Try clearing all browser data for the domain

## Version History

- **v1.0** (2025-10-22): Initial fix for Vercel authentication redirect issues
  - Added retry mechanism for affiliate login
  - Enhanced localStorage verification for admin login
  - Optimized NextAuth cookie configuration

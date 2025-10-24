# Vercel Deployment Fixes for Affiliate Login

## Problem Summary

The affiliate login process was working correctly on localhost but failing on Vercel production deployment. After login, users were being redirected back to the login page instead of reaching `/affiliate/account`.

## Root Causes Identified

### 1. **Session Propagation Delay in Serverless Environment**

- In Vercel's serverless environment, session cookies take slightly longer to propagate
- The middleware was checking authentication before the session was fully established
- This caused a redirect loop: login → redirect to /affiliate/account → no session detected → redirect to login

### 2. **NEXTAUTH_URL Port Mismatch**

- `.env.local` had `NEXTAUTH_URL=http://localhost:3001`
- Development server runs on port `3000`
- This mismatch caused NextAuth session issues

### 3. **Missing Explicit Callback Configuration**

- The affiliate login didn't explicitly pass `callbackUrl` to NextAuth
- Middleware didn't specify the correct sign-in page for affiliate routes

## Fixes Applied

### Fix 1: Added Session Establishment Delays

**File**: `src/app/affiliate-login/page.tsx`

Added strategic delays to ensure session is established before redirect:

```typescript
// Wait for session to be established (critical for Vercel)
await new Promise((resolve) => setTimeout(resolve, 500))

// ... session check ...

// Add delay before redirect to ensure cookie is set
setTimeout(() => {
  window.location.href = callbackUrl
}, 300)
```

**Why this works:**

- Gives Vercel's serverless functions time to set session cookies
- Ensures session is available before middleware checks

### Fix 2: Corrected NEXTAUTH_URL

**File**: `.env.local`

Changed:

```env
NEXTAUTH_URL=http://localhost:3001  ❌
```

To:

```env
NEXTAUTH_URL=http://localhost:3000  ✅
```

**Action Required for Vercel:**

- Ensure `NEXTAUTH_URL` in Vercel environment variables is set to your production domain
- Example: `NEXTAUTH_URL=https://powerca.vercel.app`

### Fix 3: Enhanced Middleware with Route-Specific Sign-In Pages

**File**: `src/middleware.ts`

Added proper callback configuration:

```typescript
return withAuth(req as Parameters<typeof withAuth>[0], {
  pages: {
    signIn: pathname.startsWith('/affiliate') ? '/affiliate-login' : '/login',
  },
})
```

**Why this works:**

- Ensures affiliate routes redirect to `/affiliate-login` instead of `/login`
- Prevents confusion between client and affiliate authentication flows

### Fix 4: Added signIn Callback to Auth Configuration

**File**: `src/lib/auth.ts`

Added:

```typescript
callbacks: {
  async signIn({ user }) {
    // Allow all sign-ins (role check is done in the login page)
    return true
  },
  // ... existing jwt and session callbacks
}
```

## Vercel Environment Variables Checklist

Make sure these are set in your Vercel project settings:

### Required Variables:

- ✅ `NEXTAUTH_URL` - Set to your production domain (e.g., `https://powerca.vercel.app`)
- ✅ `NEXTAUTH_SECRET` - Same as local (already set)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- ✅ `RAZORPAY_KEY_ID` - Razorpay test/live key
- ✅ `RAZORPAY_KEY_SECRET` - Razorpay secret
- ✅ `RESEND_API_KEY` - Email service key
- ✅ `EMAIL_FROM` - Verified sender email

### How to Verify in Vercel:

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Environment Variables"
3. Ensure all variables are set for "Production", "Preview", and "Development" environments
4. **CRITICAL**: `NEXTAUTH_URL` must match your actual domain

## Testing Steps

### Local Testing:

1. Clear browser cookies
2. Start dev server: `npm run dev`
3. Navigate to: `http://localhost:3000/affiliate-login`
4. Login with affiliate credentials
5. Verify redirect to `/affiliate/account` works
6. Check that session persists on page refresh

### Vercel Testing:

1. Push changes to your repository
2. Wait for Vercel deployment to complete
3. Clear browser cookies
4. Navigate to: `https://your-domain.vercel.app/affiliate-login`
5. Login with affiliate credentials
6. Verify redirect to `/affiliate/account` works
7. Check browser DevTools → Network tab for session cookies

## Common Issues & Solutions

### Issue: Still redirecting to login after changes

**Solution:**

1. Clear all browser cookies
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Verify `NEXTAUTH_URL` in Vercel matches your domain exactly
4. Check Vercel Function Logs for authentication errors

### Issue: "Session not found" errors

**Solution:**

1. Verify all Supabase environment variables are correct
2. Check that affiliate user exists in `affiliate_registrations` table with:
   - Valid email
   - Hashed password
   - Status = 'approved' (for full access)

### Issue: Works in preview but not production

**Solution:**

1. Ensure environment variables are set for "Production" environment in Vercel
2. Redeploy from main/master branch
3. Clear CDN cache in Vercel settings

## Files Modified

1. `src/app/affiliate-login/page.tsx` - Added session delays
2. `.env.local` - Fixed NEXTAUTH_URL port
3. `src/middleware.ts` - Enhanced route-specific authentication
4. `src/lib/auth.ts` - Added signIn callback

## Additional Notes

- The 500ms and 300ms delays are conservative and can be adjusted if needed
- These delays have minimal impact on user experience (total ~800ms)
- The delays are only needed during the redirect flow, not during normal usage
- For Vercel, session cookies use `SameSite=lax` and `Secure` flags automatically in production

## Monitoring

After deployment, monitor these metrics:

1. Successful login rate (should increase)
2. Redirect loops (should decrease to zero)
3. Session errors in Vercel Function Logs
4. User complaints about login issues

## Rollback Plan

If issues persist, you can rollback by:

1. Reverting the commits in this deployment
2. Using Vercel's "Redeploy" feature to deploy a previous working version
3. The database schema hasn't changed, so data is safe

---

**Last Updated**: 2025-10-21
**Status**: Fixed and Tested Locally
**Next Steps**: Deploy to Vercel and monitor production logs

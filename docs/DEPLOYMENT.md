# PowerCA Deployment Guide

## Deployment Workflow

PowerCA uses a branch-based deployment workflow with Vercel:

- **`main`** → Production (www.powerca.in)
- **`Dev`** → Development/Staging
- **`feature-branch-*`** → Feature development

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run typecheck` or `npx tsc --noEmit`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] All environment variables are set in Vercel
- [ ] Database migrations are applied (if any)
- [ ] Breaking changes are documented

## Deployment Steps

### 1. Develop on Feature Branch

```bash
# Create and checkout feature branch
git checkout -b feature-branch-name

# Make your changes
# ... code, test, commit ...

# Push feature branch
git push origin feature-branch-name
```

### 2. Test Before Merging

```bash
# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

### 3. Merge to Main (Production)

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature-branch-name

# Push to main (triggers production deployment)
git push origin main
```

### 4. Verify Deployment

After pushing to main, Vercel will automatically deploy to production.

#### Monitor Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your PowerCA project
3. Click on the latest deployment
4. Monitor build logs for errors
5. Wait for "Ready" status

#### Verify Deployment Locally

```bash
# Check if production is running latest code
bash scripts/verify-deployment.sh

# Test contact API endpoints
bash scripts/test-production-api.sh
```

#### Manual Verification

```bash
# Check version endpoint
curl https://www.powerca.in/api/version | jq

# Test contact API OPTIONS
curl -X OPTIONS https://www.powerca.in/api/contact -i

# Test contact API POST
curl -X POST https://www.powerca.in/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"1234567890","message":"test"}'
```

## Troubleshooting Deployment Issues

### Issue: 405 Method Not Allowed on API Routes

**Symptoms:**

- Contact form returns 405 error
- OPTIONS requests fail
- POST requests are rejected

**Causes:**

- Old code deployed (missing route handlers)
- Build cache serving stale version
- Environment variables missing
- Middleware blocking requests

**Solutions:**

1. **Check deployed version:**

   ```bash
   curl https://www.powerca.in/api/version | jq '.commit'
   git rev-parse --short origin/main
   # These should match
   ```

2. **Clear Vercel cache and redeploy:**
   - Go to Vercel Dashboard → Project → Settings
   - Scroll to "Build & Development Settings"
   - Click "Clear Cache"
   - Go to Deployments → Latest → "Redeploy"

3. **Check environment variables:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Ensure all required vars are set (see `.env.example`)

4. **Check build logs:**
   - Vercel Dashboard → Latest Deployment → Logs
   - Look for build errors or warnings

5. **Force fresh deployment:**
   ```bash
   # Make empty commit to trigger rebuild
   git commit --allow-empty -m "chore: force deployment"
   git push origin main
   ```

### Issue: Build Fails on Vercel

**Check:**

- TypeScript errors in build logs
- Missing dependencies in `package.json`
- Node version compatibility (check `engines` in package.json)
- Environment variables required at build time

**Solutions:**

1. Run `npm run build` locally first
2. Fix any TypeScript errors
3. Update dependencies: `npm install`
4. Check Node version matches Vercel

### Issue: API Works Locally but Not in Production

**Check:**

1. Environment variables in Vercel
2. CORS configuration in `next.config.ts`
3. Rate limiting (might be too strict)
4. Supabase/Razorpay API keys validity

## Environment Variables

Required environment variables for production:

### Supabase

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Authentication

```
NEXTAUTH_URL=https://www.powerca.in
NEXTAUTH_SECRET
```

### Email (Resend)

```
RESEND_API_KEY
EMAIL_FROM=PowerCA <noreply@powerca.in>
CONTACT_EMAIL=contact@powerca.in
```

### Payments (Razorpay)

```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

### Set in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable
3. Set scope to "Production", "Preview", or "All"
4. Save changes
5. Redeploy for changes to take effect

## Rollback Procedure

If deployment introduces critical bugs:

### Quick Rollback via Vercel

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"

### Rollback via Git

```bash
# Find the last working commit
git log --oneline -10

# Revert to that commit
git revert <commit-hash>

# Or reset (destructive)
git reset --hard <commit-hash>
git push -f origin main  # Use with caution!
```

## Post-Deployment Verification

After every production deployment:

1. **Test critical user flows:**
   - Contact form submission
   - Demo booking
   - User registration
   - Payment flow (in test mode)

2. **Check monitoring:**
   - Vercel Analytics
   - Error logs in Vercel
   - Sentry errors (if configured)

3. **Verify APIs:**

   ```bash
   bash scripts/test-production-api.sh
   ```

4. **Check version:**
   ```bash
   bash scripts/verify-deployment.sh
   ```

## Deployment Best Practices

1. **Never deploy on Friday evening** (less time to fix issues)
2. **Deploy during low-traffic hours** when possible
3. **Test thoroughly in staging/Dev branch** first
4. **Keep deployments small** (easier to debug issues)
5. **Document breaking changes** in commit messages
6. **Monitor for 15-30 minutes** after deployment
7. **Have rollback plan ready** before deploying
8. **Communicate with team** before production deployments

## Useful Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run typecheck` - Check TypeScript errors
- `npm run lint` - Lint code
- `bash scripts/verify-deployment.sh` - Verify production deployment
- `bash scripts/test-production-api.sh` - Test production APIs

## Emergency Contacts

If critical production issues occur:

- Vercel Status: https://www.vercel-status.com/
- Supabase Status: https://status.supabase.com/
- Razorpay Status: https://status.razorpay.com/

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Deployment Guide](https://supabase.com/docs/guides/platform)

# 🔍 Vercel Admin Login Troubleshooting

You've added the 5 environment variables to Vercel but login still doesn't work.

## ⚠️ CRITICAL CHECKLIST - Did You Do These?

### ✅ Step 1: Verify Variables Are Actually Saved

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. You should see **EXACTLY 5 variables**:
   - ✅ `NEXTAUTH_URL`
   - ✅ `NEXTAUTH_SECRET`
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

5. **Each variable should show**: "Production, Preview, Development"

### ✅ Step 2: DID YOU REDEPLOY?

**This is the most common mistake!**

Variables are NOT applied automatically. You MUST redeploy:

1. Go to **Deployments** tab in Vercel
2. Find your latest deployment
3. Click the **3 dots (...)** menu next to it
4. Click **"Redeploy"**
5. Wait for "Ready" status (1-2 minutes)

### ✅ Step 3: Check Correct Vercel URL

Your Vercel might have multiple URLs. Check which one is active:

1. Go to Vercel Dashboard → Your Project
2. Look at the **Domains** section
3. You might see:
   - `https://power-ca-website.vercel.app` (production)
   - `https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app` (preview)
   - Other preview URLs

**IMPORTANT:** Make sure `NEXTAUTH_URL` matches the EXACT URL you're testing!

## 🧪 Diagnostic Steps

### Test 1: Check Which URL to Use

Try ALL these URLs and tell me which one works:

1. **Main Production URL:**

   ```
   https://power-ca-website.vercel.app/admin-login
   ```

2. **Preview Branch URL:**

   ```
   https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app/admin-login
   ```

3. **Latest Deployment URL:**
   - Go to Vercel → Deployments
   - Copy the URL from your latest deployment
   - Add `/admin-login` to the end

### Test 2: Use Debug Page

1. In Vercel, add ONE more variable:

   ```
   Name: ALLOW_ENV_DEBUG
   Value: true
   ```

2. **REDEPLOY** (critical!)

3. Visit: `https://your-vercel-url/debug/env`

4. Take a screenshot of what you see and share it with me

### Test 3: Check Browser Console

1. Open the Vercel login page
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try to login
5. Look for any RED error messages
6. Share what errors you see

### Test 4: Verify Deployment Status

1. Go to Vercel → Deployments
2. Check latest deployment:
   - Status should be "Ready" ✅
   - NOT "Building" or "Error" ❌

## 🔴 Common Issues & Solutions

### Issue 1: Forgot to Redeploy

**Solution:** Go to Deployments → Click 3 dots → Redeploy

### Issue 2: Wrong Environment Selected

**Solution:**

- Go to Settings → Environment Variables
- Click on each variable
- Make sure **ALL THREE** boxes are checked:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### Issue 3: NEXTAUTH_URL Doesn't Match

**Solution:**

- Your `NEXTAUTH_URL` variable must EXACTLY match the URL you're testing
- If testing `https://power-ca-website.vercel.app`, then `NEXTAUTH_URL` must be that
- If testing preview URL, `NEXTAUTH_URL` must be the preview URL

### Issue 4: Typo in Variable Name/Value

**Solution:**

- Variable names are CASE SENSITIVE
- `NEXTAUTH_SECRET` ✅
- `nextauth_secret` ❌
- Check for extra spaces in values

### Issue 5: Build Failed

**Solution:**

- Go to Deployments → Click latest deployment
- Check "Building" logs for errors
- If there are errors, share them with me

## 📸 What I Need to Help You

Please provide:

1. **Screenshot of Vercel Environment Variables page**
   - Shows all 5 variables are saved
   - Shows which environments are selected

2. **Screenshot of latest deployment status**
   - Shows "Ready" or error status

3. **Screenshot of browser console errors**
   - F12 → Console tab
   - Any red errors when trying to login

4. **Which URL are you testing?**
   - Copy the exact URL from browser address bar

5. **What happens when you try to login?**
   - Does the page refresh and stay on login page?
   - Do you see any error message?
   - Does browser console show errors?

## 🎯 Quick Test Script

To verify your Vercel environment is working, do this:

1. Make sure you've **REDEPLOYED** after adding variables
2. Add `ALLOW_ENV_DEBUG=true` to Vercel
3. **REDEPLOY** again
4. Visit: `https://your-vercel-url/debug/env`
5. Share screenshot of that page

This will tell us EXACTLY which variables are missing or wrong.

## 💡 Expected vs Actual

### What SHOULD Happen:

1. Enter username: `PCAadmin`
2. Enter password: `Powerca@25`
3. Click "Admin Sign In"
4. Page shows "Authenticating..." for 1-2 seconds
5. **Redirects to `/admin` dashboard**

### What MIGHT Be Happening:

- ❌ Page refreshes, stays on login page
- ❌ Error message appears
- ❌ Page seems to load but nothing happens
- ❌ Console shows errors

**Tell me which one you're seeing!**

## 🆘 Emergency Checklist

If nothing works, verify EACH of these:

- [ ] I added all 5 environment variables to Vercel
- [ ] Each variable has Production, Preview, Development checked
- [ ] I clicked SAVE for each variable
- [ ] I went to Deployments tab
- [ ] I clicked Redeploy (not just refresh page)
- [ ] I waited for "Ready" status
- [ ] I'm using the correct Vercel URL
- [ ] I'm using username `PCAadmin` (not email)
- [ ] I'm using password `Powerca@25` (case sensitive)
- [ ] I checked browser console for errors

---

**Next Steps:**

1. Double-check you REDEPLOYED after adding variables
2. Add `ALLOW_ENV_DEBUG=true` and redeploy
3. Visit `/debug/env` and share screenshot
4. Share any error messages from browser console

# ⚠️ CRITICAL: Vercel Environment Variables Setup

## 🔴 URGENT: Admin login is NOT working on Vercel because environment variables are NOT set!

All tests pass locally, which confirms the issue is **ONLY** on Vercel.

---

## ✅ Step-by-Step Guide to Fix Vercel

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Select your project: **PowerCA_Website**
3. Click on **Settings** (top navigation)
4. Click on **Environment Variables** (left sidebar)

### Step 2: Add These EXACT Variables

Copy and paste these **EXACTLY** into Vercel:

#### Variable 1: NEXTAUTH_URL

```
Name: NEXTAUTH_URL
Value: https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app
Environment: Production, Preview, Development (select all three)
```

#### Variable 2: NEXTAUTH_SECRET

```
Name: NEXTAUTH_SECRET
Value: AZEQp25nsVGN3EzYj4fVdaU5+wWQgwTP3mrNok60cog=
Environment: Production, Preview, Development (select all three)
```

#### Variable 3: NEXT_PUBLIC_SUPABASE_URL

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://gevwzzrztriktdazfbpw.supabase.co
Environment: Production, Preview, Development (select all three)
```

#### Variable 4: NEXT_PUBLIC_SUPABASE_ANON_KEY

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdldnd6enJ6dHJpa3RkYXpmYnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzA3OTYsImV4cCI6MjA3MzEwNjc5Nn0.QCS5nlpPkMYWkimxJjqugai5bT_KrVcNcghE81orG5k
Environment: Production, Preview, Development (select all three)
```

#### Variable 5: SUPABASE_SERVICE_ROLE_KEY

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdldnd6enJ6dHJpa3RkYXpmYnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzMDc5NiwiZXhwIjoyMDczMTA2Nzk2fQ.DjB7jQpszsh7lFsTYhwgHLDatDkZECwEcpUI_AJnSIs
Environment: Production, Preview, Development (select all three)
```

### Step 3: IMPORTANT - Select ALL Environments

For **EACH** variable above, make sure you check:

- ✅ Production
- ✅ Preview
- ✅ Development

This ensures the variables work on all deployments.

### Step 4: Save and Redeploy

1. Click **Save** for each variable
2. After adding all 5 variables, go to **Deployments** tab
3. Find your latest deployment
4. Click the **3 dots (...)** menu
5. Click **Redeploy**
6. Wait 1-2 minutes for deployment to complete

---

## 🧪 Test After Deployment

Once deployment is complete:

### Test 1: Admin Login

```
URL: https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app/admin-login

Credentials:
Username: PCAadmin
Password: Admin@123
```

OR

```
Username: superadmin
Password: Admin@123
```

### Test 2: Environment Check (Optional)

```
1. Add this variable to Vercel:
   Name: ALLOW_ENV_DEBUG
   Value: true

2. Visit: https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app/debug/env

3. Check all variables show ✅ green checkmarks
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Wrong NEXTAUTH_URL

```
WRONG: http://localhost:3000
WRONG: https://power-ca-website.vercel.app (wrong subdomain)
WRONG: Leaving it blank
```

### ✅ Correct:

```
https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app
```

### ❌ Mistake 2: Not Selecting All Environments

- If you only select "Production", it won't work on preview deployments
- **ALWAYS select all three**: Production, Preview, Development

### ❌ Mistake 3: Typos in Variable Names

- Variable names are CASE SENSITIVE
- `NEXTAUTH_URL` ✅
- `nextauth_url` ❌
- `NEXTAUTH_url` ❌

### ❌ Mistake 4: Forgetting to Redeploy

- Vercel doesn't always auto-redeploy after adding variables
- **ALWAYS manually redeploy** after adding/changing variables

---

## 📋 Verification Checklist

Before testing, verify:

- [ ] All 5 environment variables are added to Vercel
- [ ] Each variable has all 3 environments selected (Production, Preview, Development)
- [ ] `NEXTAUTH_URL` exactly matches your Vercel URL (no typos)
- [ ] `NEXTAUTH_SECRET` is copied correctly (no extra spaces)
- [ ] Supabase keys are copied correctly (complete strings)
- [ ] You clicked **Save** for each variable
- [ ] You **Redeployed** the application
- [ ] Deployment shows "Ready" status

---

## 🔍 If It Still Doesn't Work

### Check 1: Verify Variables on Vercel

1. Go to Settings → Environment Variables
2. You should see **exactly 5 variables**
3. Each should say "Production, Preview, Development"

### Check 2: Check Deployment Logs

1. Go to Deployments tab
2. Click on your latest deployment
3. Look for errors in the build logs
4. Search for "NEXTAUTH" or "SUPABASE" in logs

### Check 3: Use Debug Page

1. Add `ALLOW_ENV_DEBUG=true` to Vercel
2. Redeploy
3. Visit `/debug/env`
4. All items should show ✅ green checks

### Check 4: Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for error messages
5. Share error messages with me

---

## 📸 Visual Guide

When adding a variable in Vercel, it should look like this:

```
┌─────────────────────────────────────────────┐
│ Name:                                       │
│ NEXTAUTH_URL                                │
├─────────────────────────────────────────────┤
│ Value:                                      │
│ https://power-ca-website-git-feat...       │
├─────────────────────────────────────────────┤
│ Environments:                               │
│ ✅ Production                               │
│ ✅ Preview                                  │
│ ✅ Development                              │
├─────────────────────────────────────────────┤
│          [Cancel]  [Save]                   │
└─────────────────────────────────────────────┘
```

---

## 🎯 Expected Result

After setting all variables and redeploying:

1. Visit admin login page
2. Enter: `PCAadmin` / `Admin@123`
3. Click "Admin Sign In"
4. **You should be redirected to `/admin` dashboard**
5. You should see the admin dashboard with sidebar

---

## 💡 Why This Is the Issue

**Local works ✅** because:

- `.env.local` file has all variables
- Next.js reads from `.env.local` automatically

**Vercel doesn't work ❌** because:

- Vercel doesn't have access to your `.env.local` file
- You must manually add variables in Vercel dashboard
- Vercel only knows about variables you explicitly add

---

## 🆘 Still Need Help?

If you still can't login after following ALL steps above:

1. Take a screenshot of your Vercel Environment Variables page
2. Take a screenshot of any error in browser console
3. Share the screenshots
4. I'll help debug further

---

**Remember:** The login works perfectly locally (all tests pass). The ONLY issue is missing environment variables on Vercel!

# Admin Setup Guide

## Problem
You're getting a "TypeError: fetch failed" error when trying to login with admin credentials because the Supabase connection is not properly configured.

## Solution

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project (if you don't have one)
3. Wait for the project to be fully provisioned

### Step 2: Get Your Supabase Credentials
1. Go to your project settings: `https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api`
2. Copy the following values:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - Anon/Public key
   - Service Role key (keep this secret!)

### Step 3: Update Environment Variables
1. Open `.env` file in your project root
2. Replace the Supabase placeholder values with your actual credentials:
```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### Step 4: Create Admin Users Table in Supabase
1. Go to the SQL Editor in your Supabase dashboard
2. Run the following SQL:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create a policy for service role access
CREATE POLICY "Service role can access admin_users" ON admin_users
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
```

### Step 5: Create a Superadmin User
After creating the table, run this script to create your superadmin user:

```bash
node scripts/setup-admin.ts
```

This will create a superadmin user with:
- Username: `superadmin`
- Password: `SuperAdmin@123`

**Important:** Change this password immediately after first login!

### Step 6: Test the Connection
Run this script to verify everything is working:

```bash
node scripts/test-supabase-connection.js
```

You should see:
- ✅ admin_users table exists!
- ✅ Found 1 admin user(s)
- ✅ Supabase connection successful!

### Step 7: Login
1. Restart your development server: `npm run dev`
2. Go to `/admin-login`
3. Login with:
   - Username: `superadmin`
   - Password: `SuperAdmin@123`

## Troubleshooting

### "fetch failed" Error
- Check your internet connection
- Verify Supabase project is active (not paused)
- Ensure the Supabase URL is correct
- Check if firewall is blocking the connection

### "admin_users table does not exist"
- Run the SQL script in Step 4
- Verify you're connected to the correct Supabase project

### "Invalid credentials"
- Run `node scripts/setup-admin.ts` to create the admin user
- Verify you're using the correct username and password
- Check if the account is locked (too many failed attempts)

## Security Notes
1. Never commit `.env` files with real credentials to version control
2. Use strong passwords for admin accounts
3. Enable 2FA for your Supabase project
4. Regularly rotate your service role keys
5. Monitor admin login attempts for suspicious activity
# Using Existing Users Table for Registration

## Overview
Your Supabase database already has a `users` table. This guide shows how to update it for the registration system and ensure data flows correctly from the website to the database and displays in the admin panel.

## Step 1: Update Your Users Table

Since you already have a `users` table in Supabase, you need to add the missing columns for registration. Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns to support registration fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS user_role TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS professional_type TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS membership_no TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS registration_no TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS institute_name TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_role ON public.users(user_role);
```

Or run the complete migration from: `supabase/migrations/002_update_users_table_for_registration.sql`

## Step 2: Verify Your Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

## Step 3: How the System Works

### Registration Flow:
1. User fills out form at `/auth/register`
2. Form data is sent to `/api/auth/register`
3. API validates the data and stores it in the `users` table
4. Success message is shown to the user

### Data Storage:
The registration API now:
- Stores data in the existing `users` table (not a new registrations table)
- Uses these column mappings:
  - `name` → name
  - `email` → email
  - `username` → username
  - `password` → password (hashed)
  - `phone` → phone
  - `user_role` → "Professional" or "Student"
  - `professional_type` → CA/CMA/CS/NA (for professionals)
  - `membership_no` → 6-digit membership number (for professionals)
  - `registration_no` → Registration number (for students)
  - `institute_name` → Institute name (for students)

### Admin Panel:
- Fetches data from `/api/auth/register` (GET method)
- API reads from the `users` table
- Displays all registered users at `/admin/customers`

## Step 4: Test the Complete Flow

1. **Register a new user:**
   - Go to http://localhost:3000/auth/register
   - Fill out the form (Professional or Student)
   - Submit

2. **Check Supabase:**
   - Go to your Supabase dashboard
   - Navigate to Table Editor → users
   - You should see the new registration

3. **View in Admin Panel:**
   - Go to http://localhost:3000/admin/customers
   - The registered user should appear in the list

## Current Status

✅ **What's Working:**
- Registration API updated to use `users` table
- Data is being stored correctly with all fields
- Admin panel fetches from the users table
- Fallback to local file storage if Supabase is not configured

## Troubleshooting

### Data not appearing in Supabase?
1. Check console for any errors
2. Verify your environment variables are correct
3. Make sure the users table has all required columns
4. Check that RLS policies allow inserts

### Data not showing in Admin Panel?
1. Verify the registration was successful
2. Check browser console for API errors
3. Ensure Supabase is returning data correctly
4. Try refreshing the admin page

### Getting "duplicate key" errors?
- Email or username already exists in the database
- Use unique values for each registration

## SQL to View Your Data

Run this in Supabase SQL Editor to see all registrations:

```sql
SELECT
  id,
  name,
  email,
  username,
  phone,
  user_role,
  professional_type,
  membership_no,
  registration_no,
  institute_name,
  is_verified,
  created_at
FROM public.users
ORDER BY created_at DESC;
```

## Next Steps

1. **Monitor registrations** through Supabase dashboard
2. **Add email verification** if needed
3. **Implement login functionality** using the stored credentials
4. **Add more admin features** like user editing/deletion
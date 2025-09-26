# Testing Registration with Supabase

## 🔴 Current Issue
The server logs show: **"Supabase not configured, using file storage as fallback"**

This means your `.env.local` file still has placeholder values. You need to update it with your actual Supabase credentials.

## Step 1: Update Your Environment Variables

Edit your `.env.local` file and replace the placeholders with your actual Supabase credentials:

```env
# REPLACE THESE WITH YOUR ACTUAL VALUES FROM SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

### Where to find these values in Supabase:
1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon)
3. Click on **API**
4. You'll see:
   - **Project URL**: Copy this for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: Copy this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: Copy this for `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Restart the Development Server

After updating `.env.local`, you MUST restart the server:

1. Press `Ctrl+C` in the terminal to stop the server
2. Run `npm run dev` again to restart with new environment variables

## Step 3: Test Professional Registration

1. Open: http://localhost:3000/auth/register
2. Fill in the form:
   - **Name**: Test Professional
   - **Email**: testpro@example.com
   - **Username**: testpro
   - **Phone**: 9876543210
   - **Password**: Test@1234
   - **Role**: Select **Professional**
   - **Professional Type**: CA
   - **Membership Number**: 123456

3. Click **Register**

## Step 4: Verify in Supabase

1. Go to your Supabase dashboard
2. Click on **Table Editor**
3. Select the **users** table
4. You should see the new registration with all fields:
   - email: testpro@example.com
   - username: testpro
   - user_role: Professional
   - professional_type: CA
   - membership_no: 123456

## Step 5: Check Admin Panel

1. Open: http://localhost:3000/admin/customers
2. You should see the registered user in the list
3. Click on the user to see all details

## Step 6: Test Student Registration

1. Go back to: http://localhost:3000/auth/register
2. Fill in:
   - **Name**: Test Student
   - **Email**: teststudent@example.com
   - **Username**: teststudent
   - **Phone**: 9876543211
   - **Password**: Test@1234
   - **Role**: Select **Student**
   - **Registration Number**: STU2024001
   - **Institute Name**: Test University

3. Click **Register**
4. Verify in Supabase and Admin Panel

## 🚨 Troubleshooting

### Still seeing "Supabase not configured"?
✅ **Solution**:
- Make sure you saved `.env.local` after editing
- Restart the server (Ctrl+C then npm run dev)
- Check that the URL starts with `https://` and ends with `.supabase.co`

### Getting "fetch failed" errors?
✅ **Solution**:
- Verify your Supabase project is active (not paused)
- Check your internet connection
- Ensure the credentials are copied correctly (no extra spaces)

### Data not appearing in Supabase?
✅ **Solution**:
- Check browser console (F12) for errors
- Verify the users table exists with all required columns
- Check RLS policy is enabled for INSERT

### Success message but no data in table?
✅ **Solution**:
- The data might be in `users.json` file (local storage)
- This happens when Supabase is not properly configured
- Check the server terminal for "Supabase not configured" message

## ✅ Success Indicators

You'll know it's working when:
1. After registration, you see: "Registration successful! Your data has been saved to the database."
2. Server logs DON'T show "Supabase not configured"
3. Data appears in Supabase users table
4. Admin panel shows the registered users

## Current Data Storage

Right now, based on the logs, your registrations are being saved to:
- **Local file**: `users.json` in your project root
- This is the fallback when Supabase is not configured

Once you update `.env.local` and restart, it will automatically switch to Supabase!
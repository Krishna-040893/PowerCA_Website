# Supabase Database Setup for Registration System

## Overview
This document explains how to set up your Supabase database to store registration data for the PowerCA website.

## Prerequisites
1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: Your Supabase project URL
   - **Anon Key**: The public anon key
   - **Service Role Key**: The service role key (keep this secret!)

## Step 2: Update Environment Variables

Update your `.env.local` file with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 3: Create the Registration Table

### Option A: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `supabase/migrations/001_create_registrations_table.sql`
4. Click "Run" to execute the SQL

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Step 4: Verify Table Creation

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. You should see a new table called `registrations` with the following columns:
   - id (UUID, Primary Key)
   - created_at (Timestamp)
   - updated_at (Timestamp)
   - name (Text)
   - email (Text, Unique)
   - username (Text, Unique)
   - phone (Text)
   - password_hash (Text)
   - role (Text - 'professional' or 'student')
   - professional_type (Text - for professionals)
   - membership_number (Text - for professionals)
   - registration_number (Text - for students)
   - institute_name (Text - for students)
   - is_verified (Boolean)
   - is_active (Boolean)
   - And other metadata fields

## Step 5: Test the Registration Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/auth/register

3. Fill out the registration form:
   - For Professional: Provide professional type and membership number
   - For Student: Provide registration number and institute name

4. Submit the form

5. Check your Supabase dashboard:
   - Go to Table Editor > registrations
   - You should see the new registration entry

6. Check the admin panel:
   - Navigate to http://localhost:3000/admin/customers
   - You should see the registered user in the list

## Features Implemented

### Database Features
- **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed
- **Data Validation**: Role-specific fields are validated at the database level
- **Unique Constraints**: Email and username must be unique
- **Row Level Security (RLS)**: Enabled with policies for secure access
- **Indexes**: Optimized for fast queries on common fields

### Application Features
- **Graceful Fallback**: If Supabase is not configured, data is saved to a local JSON file
- **Password Security**: Passwords are hashed using bcrypt before storage
- **Validation**: Both client-side and server-side validation
- **Admin Dashboard**: View all registered users in the admin panel
- **Role-Based Registration**: Different fields for Professionals vs Students

## Troubleshooting

### Issue: "Supabase not configured" message
**Solution**: Ensure your environment variables are correctly set in `.env.local`

### Issue: Table creation fails
**Solution**: Check that you have the correct permissions in your Supabase project

### Issue: Registration fails with "duplicate key" error
**Solution**: The email or username already exists. Use unique values.

### Issue: Admin panel shows no data
**Solution**:
1. Check that registrations are being saved to the `registrations` table
2. Verify your Supabase credentials are correct
3. Check browser console for any errors

## Security Notes

1. **Never commit** your `.env.local` file to version control
2. **Service Role Key** should only be used on the server-side
3. **RLS Policies** are configured to protect user data
4. **Password Hashing** ensures passwords are never stored in plain text

## Next Steps

After successful setup:
1. Test the registration flow thoroughly
2. Configure email verification (optional)
3. Set up additional authentication providers if needed
4. Customize the registration form fields as required
5. Monitor the registration stats view in Supabase dashboard

## Support

If you encounter any issues:
1. Check the server logs in your terminal
2. Check the browser console for client-side errors
3. Review the Supabase dashboard logs
4. Ensure all environment variables are correctly set
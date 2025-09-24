# Fix Registration Issues - Complete Guide

## Problem
Registration form shows "Registration failed. Please try again." even with correct field inputs.

## Root Cause
The `users` table doesn't exist in the Supabase database, causing the registration API to fail.

## Solution Steps

### Step 1: Create Users Table in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (gevwzzrztriktdazfbpw)
3. Navigate to **SQL Editor** in the left sidebar
4. Open the file `supabase/setup-users-table.sql` from this repository
5. Copy and paste the entire SQL content into the SQL Editor
6. Click **RUN** to execute the SQL commands

### Step 2: Verify Table Creation

After running the SQL, verify the table was created:
1. Go to **Table Editor** in Supabase Dashboard
2. You should see a `users` table with all the necessary columns

### Step 3: Test Registration

1. Open your website at http://localhost:3000/register
2. Fill in the registration form:
   - **Name**: Test User (only letters and spaces)
   - **Email**: test@example.com
   - **Username**: testuser (only letters, min 3 chars)
   - **Mobile**: 9876543210 (exactly 10 digits)
   - **Password**: Test@123 (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   - **Role**: Select either Professional or Student

   For **Professional**:
   - Professional Type: Select CA/CMA/CS/NA
   - Membership No: 123456 (exactly 6 digits)

   For **Student**:
   - Registration No: ABC123 (uppercase letters and numbers)
   - Institute Name: TestInstitute (only letters, no spaces)

3. Click **Register**
4. You should see "Registration successful! Please sign in."

### Step 4: Check Email Notifications

The system will automatically send emails:
- **To User**: Registration confirmation with their details
- **Note**: If using Resend in test mode, emails might only go to verified addresses

### Step 5: View Registrations in Admin Panel

1. Navigate to http://localhost:3000/admin/registrations
2. You'll see a list of all registered users
3. Admin can view details like:
   - Name, Email, Username, Phone
   - User Type (Professional/Student)
   - Professional details (if applicable)
   - Registration date and status

## Features Implemented

### 1. Registration System
- ✅ Form validation with specific field requirements
- ✅ Password strength requirements
- ✅ Role-based fields (Professional/Student)
- ✅ Data stored in Supabase database
- ✅ Duplicate email/username prevention

### 2. Email System
- ✅ Sends confirmation email to users
- ✅ Beautiful HTML email template
- ✅ Includes all registration details
- ✅ Resend API integration

### 3. Admin Features
- ✅ View all registrations at `/admin/registrations`
- ✅ Filter and search capabilities
- ✅ User management interface

### 4. Affiliate System (Ready for Implementation)
- Database tables already created
- Affiliate profiles table
- Referrals tracking table
- Commission management system

## Next Steps for Affiliate System

To enable affiliate functionality:

1. **User promotes to Affiliate**:
   - Admin can promote any registered user to affiliate role
   - System generates unique affiliate code
   - Creates affiliate profile automatically

2. **Affiliate Dashboard** (at `/affiliate/dashboard`):
   - View referral statistics
   - Track commissions
   - Get referral link
   - Update payment details

3. **Referral Tracking**:
   - Track registrations via affiliate links
   - Calculate commissions automatically
   - Monitor conversion rates

## API Endpoints

- `POST /api/registrations` - Create new registration
- `GET /api/registrations` - Get all registrations (admin)
- `POST /api/auth/register` - Alternative registration endpoint
- `GET /api/admin/users` - Get all users (admin)

## Troubleshooting

### If registration still fails:

1. **Check Supabase Connection**:
   ```
   - Verify .env.local has correct Supabase URL and keys
   - Check if Supabase project is active
   ```

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for any error messages in Console tab

3. **Check Server Logs**:
   - Look at the terminal where you ran `npm run dev`
   - Check for any error messages

4. **Verify Database**:
   - Go to Supabase Dashboard > Table Editor
   - Check if users table exists
   - Try inserting a test record manually

## Database Schema

The `users` table includes:
- Basic info: id, email, username, name, phone
- Authentication: password (hashed), verification tokens
- Role management: role (admin/subscriber/affiliate), user_type
- Professional fields: professional_type, membership_no, firm_name
- Student fields: registration_no, institute_name
- Status: is_verified, is_active, email_verified
- Tracking: last_login, login_count, ip_address

## Security Features

- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- Row Level Security (RLS) in Supabase
- Service role for admin operations

## Support

If you encounter any issues:
1. Check the error messages in browser console
2. Review server logs in terminal
3. Verify all environment variables are set correctly
4. Ensure Supabase project is running and accessible
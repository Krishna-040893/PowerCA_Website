# How to Access Admin Panel

## Initial Setup

### Step 1: Create Admin Account

1. Navigate to: http://localhost:3000/setup
2. Fill in the admin account details:
   - Name: Your full name
   - Email: admin@example.com
   - Username: admin
   - Password: (at least 8 characters)
3. Click "Create Admin Account"
4. You'll be redirected to login page

### Step 2: Login as Admin

1. Go to: http://localhost:3000/auth/login
2. Enter your admin credentials:
   - Email: (the email you used during setup)
   - Password: (the password you created)
3. Click "Sign In"

### Step 3: Access Admin Panel

After logging in, you can access:
- **Admin Dashboard**: http://localhost:3000/admin
- **User Management**: http://localhost:3000/admin/users
- **Registration Management**: http://localhost:3000/admin/registrations

## Important URLs

- **Setup Page** (first time only): http://localhost:3000/setup
- **Login Page**: http://localhost:3000/auth/login
- **Admin Panel**: http://localhost:3000/admin
- **User Management**: http://localhost:3000/admin/users

## System Flow

1. **First Time Setup**:
   - Go to `/setup` to create the first admin account
   - This page is only accessible when no admin exists

2. **Regular Access**:
   - Go to `/auth/login` to sign in
   - Admin users can access `/admin/*` pages
   - Subscribers are redirected to regular dashboard
   - Affiliates are redirected to affiliate dashboard

3. **Role Management**:
   - Admin can change user roles from the User Management page
   - Available roles: admin, subscriber, affiliate
   - When promoting to affiliate, a profile is automatically created

## Test Credentials (After Setup)

Once you've created your admin account, you can:
1. Register new users at `/auth/register`
2. Login as admin and manage their roles
3. Test different role-based access

## Troubleshooting

### If you can't access admin:
1. Make sure you've run the database migrations
2. Check that Supabase is properly configured in `.env.local`
3. Create an admin account at `/setup`
4. Clear browser cookies and try logging in again

### If registration data isn't saving:
1. Check Supabase connection
2. Ensure the `users` table exists (run migration 003_complete_user_system.sql)
3. Check browser console for errors

### Current Status:
✅ Registration form saves to database
✅ Email sending works
✅ Authentication works with NextAuth
✅ Role-based access control implemented
✅ Admin can change user roles
✅ Affiliate system ready
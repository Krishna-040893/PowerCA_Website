# Setup Instructions for PowerCA Website

## Database Setup

### 1. Run Database Migrations

The system now includes a complete user management system with role-based access control. To set up your database, you need to run the following migrations in your Supabase project:

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project (gevwzzrztriktdazfbpw)

2. **Run Migrations in Order**
   - Navigate to SQL Editor
   - Run each migration file in order:

   a. `supabase/migrations/003_complete_user_system.sql`
      - Creates the complete user management system
      - Sets up roles (admin, subscriber, affiliate)
      - Creates affiliate profiles and referral tracking tables

### 2. Create Initial Admin User

After running the migrations, create your first admin user:

```bash
# Using curl or Postman, make a POST request to:
POST http://localhost:3000/api/admin/users

# Request body:
{
  "email": "admin@example.com",
  "username": "admin",
  "password": "SecurePassword123!",
  "name": "Admin User"
}
```

### 3. Test Registration Flow

1. **Register a New User**
   - Go to http://localhost:3000/register
   - Fill in the registration form
   - User will be created with default role "subscriber"

2. **Admin Dashboard**
   - Login as admin
   - Go to http://localhost:3000/admin/users
   - You can change user roles from subscriber to affiliate

3. **Affiliate Flow**
   - When a user is promoted to affiliate:
     - They're redirected to profile creation on next login
     - After creating profile, they access affiliate dashboard
     - They get a unique referral code
     - They can track referrals and earnings

## Features Implemented

### ✅ Registration System
- User registration data now stores correctly in Supabase
- Support for Professional and Student user types
- Email verification system ready

### ✅ Role Management
- Three roles: admin, subscriber, affiliate
- Admin can change user roles
- Role changes are logged in admin_actions_log table

### ✅ Affiliate System
- Individual dashboard for affiliates
- Profile creation page for new affiliates
- Referral tracking system
- Commission calculation ready
- Unique affiliate codes generated automatically

### ✅ Access Control
- Middleware redirects based on user role
- Affiliates redirected to their dashboard
- Non-affiliates can't access affiliate pages
- Only admins can access admin pages

## Environment Variables

Ensure your `.env.local` file has all required variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gevwzzrztriktdazfbpw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Email Service
RESEND_API_KEY=your-resend-api-key
```

## Testing the System

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Registration**:
   - Go to /register
   - Create a new account
   - Check Supabase dashboard to confirm data is saved

3. **Test Admin Functions**:
   - Login as admin
   - Go to /admin/users
   - Change a user's role to affiliate

4. **Test Affiliate Functions**:
   - Login as an affiliate user
   - Complete profile creation
   - Access affiliate dashboard
   - Copy referral link and test referral tracking

## Troubleshooting

### If registration data isn't saving:
1. Check Supabase connection in `.env.local`
2. Ensure migrations have been run
3. Check browser console for errors
4. Verify RLS policies are correctly set

### If role changes aren't working:
1. Ensure you're logged in as admin
2. Check admin_actions_log table for errors
3. Verify affiliate_profiles table exists

### If affiliate redirect isn't working:
1. Check middleware.ts configuration
2. Ensure user role is correctly set in database
3. Clear browser cookies and login again

## Next Steps

1. Implement session management with NextAuth
2. Add email verification system
3. Create commission payout system
4. Add analytics for affiliates
5. Implement referral link tracking with cookies
# PowerCA Website - Testing Guide

## System Overview

The PowerCA website has a complete user registration and affiliate management system with the following features:

### URLs
- **User Website**: http://localhost:3002/
- **Admin Panel**: http://localhost:3002/admin/

## Features Implemented

### 1. User Registration System

#### Registration Form (http://localhost:3002/register)
- **Dynamic form fields based on role selection**:
  - **Professional Role**: Shows Professional Type (CA/CMA/CS/NA) and Membership Number fields
  - **Student Role**: Shows Registration Number and Institute Name fields

#### Data Storage
- All registration data is stored in Supabase `registrations` table
- Fields stored include:
  - Basic info: name, email, username, phone, password (hashed)
  - Role-specific data: professional_type, membership_no, registration_no, institute_name
  - System fields: role, is_affiliate, affiliate_status, created_at

### 2. Admin Panel Features

#### Registration Management (http://localhost:3002/admin/registrations)
- View all registered users
- Search by name, email, username, or ID
- Filter by role (Professional/Student)
- Export to CSV
- Real-time statistics (total, professionals, students, today's registrations)

#### Main Admin Dashboard (http://localhost:3002/admin/)
- **Registrations Tab**:
  - Lists all users from Supabase
  - **"Make Affiliate" button**: Converts selected user to affiliate member
  - When clicked, it:
    1. Updates user role to 'affiliate' in registrations table
    2. Sets is_affiliate = true and affiliate_status = 'approved'
    3. Creates entry in affiliate_profiles table with:
       - Default 10% commission rate
       - Payment method set to bank_transfer
       - Status set to active
       - Copies relevant data from registration

### 3. Affiliate System

#### Affiliate Profile Table Structure
The system creates an `affiliate_profiles` table with:
- User identification (user_id, user_email)
- Professional data (company_name, membership_no, registration_no, institute_name)
- Commission tracking (commission_rate, total_referrals, total_commission)
- Payment details (payment_method, bank details, UPI)
- Status management (status, approved_at, created_at, updated_at)

## Testing Instructions

### Step 1: Start the Development Server
```bash
cd D:\PowerCA_Website-main\PowerCA_Website-main
npm run dev -- -p 3002
```

### Step 2: Test User Registration
1. Navigate to http://localhost:3002/register
2. Fill in the registration form:
   - Enter name, email, username, mobile (10 digits), password
   - Select role:
     - **Professional**: Select type (CA/CMA/CS/NA) and enter 6-digit membership number
     - **Student**: Enter registration number and institute name
3. Submit the form
4. Verify success message appears

### Step 3: Verify Registration in Admin Panel
1. Navigate to http://localhost:3002/admin/
2. Login with admin credentials if required
3. Click on "Registrations" tab or navigate to http://localhost:3002/admin/registrations
4. Verify the new registration appears in the list
5. Check that all fields are displayed correctly

### Step 4: Test Affiliate Conversion
1. In the main admin dashboard (http://localhost:3002/admin/)
2. Find a registered user in the list
3. Click the "Make Affiliate" button for that user
4. Verify success message appears
5. Check that the user's role is updated to 'affiliate'

### Step 5: Verify Affiliate Profile Creation
1. Check Supabase dashboard to verify:
   - User's role is updated to 'affiliate' in registrations table
   - New entry created in affiliate_profiles table
   - All relevant data is copied correctly

### Step 6: Test Export Functionality
1. In the registrations page (http://localhost:3002/admin/registrations)
2. Click "Export CSV" button
3. Verify CSV file downloads with all registration data

## Database Requirements

### Required Supabase Tables

#### 1. registrations table
```sql
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT,
  professional_type TEXT,
  membership_no TEXT,
  registration_no TEXT,
  institute_name TEXT,
  is_affiliate BOOLEAN DEFAULT false,
  affiliate_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 2. affiliate_profiles table
Run the SQL script at `supabase/create-affiliate-profiles-table.sql` to create this table.

## Troubleshooting

### Registration not showing in admin panel
- Check browser console for errors
- Verify Supabase connection in `.env.local`
- Check RLS policies are disabled or configured correctly
- Ensure service role key is being used in admin endpoints

### Make Affiliate button not working
- Check browser console for errors
- Verify affiliate_profiles table exists in Supabase
- Check that user has required permissions

### Form validation errors
- Professional: Membership number must be exactly 6 digits
- Student: Registration number must be uppercase letters and numbers only
- Institute name must contain only letters (no spaces)

## API Endpoints

### Registration Endpoints
- `POST /api/auth/register` - Create new user registration
- `GET /api/auth/register` - Fetch all registrations (admin)
- `POST /api/registrations` - Alternative registration endpoint
- `GET /api/registrations` - Fetch registrations for admin panel

### Debug Endpoints
- `GET /api/debug/registrations` - Test Supabase connection and fetch sample data

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key (optional, for emails)
```

## Success Indicators

✅ Registration form shows role-specific fields dynamically
✅ Registration data saves to Supabase
✅ Admin panel displays all registrations
✅ Search and filter functionality works
✅ Export to CSV works
✅ Make Affiliate button converts users successfully
✅ Affiliate profile is created in database
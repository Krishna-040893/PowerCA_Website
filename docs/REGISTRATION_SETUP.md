# Registration System Setup Guide

## Step 1: Create the Registrations Table in Supabase

1. **Go to your Supabase SQL Editor:**
   - Open: https://supabase.com/dashboard/project/gevwzzrztriktdazfbpw/sql/new
   - Or navigate: Dashboard → SQL Editor → New Query

2. **Copy and paste this SQL:**

```sql
-- Drop existing table if needed (only if you want to start fresh)
-- DROP TABLE IF EXISTS registrations;

-- Create registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  professional_type VARCHAR(50),
  membership_no VARCHAR(50),
  registration_no VARCHAR(50),
  institute_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_username ON registrations(username);
CREATE INDEX idx_registrations_created_at ON registrations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Enable all access" ON registrations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Add a trigger to auto-update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. **Click the "Run" button** to execute the SQL

4. **Verify the table was created:**
   - Go to Table Editor: https://supabase.com/dashboard/project/gevwzzrztriktdazfbpw/editor
   - You should see "registrations" table in the list

## Step 2: Test the Registration Form

1. **Open the website:** http://localhost:3010

2. **Navigate to Registration:**
   - Click "Sign In" in the navigation
   - Click "Register" link

3. **Fill out the form:**
   - Name: Test User
   - Email: test@example.com
   - Username: testuser
   - Phone: 1234567890
   - Password: Test@123
   - Confirm Password: Test@123
   - Select Role: Chartered Accountant
   - Professional Type: CA
   - Membership No: CA12345
   - Registration No: REG123
   - Institute Name: Test Institute

4. **Submit the form**

## Step 3: Verify Data is Stored

### Check in Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/gevwzzrztriktdazfbpw/editor/registrations
2. You should see the registration data

### Check via Admin Page:
1. Open: http://localhost:3010/admin/registrations
2. You should see a table with all registrations

## Step 4: Verify Email is Sent

Check the email inbox for the address you registered with. You should receive a confirmation email from PowerCA.

## Troubleshooting

### If table creation fails:
- Make sure you're logged into Supabase
- Ensure you have the correct project selected
- Check for any error messages in the SQL editor

### If registration doesn't save:
1. Check browser console for errors (F12 → Console)
2. Check the Next.js terminal for server errors
3. Verify environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://gevwzzrztriktdazfbpw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   RESEND_API_KEY=re_BHpihZ2L_GdXPKMHC5Usraiwi1Xc5JZEW
   ```

### If emails don't send:
- Check Resend dashboard: https://resend.com/emails
- Verify the API key is correct
- Check for email errors in the server console

## Testing the Setup

Run this command to test if everything is working:
```bash
node scripts/setup-supabase-tables.js
```

This will:
- Check if the table exists
- Insert a test registration
- Show the total count of registrations

## Admin Access

The admin page is available at:
http://localhost:3010/admin/registrations

Features:
- View all registrations
- Export to CSV
- Refresh data
- See registration details
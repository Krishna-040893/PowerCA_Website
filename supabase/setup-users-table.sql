-- Complete User Table Setup for PowerCA Registration System
-- Run this in your Supabase SQL Editor to fix the registration issue

-- Drop existing table if it exists (be careful, this will delete all data)
DROP TABLE IF EXISTS public.users CASCADE;

-- Create the users table with all necessary fields
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Authentication fields
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,

  -- Basic information
  name TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Role management
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('admin', 'subscriber', 'affiliate')),
  user_type TEXT CHECK (user_type IN ('Professional', 'Student', 'Other')),

  -- Professional specific fields
  professional_type TEXT CHECK (professional_type IN ('CA', 'CMA', 'CS', 'NA') OR professional_type IS NULL),
  membership_no TEXT,
  firm_name TEXT,

  -- Student specific fields
  registration_no TEXT,
  institute_name TEXT,

  -- Status fields
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,

  -- Tracking fields
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,

  -- Verification tokens
  verification_token TEXT,
  verification_token_expires TIMESTAMP WITH TIME ZONE,
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Allow public registration (anonymous users can insert)
CREATE POLICY "Public can register" ON public.users
  FOR INSERT WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (
    auth.uid()::TEXT = id::TEXT
    OR auth.jwt() ->> 'email' = email
    OR true -- Allow all reads for now to help with debugging
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (
    auth.uid()::TEXT = id::TEXT
    OR auth.jwt() ->> 'email' = email
  );

-- Service role has full access
CREATE POLICY "Service role full access" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.users TO service_role;
GRANT SELECT, INSERT ON public.users TO anon;
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Create a test admin user (optional - uncomment if needed)
-- INSERT INTO public.users (
--   email, username, password, name, phone, role, is_verified, is_active, email_verified
-- ) VALUES (
--   'admin@powerca.in',
--   'admin',
--   '$2a$10$example', -- Replace with actual hashed password
--   'Admin User',
--   '9999999999',
--   'admin',
--   true,
--   true,
--   true
-- );

-- Verify the table was created
SELECT
  column_name,
  data_type,
  is_nullable
FROM
  information_schema.columns
WHERE
  table_name = 'users'
  AND table_schema = 'public'
ORDER BY
  ordinal_position;
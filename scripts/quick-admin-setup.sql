-- Quick setup for admin user in Supabase
-- Run this entire SQL in your Supabase SQL Editor

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE
);

-- Insert admin user with credentials:
-- Username: PCAadmin
-- Password: Powerca@25
INSERT INTO public.admin_users (username, password_hash, email, is_active)
VALUES (
  'PCAadmin',
  '$2b$12$S7mhVrBvBt3sH9Anyu0leurrVrLnE0pxGJRSH5RnfwvplY4wloRg2',
  'contact@powerca.in',
  true
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active;

-- Verify the admin was created
SELECT username, email, is_active, created_at
FROM public.admin_users
WHERE username = 'PCAadmin';
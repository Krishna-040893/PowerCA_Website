-- First, ensure the admin_users table exists
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users(is_active);

-- Add RLS (Row Level Security)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create a policy that only allows authenticated service role to access
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
CREATE POLICY "Service role can manage admin users" ON public.admin_users
  FOR ALL
  USING (true); -- Allow access for now, you can restrict this later

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_admin_updated_at ON public.admin_users;
CREATE TRIGGER set_admin_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_updated_at();

-- Now insert the admin user
-- Password: Powerca@25 (hashed with bcrypt, 12 rounds)
-- Note: This hash was generated for the password "Powerca@25"
INSERT INTO public.admin_users (
  username,
  password_hash,
  email,
  is_active
) VALUES (
  'PCAadmin',
  '$2b$12$S7mhVrBvBt3sH9Anyu0leurrVrLnE0pxGJRSH5RnfwvplY4wloRg2', -- This is bcrypt hash of "Powerca@25"
  'contact@powerca.in',
  true
)
ON CONFLICT (username)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  updated_at = TIMEZONE('utc', NOW());

-- Verify the admin user was created
SELECT username, email, is_active, created_at FROM public.admin_users WHERE username = 'PCAadmin';
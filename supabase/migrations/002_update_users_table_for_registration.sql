-- Add missing columns to the existing users table for registration functionality
-- Run this after the initial users table has been created

-- Add username column if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add user_role column for Professional/Student distinction
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS user_role TEXT CHECK (user_role IN ('professional', 'student', 'Professional', 'Student'));

-- Add professional-specific columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS professional_type TEXT CHECK (
  (LOWER(user_role) = 'professional' AND professional_type IN ('CA', 'CMA', 'CS', 'NA'))
  OR (LOWER(user_role) != 'professional' AND professional_type IS NULL)
);

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS membership_no TEXT;

-- Add student-specific columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS registration_no TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS institute_name TEXT;

-- Add additional tracking columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS ip_address INET;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create indexes for the new columns for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_role ON public.users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Update existing RLS policies to be more permissive for registration

-- Drop the old registration policy if it exists
DROP POLICY IF EXISTS "Allow public registration" ON public.users;

-- Create new registration policy that allows anonymous users to insert
CREATE POLICY "Allow public registration" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Create policy for service role to have full access
CREATE POLICY "Service role full access" ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant additional permissions
GRANT ALL ON public.users TO service_role;

-- Create a view for registration statistics
CREATE OR REPLACE VIEW public.user_registration_stats AS
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN LOWER(user_role) = 'professional' THEN 1 END) as total_professionals,
  COUNT(CASE WHEN LOWER(user_role) = 'student' THEN 1 END) as total_students,
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as users_last_7_days,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as users_last_30_days,
  COUNT(CASE WHEN professional_type = 'CA' THEN 1 END) as total_ca,
  COUNT(CASE WHEN professional_type = 'CMA' THEN 1 END) as total_cma,
  COUNT(CASE WHEN professional_type = 'CS' THEN 1 END) as total_cs,
  COUNT(CASE WHEN professional_type = 'NA' THEN 1 END) as total_na
FROM public.users
WHERE is_active = true;

-- Grant permissions for the view
GRANT SELECT ON public.user_registration_stats TO authenticated;
GRANT SELECT ON public.user_registration_stats TO service_role;
GRANT SELECT ON public.user_registration_stats TO anon;
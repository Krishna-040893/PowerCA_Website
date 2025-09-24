-- Create registrations table for storing user registration data
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Basic user information
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,

  -- Role information
  role TEXT NOT NULL CHECK (role IN ('professional', 'student')),

  -- Professional specific fields
  professional_type TEXT CHECK (
    (role = 'professional' AND professional_type IN ('CA', 'CMA', 'CS', 'NA'))
    OR (role != 'professional' AND professional_type IS NULL)
  ),
  membership_number TEXT CHECK (
    (role = 'professional' AND membership_number IS NOT NULL)
    OR (role != 'professional' AND membership_number IS NULL)
  ),

  -- Student specific fields
  registration_number TEXT CHECK (
    (role = 'student' AND registration_number IS NOT NULL)
    OR (role != 'student' AND registration_number IS NULL)
  ),
  institute_name TEXT CHECK (
    (role = 'student' AND institute_name IS NOT NULL)
    OR (role != 'student' AND institute_name IS NULL)
  ),

  -- Additional fields
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_token TEXT,
  verification_token_expires TIMESTAMP WITH TIME ZONE,

  -- Metadata
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_registrations_username ON public.registrations(username);
CREATE INDEX idx_registrations_role ON public.registrations(role);
CREATE INDEX idx_registrations_is_active ON public.registrations(is_active);
CREATE INDEX idx_registrations_created_at ON public.registrations(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy for authenticated users to read their own data
CREATE POLICY "Users can view own registration" ON public.registrations
  FOR SELECT USING (auth.uid()::TEXT = id::TEXT OR auth.jwt() ->> 'email' = email);

-- Policy for admins to view all registrations
CREATE POLICY "Admins can view all registrations" ON public.registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
  );

-- Policy for service role to manage all registrations
CREATE POLICY "Service role can manage all" ON public.registrations
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.registrations TO service_role;
GRANT SELECT ON public.registrations TO authenticated;
GRANT SELECT ON public.registrations TO anon;

-- Create a view for admin dashboard
CREATE OR REPLACE VIEW public.registration_stats AS
SELECT
  COUNT(*) as total_registrations,
  COUNT(CASE WHEN role = 'professional' THEN 1 END) as total_professionals,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as registrations_last_7_days,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as registrations_last_30_days
FROM public.registrations
WHERE is_active = true;

-- Grant permissions for the view
GRANT SELECT ON public.registration_stats TO authenticated;
GRANT SELECT ON public.registration_stats TO service_role;

-- Optional: Create a function to safely insert registration data
CREATE OR REPLACE FUNCTION public.create_registration(
  p_name TEXT,
  p_email TEXT,
  p_username TEXT,
  p_phone TEXT,
  p_password_hash TEXT,
  p_role TEXT,
  p_professional_type TEXT DEFAULT NULL,
  p_membership_number TEXT DEFAULT NULL,
  p_registration_number TEXT DEFAULT NULL,
  p_institute_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_registration_id UUID;
BEGIN
  INSERT INTO public.registrations (
    name, email, username, phone, password_hash, role,
    professional_type, membership_number, registration_number, institute_name
  ) VALUES (
    p_name, p_email, p_username, p_phone, p_password_hash, p_role,
    p_professional_type, p_membership_number, p_registration_number, p_institute_name
  ) RETURNING id INTO v_registration_id;

  RETURN v_registration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.create_registration TO anon;
GRANT EXECUTE ON FUNCTION public.create_registration TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_registration TO service_role;
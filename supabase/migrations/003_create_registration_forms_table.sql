-- Migration: create registration_forms table for professional & student registrations

-- 1. Create the table if it does not exist
CREATE TABLE IF NOT EXISTS public.registration_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Core fields
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  -- Role information
  role TEXT NOT NULL,

  -- Professional specific data
  professional_type TEXT CHECK (
    (role = 'professional' AND professional_type IN ('CA', 'CMA', 'CS', 'NA'))
    OR (role = 'student' AND professional_type IS NULL)
    OR professional_type IS NULL
  ),
  membership_number TEXT CHECK (
    (role = 'professional' AND membership_number IS NOT NULL)
    OR (role = 'student' AND membership_number IS NULL)
    OR membership_number IS NULL
  ),

  -- Student specific data
  registration_number TEXT CHECK (
    (role = 'student' AND registration_number IS NOT NULL)
    OR (role = 'professional' AND registration_number IS NULL)
    OR registration_number IS NULL
  ),
  institute_name TEXT CHECK (
    (role = 'student' AND institute_name IS NOT NULL)
    OR (role = 'professional' AND institute_name IS NULL)
    OR institute_name IS NULL
  ),

  -- Terms acknowledgement
  agreed_to_terms BOOLEAN DEFAULT false,

  -- Status flags
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0
);

-- 2. Indexes to speed up lookups
CREATE INDEX IF NOT EXISTS idx_registration_forms_email ON public.registration_forms(email);
CREATE INDEX IF NOT EXISTS idx_registration_forms_username ON public.registration_forms(username);
CREATE INDEX IF NOT EXISTS idx_registration_forms_role ON public.registration_forms(role);
CREATE INDEX IF NOT EXISTS idx_registration_forms_created_at ON public.registration_forms(created_at DESC);

-- 3. Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_registration_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registration_forms_updated_at ON public.registration_forms;
CREATE TRIGGER trg_registration_forms_updated_at
  BEFORE UPDATE ON public.registration_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_registration_forms_updated_at();

-- 4. Row Level Security and policies
ALTER TABLE public.registration_forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages registration_forms" ON public.registration_forms;
CREATE POLICY "Service role manages registration_forms"
  ON public.registration_forms
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

GRANT ALL ON public.registration_forms TO service_role;
GRANT SELECT ON public.registration_forms TO authenticated;
GRANT SELECT ON public.registration_forms TO anon;

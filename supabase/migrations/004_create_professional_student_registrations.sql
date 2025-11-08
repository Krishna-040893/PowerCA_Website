-- Migration: create dedicated tables for professional and student registrations

-- Professional registrations table
CREATE TABLE IF NOT EXISTS public.professional_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,

  role TEXT DEFAULT 'professional' CHECK (role = 'professional'),
  professional_type TEXT NOT NULL CHECK (professional_type IN ('CA', 'CMA', 'CS', 'NA')),
  membership_number TEXT NOT NULL,
  agreed_to_terms BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_professional_registrations_email ON public.professional_registrations(email);
CREATE INDEX IF NOT EXISTS idx_professional_registrations_membership ON public.professional_registrations(membership_number);
CREATE INDEX IF NOT EXISTS idx_professional_registrations_created_at ON public.professional_registrations(created_at DESC);

CREATE OR REPLACE FUNCTION public.set_professional_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_professional_registrations_updated_at ON public.professional_registrations;
CREATE TRIGGER trg_professional_registrations_updated_at
  BEFORE UPDATE ON public.professional_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_professional_registrations_updated_at();

ALTER TABLE public.professional_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages professional_registrations" ON public.professional_registrations;
CREATE POLICY "Service role manages professional_registrations"
  ON public.professional_registrations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

GRANT ALL ON public.professional_registrations TO service_role;
GRANT SELECT ON public.professional_registrations TO authenticated;
GRANT SELECT ON public.professional_registrations TO anon;

-- Student registrations table
CREATE TABLE IF NOT EXISTS public.student_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,

  role TEXT DEFAULT 'student' CHECK (role = 'student'),
  institute_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  agreed_to_terms BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_student_registrations_email ON public.student_registrations(email);
CREATE INDEX IF NOT EXISTS idx_student_registrations_registration ON public.student_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_student_registrations_created_at ON public.student_registrations(created_at DESC);

CREATE OR REPLACE FUNCTION public.set_student_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_registrations_updated_at ON public.student_registrations;
CREATE TRIGGER trg_student_registrations_updated_at
  BEFORE UPDATE ON public.student_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_student_registrations_updated_at();

ALTER TABLE public.student_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages student_registrations" ON public.student_registrations;
CREATE POLICY "Service role manages student_registrations"
  ON public.student_registrations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

GRANT ALL ON public.student_registrations TO service_role;
GRANT SELECT ON public.student_registrations TO authenticated;
GRANT SELECT ON public.student_registrations TO anon;

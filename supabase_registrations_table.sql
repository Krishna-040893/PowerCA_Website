-- Create registrations table in Supabase
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL, -- Note: In production, this should be hashed
  role TEXT NOT NULL,
  professional_type TEXT,
  membership_no TEXT,
  registration_no TEXT,
  institute_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy to allow insert for everyone (registration is public)
CREATE POLICY "Allow public registration inserts" ON registrations
  FOR INSERT WITH CHECK (true);

-- Policy to allow admins to view all registrations
-- You may want to customize this based on your auth setup
CREATE POLICY "Allow admins to view registrations" ON registrations
  FOR SELECT USING (true);
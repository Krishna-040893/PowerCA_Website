-- Drop existing table if you want to recreate it (uncomment if needed)
-- DROP TABLE IF EXISTS registrations CASCADE;

-- Create the registrations table with all fields from the form
CREATE TABLE IF NOT EXISTS registrations (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic user information (all required)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  password VARCHAR(255) NOT NULL,

  -- Role information
  role VARCHAR(50) NOT NULL CHECK (role IN ('chartered_accountant', 'Professional', 'Student', 'Other')),

  -- Professional-specific fields (optional, for Professional role)
  professional_type VARCHAR(50),
  membership_no VARCHAR(6),

  -- Student-specific fields (optional, for Student role)
  registration_no VARCHAR(50),
  institute_name VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Ensure unique email and username
  CONSTRAINT unique_email UNIQUE (email),
  CONSTRAINT unique_username UNIQUE (username)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_username ON registrations(username);
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone);
CREATE INDEX IF NOT EXISTS idx_registrations_role ON registrations(role);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public users can insert their own registration" ON registrations;
DROP POLICY IF EXISTS "Service role has full access" ON registrations;
DROP POLICY IF EXISTS "Users can view their own registration" ON registrations;

-- Create RLS policies
-- Allow anyone to insert (register)
CREATE POLICY "Public users can insert their own registration" ON registrations
  FOR INSERT
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role has full access" ON registrations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow users to view their own registration
CREATE POLICY "Users can view their own registration" ON registrations
  FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON registrations TO service_role;
GRANT INSERT ON registrations TO anon;
GRANT SELECT ON registrations TO authenticated;
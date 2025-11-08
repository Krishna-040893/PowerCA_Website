-- Create contacts table for storing contact form submissions
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  notes TEXT
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for the contact form)
CREATE POLICY "Allow public insert" ON public.contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow admins to view all contacts
CREATE POLICY "Allow admin select" ON public.contacts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow admins to update contacts
CREATE POLICY "Allow admin update" ON public.contacts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.contacts IS 'Stores contact form submissions from the website';

-- Update/Create bookings table in Supabase
-- This script safely checks for existing objects

-- 1. Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can read bookings" ON public.bookings;

-- 3. Create or update bookings table
-- First check if table exists, if not create it
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  firm_name TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  type TEXT DEFAULT 'demo',
  status TEXT DEFAULT 'CONFIRMED',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Recreate policies with proper permissions
-- Allow anyone to create bookings
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read bookings (needed for checking available slots)
CREATE POLICY "Anyone can read bookings" ON public.bookings
  FOR SELECT USING (true);

-- 6. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(email);

-- 7. Grant necessary permissions
GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT ON public.bookings TO authenticated;

-- Test query to verify table is working
SELECT COUNT(*) as total_bookings FROM public.bookings;
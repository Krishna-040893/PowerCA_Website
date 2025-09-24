-- Create bookings table in Supabase
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create bookings table
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

-- 3. Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow public inserts (for demo bookings)
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- 5. Create policy to allow reading bookings (optional - for admin)
CREATE POLICY "Authenticated users can read bookings" ON public.bookings
  FOR SELECT USING (true);

-- 6. Create indexes for better performance
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_email ON public.bookings(email);
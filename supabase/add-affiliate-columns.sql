-- Add missing columns to registrations table
-- Run this FIRST before creating affiliate_profiles table

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS affiliate_id TEXT UNIQUE;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT false;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS affiliate_details_completed BOOLEAN DEFAULT false;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS affiliate_status TEXT DEFAULT 'pending';
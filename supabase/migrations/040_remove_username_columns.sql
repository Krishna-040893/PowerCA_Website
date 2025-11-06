-- Migration: Remove username columns from registration tables
-- Reason: Username field is not used in registration forms and should not be stored

-- 1. Remove username column from registration_forms table
ALTER TABLE public.registration_forms
DROP COLUMN IF EXISTS username;

-- 2. Drop the username index from registration_forms if it exists
DROP INDEX IF EXISTS idx_registration_forms_username;

-- 3. Remove username column from professional_registrations table
ALTER TABLE public.professional_registrations
DROP COLUMN IF EXISTS username;

-- 4. Remove username column from student_registrations table
ALTER TABLE public.student_registrations
DROP COLUMN IF EXISTS username;

-- Note: This migration is safe to run as the username field is no longer used
-- in the registration API and was auto-generated, not user-provided.

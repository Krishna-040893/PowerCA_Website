-- Migration: Add profile photo support with Supabase Storage
-- This migration creates storage bucket and adds profile_photo_url columns

-- 1. Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for profile photos bucket
-- Since we're using NextAuth (not Supabase Auth), we'll allow service_role full access
-- and make the bucket public for reading

-- Allow service role full access (for backend API operations)
CREATE POLICY "Service role can manage all profile photos"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');

-- Allow public read access to profile photos
CREATE POLICY "Public can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- 3. Add profile_photo_url column to registration_forms table
ALTER TABLE public.registration_forms
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_registration_forms_profile_photo
ON public.registration_forms(profile_photo_url)
WHERE profile_photo_url IS NOT NULL;

-- 4. Add profile_photo_url column to affiliate_registrations table
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_profile_photo
ON public.affiliate_registrations(profile_photo_url)
WHERE profile_photo_url IS NOT NULL;

-- 5. Create helper function to delete old profile photo when updating
CREATE OR REPLACE FUNCTION delete_old_profile_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.profile_photo_url IS NOT NULL AND NEW.profile_photo_url IS NOT NULL AND OLD.profile_photo_url != NEW.profile_photo_url THEN
    -- Extract the file path from the old URL and delete from storage
    -- This is a placeholder - actual deletion should be handled in application code
    -- to avoid circular dependencies between database and storage
    NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to clean up old photos (optional - can be handled in app code instead)
-- Commented out to avoid complexity, handle in application code
-- CREATE TRIGGER cleanup_old_registration_photo
--   BEFORE UPDATE ON public.registration_forms
--   FOR EACH ROW
--   EXECUTE FUNCTION delete_old_profile_photo();

-- CREATE TRIGGER cleanup_old_affiliate_photo
--   BEFORE UPDATE ON public.affiliate_registrations
--   FOR EACH ROW
--   EXECUTE FUNCTION delete_old_profile_photo();

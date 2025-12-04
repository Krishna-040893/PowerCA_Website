-- Migration: Add agreement document tracking fields to registration_forms
-- This tracks whether users have downloaded and uploaded their signed agreement

-- Add columns to track agreement document status
ALTER TABLE public.registration_forms
ADD COLUMN IF NOT EXISTS agreement_downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_file_path TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_signed_digitally BOOLEAN DEFAULT FALSE;

-- Create index for quick lookup of users who haven't completed agreement
CREATE INDEX IF NOT EXISTS idx_registration_forms_agreement_status
ON public.registration_forms(agreement_downloaded_at, agreement_uploaded_at);

-- Create storage bucket for signed agreement documents and digital signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signed-agreements',
  'signed-agreements',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = ARRAY['application/pdf', 'image/png']::text[];

-- Storage policies for signed-agreements bucket
DROP POLICY IF EXISTS "Users can upload their own signed agreements" ON storage.objects;
CREATE POLICY "Users can upload their own signed agreements"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'signed-agreements' AND
  auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Users can view their own signed agreements" ON storage.objects;
CREATE POLICY "Users can view their own signed agreements"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'signed-agreements' AND
  auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Service role can manage signed agreements" ON storage.objects;
CREATE POLICY "Service role can manage signed agreements"
ON storage.objects FOR ALL
USING (
  bucket_id = 'signed-agreements' AND
  auth.role() = 'service_role'
);

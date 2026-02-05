-- Migration: Add agreement document tracking fields to affiliate_registrations
-- This tracks whether affiliates have downloaded and uploaded their signed agreement

-- Add columns to track agreement document status
ALTER TABLE public.affiliate_registrations
ADD COLUMN IF NOT EXISTS agreement_downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_file_path TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agreement_signing_method TEXT DEFAULT NULL;

-- Create index for quick lookup of affiliates who haven't completed agreement
CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_agreement_status
ON public.affiliate_registrations(agreement_downloaded_at, agreement_uploaded_at);

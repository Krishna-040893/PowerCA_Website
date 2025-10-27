-- Migration: Add invoices storage bucket
-- This migration creates storage bucket for invoice PDFs

-- 1. Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for invoices bucket
-- Allow service role full access (for backend API operations)
CREATE POLICY "Service role can manage all invoices"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'invoices')
WITH CHECK (bucket_id = 'invoices');

-- Allow public read access to invoices (since users need to download their own invoices)
-- In production, you might want to restrict this based on authentication
CREATE POLICY "Public can view invoices"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'invoices');

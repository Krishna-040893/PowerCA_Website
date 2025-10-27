-- Create blog documents storage bucket
-- This bucket will store downloadable documents (PDFs, DOCX, etc.) for blog posts

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-documents',
  'blog-documents',
  true,
  20971520, -- 20MB limit for documents
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view blog documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload blog documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update blog documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete blog documents" ON storage.objects;

-- Allow public to view/download blog documents
CREATE POLICY "Public can view blog documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-documents');

-- Allow anyone to upload blog documents (admin auth is handled at app level)
CREATE POLICY "Anyone can upload blog documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'blog-documents');

-- Allow anyone to update blog documents (admin auth is handled at app level)
CREATE POLICY "Anyone can update blog documents"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'blog-documents');

-- Allow anyone to delete blog documents (admin auth is handled at app level)
CREATE POLICY "Anyone can delete blog documents"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'blog-documents');

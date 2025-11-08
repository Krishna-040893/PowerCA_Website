-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for blog images
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete blog images" ON storage.objects;

-- Allow public viewing of blog images
CREATE POLICY "Public can view blog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Allow anyone to upload blog images (admin auth is handled at app level)
CREATE POLICY "Anyone can upload blog images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'blog-images');

-- Allow anyone to update blog images (admin auth is handled at app level)
CREATE POLICY "Anyone can update blog images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'blog-images');

-- Allow anyone to delete blog images (admin auth is handled at app level)
CREATE POLICY "Anyone can delete blog images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'blog-images');

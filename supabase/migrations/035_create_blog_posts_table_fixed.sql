-- Create blog_posts table for admin-managed blog content (with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL DEFAULT 'PowerCA Team',
  category VARCHAR(100) NOT NULL,
  read_time VARCHAR(50) NOT NULL DEFAULT '5 min read',
  image_url TEXT,
  is_breaking BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_breaking ON public.blog_posts(is_breaking, published_at DESC);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role can delete blog posts" ON public.blog_posts;

-- Create policies
CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can view all blog posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  USING (true);

-- Drop existing functions and triggers if they exist
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
DROP FUNCTION IF EXISTS update_blog_posts_updated_at();

DROP TRIGGER IF EXISTS set_blog_published_at_trigger ON public.blog_posts;
DROP FUNCTION IF EXISTS set_blog_published_at();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Create published_at trigger function
CREATE OR REPLACE FUNCTION set_blog_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published = false OR OLD.is_published IS NULL) THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_blog_published_at_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_published_at();

-- Add comment to table
COMMENT ON TABLE public.blog_posts IS 'Stores blog posts created and managed by admins through the admin panel';

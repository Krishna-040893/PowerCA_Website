-- Add columns for rich blog content features
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS key_dates JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS related_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sidebar_summary JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment explaining the JSONB structure
COMMENT ON COLUMN public.blog_posts.key_points IS 'Array of objects: [{"title": "string", "description": "string", "icon": "string"}]';
COMMENT ON COLUMN public.blog_posts.documents IS 'Array of objects: [{"title": "string", "url": "string", "icon": "string"}]';
COMMENT ON COLUMN public.blog_posts.key_dates IS 'Array of objects: [{"label": "string", "date": "string"}]';
COMMENT ON COLUMN public.blog_posts.related_links IS 'Array of objects: [{"title": "string", "url": "string"}]';
COMMENT ON COLUMN public.blog_posts.sidebar_summary IS 'Object: {"items": [{"label": "string", "value": "string"}]}';

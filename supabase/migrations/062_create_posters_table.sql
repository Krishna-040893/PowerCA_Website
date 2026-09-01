-- Posters shown in the "PowerCA at a Glance" carousel on the homepage.
-- Images are uploaded from the admin portal into the public `posters` storage
-- bucket; this table holds the ordering, alt text and publish state.

CREATE TABLE IF NOT EXISTS public.posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posters_display_order_idx ON public.posters (display_order);
CREATE INDEX IF NOT EXISTS posters_is_published_idx ON public.posters (is_published);

-- Keep updated_at current on every write.
CREATE OR REPLACE FUNCTION public.set_posters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posters_set_updated_at ON public.posters;
CREATE TRIGGER posters_set_updated_at
  BEFORE UPDATE ON public.posters
  FOR EACH ROW
  EXECUTE FUNCTION public.set_posters_updated_at();

-- Visitors may read published posters only. Admin writes go through the API
-- routes using the service role key, which bypasses RLS.
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posters" ON public.posters;
CREATE POLICY "Public can read published posters" ON public.posters
  FOR SELECT
  USING (is_published = true);

-- Public bucket for the poster images themselves. Created by hand in the
-- dashboard; this is here so the migration also works on a fresh project.
INSERT INTO storage.buckets (id, name, public)
VALUES ('socialmedia-posters', 'socialmedia-posters', true)
ON CONFLICT (id) DO NOTHING;

-- A public bucket already serves its objects over the public URL, so no read
-- policy is required. Uploads and deletes are performed server-side with the
-- service role key, which bypasses RLS, so no write policy is granted either.

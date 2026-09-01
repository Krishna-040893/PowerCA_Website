-- Small key/value store for settings the admin portal controls. Currently holds
-- `posters_default_category`, which decides the category the homepage carousel
-- opens on.

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Visitors need to read the setting to render the carousel; writes go through
-- the admin API using the service role key, which bypasses RLS.
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings
  FOR SELECT
  USING (true);

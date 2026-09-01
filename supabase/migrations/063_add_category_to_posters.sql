-- Optional grouping for homepage posters. The carousel builds its filter tabs
-- from the distinct values found here, so leaving it empty simply keeps a
-- poster out of every tab but "All".

ALTER TABLE public.posters ADD COLUMN IF NOT EXISTS category TEXT;

CREATE INDEX IF NOT EXISTS posters_category_idx ON public.posters (category);

-- Add image_source column
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_source text;

-- Add default value for author column so it's optional
ALTER TABLE public.articles ALTER COLUMN author SET DEFAULT 'Sistema';
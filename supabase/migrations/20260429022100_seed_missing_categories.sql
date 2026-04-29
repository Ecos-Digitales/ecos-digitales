-- Seed missing categories for Ecos Digitales
-- Idempotent: safe to re-run.
--
-- If the categories.slug column doesn't have a UNIQUE constraint yet, run this first:
--   CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories(slug);

-- Rename "Aviación" → "Aerolíneas" if it exists and "Aerolíneas" doesn't.
-- This preserves the UUID so any articles already tagged with "Aviación"
-- automatically end up under "Aerolíneas".
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.categories WHERE slug = 'aviacion')
     AND NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'aerolineas') THEN
    UPDATE public.categories
    SET name = 'Aerolíneas',
        slug = 'aerolineas',
        updated_at = now()
    WHERE slug = 'aviacion';
  END IF;
END $$;

-- Insert any of the new categories that don't already exist.
-- ON CONFLICT (slug) DO NOTHING covers the case where the rename above
-- already produced "aerolineas" — the row will simply be skipped.
INSERT INTO public.categories (name, slug, is_active)
VALUES
  ('Innovación',           'innovacion',           true),
  ('Emprendimiento',       'emprendimiento',       true),
  ('Aerolíneas',           'aerolineas',           true),
  ('Criptomonedas',        'criptomonedas',        true),
  ('Nombramientos',        'nombramientos',        true),
  ('Internet',             'internet',             true),
  ('Alianzas',             'alianzas',             true),
  ('Hackathon',            'hackathon',            true),
  ('Computación cuántica', 'computacion-cuantica', true)
ON CONFLICT (slug) DO NOTHING;

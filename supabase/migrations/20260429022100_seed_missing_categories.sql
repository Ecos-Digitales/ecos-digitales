-- Seed missing categories for Ecos Digitales
-- Idempotent: uses ON CONFLICT (slug) DO NOTHING so it can be re-run safely.
--
-- If the categories.slug column doesn't have a UNIQUE constraint yet, run this first:
--   CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories(slug);

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

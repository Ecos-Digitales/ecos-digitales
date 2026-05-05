-- Ecos Digitales — Ediciones del Mes
-- Curated monthly editions with editorial articles + 1 sponsored article per edition.

-- ===========================================================================
-- sponsors: marcas que presentan ediciones
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.sponsors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT NOT NULL,
  tagline     TEXT,
  website_url TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_active ON public.sponsors(is_active);

-- ===========================================================================
-- editions: una por mes calendario
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.editions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT NOT NULL UNIQUE,
  year                  INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  month                 INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  edition_number        INTEGER,                              -- "Edición N°12"
  title                 TEXT,                                 -- override editorial opcional
  hero_description      TEXT NOT NULL,
  cover_image_url       TEXT,
  meta_title            TEXT,                                 -- SEO override
  meta_description      TEXT,                                 -- SEO override
  sponsor_id            UUID REFERENCES public.sponsors(id) ON DELETE SET NULL,
  sponsored_article_id  UUID REFERENCES public.articles(id)  ON DELETE SET NULL,
  is_published          BOOLEAN NOT NULL DEFAULT false,
  published_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(year, month)
);

CREATE INDEX IF NOT EXISTS idx_editions_published ON public.editions(is_published, year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_editions_slug      ON public.editions(slug);

-- ===========================================================================
-- edition_articles: junction con orden curado
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.edition_articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id  UUID NOT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL CHECK (position >= 1 AND position <= 50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(edition_id, article_id),
  UNIQUE(edition_id, position)
);

CREATE INDEX IF NOT EXISTS idx_edition_articles_edition ON public.edition_articles(edition_id, position);
CREATE INDEX IF NOT EXISTS idx_edition_articles_article ON public.edition_articles(article_id);

-- ===========================================================================
-- updated_at triggers
-- ===========================================================================
CREATE TRIGGER trg_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_editions_updated_at
  BEFORE UPDATE ON public.editions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================================================
-- RLS
-- ===========================================================================
ALTER TABLE public.sponsors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edition_articles ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo recursos publicados/activos
CREATE POLICY "Anyone can view active sponsors"
  ON public.sponsors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view published editions"
  ON public.editions FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can view edition_articles of published editions"
  ON public.edition_articles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.editions e
    WHERE e.id = edition_articles.edition_id
      AND e.is_published = true
  ));

-- Admins (cualquier authenticated con rol 'admin') gestionan todo
CREATE POLICY "Admins manage sponsors"
  ON public.sponsors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage editions"
  ON public.editions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage edition_articles"
  ON public.edition_articles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===========================================================================
-- Helper RPC: navegar entre ediciones (anterior / siguiente)
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.get_adjacent_editions(_edition_id UUID)
RETURNS TABLE (
  prev_slug TEXT, prev_year INTEGER, prev_month INTEGER,
  next_slug TEXT, next_year INTEGER, next_month INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH current AS (
    SELECT year, month FROM public.editions WHERE id = _edition_id LIMIT 1
  )
  SELECT
    (SELECT slug FROM public.editions
       WHERE is_published = true
         AND (year, month) < (SELECT year, month FROM current)
       ORDER BY year DESC, month DESC
       LIMIT 1) AS prev_slug,
    (SELECT year FROM public.editions
       WHERE is_published = true
         AND (year, month) < (SELECT year, month FROM current)
       ORDER BY year DESC, month DESC
       LIMIT 1) AS prev_year,
    (SELECT month FROM public.editions
       WHERE is_published = true
         AND (year, month) < (SELECT year, month FROM current)
       ORDER BY year DESC, month DESC
       LIMIT 1) AS prev_month,
    (SELECT slug FROM public.editions
       WHERE is_published = true
         AND (year, month) > (SELECT year, month FROM current)
       ORDER BY year ASC, month ASC
       LIMIT 1) AS next_slug,
    (SELECT year FROM public.editions
       WHERE is_published = true
         AND (year, month) > (SELECT year, month FROM current)
       ORDER BY year ASC, month ASC
       LIMIT 1) AS next_year,
    (SELECT month FROM public.editions
       WHERE is_published = true
         AND (year, month) > (SELECT year, month FROM current)
       ORDER BY year ASC, month ASC
       LIMIT 1) AS next_month;
$$;

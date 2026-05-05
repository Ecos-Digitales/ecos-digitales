-- Seed completo de ediciones históricas (todos los meses pre-2026 con artículos).
--
-- Idea: por cada (año, mes) que tenga al menos 1 artículo publicado, crear
-- una edición con su top 10 humanos-first. Permite que el archivo del index
-- /ediciones tenga toda la historia editorial agrupada por año.
--
-- IMPORTANTE: deshabilita temporalmente el trigger trg_editions_check_articles
-- porque insertamos editions con is_published=true ANTES de poblar
-- edition_articles. Todo en una sola transacción → se mantiene la atomicidad
-- y al finalizar el trigger queda activo de nuevo.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- 0. Ampliar el CHECK constraint del año.
--    El original (en 20260505161133_create_editions.sql) era
--    year >= 2020. Los artículos legacy van desde 2017, así que
--    abrimos a year >= 2000.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.editions DROP CONSTRAINT IF EXISTS editions_year_check;
ALTER TABLE public.editions ADD CONSTRAINT editions_year_check
  CHECK (year >= 2000 AND year <= 2100);

-- ─────────────────────────────────────────────────────────────────────
-- 1. Deshabilitar el trigger temporalmente
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.editions DISABLE TRIGGER trg_editions_check_articles;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Insertar editions para todo (año, mes) < 2026 que tenga artículos.
--    ON CONFLICT (year, month) DO NOTHING preserva las que ya existían.
-- ─────────────────────────────────────────────────────────────────────
WITH months_with_articles AS (
  SELECT DISTINCT
    EXTRACT(YEAR  FROM published_at)::INT AS year,
    EXTRACT(MONTH FROM published_at)::INT AS month
  FROM public.articles
  WHERE status = 'published'
    AND published_at IS NOT NULL
    AND published_at < '2026-01-01'
),
month_lookup AS (
  SELECT * FROM (VALUES
    (1,  'enero',      'Enero'),
    (2,  'febrero',    'Febrero'),
    (3,  'marzo',      'Marzo'),
    (4,  'abril',      'Abril'),
    (5,  'mayo',       'Mayo'),
    (6,  'junio',      'Junio'),
    (7,  'julio',      'Julio'),
    (8,  'agosto',     'Agosto'),
    (9,  'septiembre', 'Septiembre'),
    (10, 'octubre',    'Octubre'),
    (11, 'noviembre',  'Noviembre'),
    (12, 'diciembre',  'Diciembre')
  ) AS t(num, slug, name)
)
INSERT INTO public.editions (
  slug, year, month, hero_description, is_published, published_at
)
SELECT
  ml.slug || '-' || mwa.year,
  mwa.year,
  mwa.month,
  'Las noticias más relevantes de ' || ml.name || ' de ' || mwa.year || '.',
  true,
  -- "Salida pública" simbólica el día 1 del mes siguiente.
  CASE
    WHEN mwa.month = 12 THEN make_timestamptz(mwa.year + 1, 1, 1, 0, 0, 0, 'UTC')
    ELSE make_timestamptz(mwa.year, mwa.month + 1, 1, 0, 0, 0, 'UTC')
  END
FROM months_with_articles mwa
JOIN month_lookup ml ON ml.num = mwa.month
ON CONFLICT (year, month) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 3. Re-seed edition_articles para todas las ediciones < 2026.
--    Borramos lo que haya y re-calculamos top 10 con la heurística
--    humanos-first.
-- ─────────────────────────────────────────────────────────────────────
DELETE FROM public.edition_articles
 WHERE edition_id IN (
   SELECT id FROM public.editions WHERE year < 2026
 );

WITH ranked AS (
  SELECT
    a.id AS article_id,
    EXTRACT(YEAR  FROM a.published_at)::INT AS year,
    EXTRACT(MONTH FROM a.published_at)::INT AS month,
    ROW_NUMBER() OVER (
      PARTITION BY
        EXTRACT(YEAR  FROM a.published_at),
        EXTRACT(MONTH FROM a.published_at)
      ORDER BY
        CASE WHEN a.source = 'AI' THEN 1 ELSE 0 END,
        a.is_featured DESC NULLS LAST,
        a.is_trending DESC NULLS LAST,
        a.is_pinned   DESC NULLS LAST,
        COALESCE(a.views, 0) DESC,
        a.published_at DESC
    ) AS rank
  FROM public.articles a
  WHERE a.status = 'published'
    AND a.published_at IS NOT NULL
    AND a.published_at < '2026-01-01'
)
INSERT INTO public.edition_articles (edition_id, article_id, position)
SELECT
  e.id,
  r.article_id,
  r.rank
FROM ranked r
JOIN public.editions e
  ON e.year  = r.year
 AND e.month = r.month
WHERE r.rank <= 10;

-- ─────────────────────────────────────────────────────────────────────
-- 4. Re-habilitar el trigger
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.editions ENABLE TRIGGER trg_editions_check_articles;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────
-- 5. Reporte
-- ─────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  total_editions  INT;
  total_articles  INT;
  r RECORD;
BEGIN
  SELECT COUNT(*) INTO total_editions
    FROM public.editions
   WHERE year < 2026 AND is_published = true;
  SELECT COUNT(*) INTO total_articles
    FROM public.edition_articles ea
    JOIN public.editions e ON e.id = ea.edition_id
   WHERE e.year < 2026;
  RAISE NOTICE '────────────────────────────────────────────────';
  RAISE NOTICE 'Total ediciones historicas (<2026): %', total_editions;
  RAISE NOTICE 'Total filas edition_articles (<2026): %', total_articles;
  RAISE NOTICE '────────────────────────────────────────────────';
  FOR r IN
    SELECT year, COUNT(*) AS cnt
    FROM public.editions
    WHERE year < 2026
    GROUP BY year
    ORDER BY year DESC
  LOOP
    RAISE NOTICE 'Año %: % ediciones', r.year, r.cnt;
  END LOOP;
END $$;

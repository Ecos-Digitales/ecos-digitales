-- Backfill de oct/nov/dic 2024 redatando 30 artículos AI sin edición asignada.
-- Solo toca artículos que NO están en ningún edition_articles (sin disturbar
-- las top 10 ya curadas de los meses con ediciones existentes).

BEGIN;

-- 1. Verificar candidatos
DO $$
DECLARE
  candidates_count INT;
BEGIN
  SELECT COUNT(*) INTO candidates_count
    FROM public.articles a
    WHERE a.status = 'published'
      AND a.source = 'AI'
      AND a.published_at >= '2024-01-01'
      AND a.published_at <  '2025-01-01'
      AND NOT EXISTS (
        SELECT 1 FROM public.edition_articles ea WHERE ea.article_id = a.id
      );
  RAISE NOTICE 'Candidatos AI sin edición asignada en 2024: %', candidates_count;
  IF candidates_count < 30 THEN
    RAISE EXCEPTION 'No hay 30 artículos disponibles. Encontrados: %', candidates_count;
  END IF;
END $$;

-- 2. Disable trigger
ALTER TABLE public.editions DISABLE TRIGGER trg_editions_check_articles;

-- 3. Redatar 30 artículos a oct/nov/dic 2024 (espaciados cada 3 días)
WITH candidates AS (
  SELECT a.id,
         ROW_NUMBER() OVER (ORDER BY a.published_at DESC, a.id) AS rn
  FROM public.articles a
  WHERE a.status = 'published'
    AND a.source = 'AI'
    AND a.published_at >= '2024-01-01'
    AND a.published_at <  '2025-01-01'
    AND NOT EXISTS (
      SELECT 1 FROM public.edition_articles ea WHERE ea.article_id = a.id
    )
  LIMIT 30
),
new_dates AS (
  SELECT id, rn,
    CASE
      WHEN rn <= 10 THEN make_timestamptz(2024, 10, (rn::int) * 3,        12, 0, 0, 'UTC')
      WHEN rn <= 20 THEN make_timestamptz(2024, 11, ((rn - 10)::int) * 3, 12, 0, 0, 'UTC')
      ELSE              make_timestamptz(2024, 12, ((rn - 20)::int) * 3, 12, 0, 0, 'UTC')
    END AS new_published_at
  FROM candidates
)
UPDATE public.articles a
SET published_at = nd.new_published_at,
    updated_at   = now()
FROM new_dates nd
WHERE a.id = nd.id;

-- 4. Crear las 3 ediciones
INSERT INTO public.editions (slug, year, month, hero_description, is_published, published_at)
VALUES
  ('octubre-2024',   2024, 10, 'Las noticias más relevantes de Octubre de 2024.',   true, '2024-11-01T00:00:00Z'),
  ('noviembre-2024', 2024, 11, 'Las noticias más relevantes de Noviembre de 2024.', true, '2024-12-01T00:00:00Z'),
  ('diciembre-2024', 2024, 12, 'Las noticias más relevantes de Diciembre de 2024.', true, '2025-01-01T00:00:00Z')
ON CONFLICT (year, month) DO NOTHING;

-- 5. Poblar edition_articles de los 3 meses
WITH ranked AS (
  SELECT
    a.id AS article_id,
    EXTRACT(MONTH FROM a.published_at)::INT AS month,
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(MONTH FROM a.published_at)
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
    AND a.published_at >= '2024-10-01'
    AND a.published_at <  '2025-01-01'
)
INSERT INTO public.edition_articles (edition_id, article_id, position)
SELECT
  e.id,
  r.article_id,
  r.rank
FROM ranked r
JOIN public.editions e
  ON e.year = 2024 AND e.month = r.month
WHERE r.rank <= 10
ON CONFLICT (edition_id, article_id) DO NOTHING;

-- 6. Re-enable trigger
ALTER TABLE public.editions ENABLE TRIGGER trg_editions_check_articles;

COMMIT;

-- 7. Reporte
DO $$
DECLARE r RECORD;
BEGIN
  RAISE NOTICE '═══ Estado de las ediciones de 2024 ═══';
  FOR r IN
    SELECT e.slug, COUNT(ea.id) AS articulos
    FROM public.editions e
    LEFT JOIN public.edition_articles ea ON ea.edition_id = e.id
    WHERE e.year = 2024
    GROUP BY e.slug, e.month
    ORDER BY e.month
  LOOP
    RAISE NOTICE 'Edición %: % artículos', r.slug, r.articulos;
  END LOOP;
END $$;

-- Re-seed de las ediciones 2026 con prioridad Humano > AI.
-- Borra la edición de enero (sin data publicada en ese mes) y reasigna
-- los 10 slots de feb-may priorizando notas hechas por personas.
--
-- Heurística NUEVA (en orden de prioridad):
--   1. source ≠ 'AI'             → humanos primero, AI completa solo si faltan
--   2. is_featured DESC          → pick editorial
--   3. is_trending DESC          → pick algorítmico
--   4. is_pinned DESC            → fijado en home
--   5. COALESCE(views, 0) DESC   → tráfico real
--   6. published_at DESC         → recencia (tiebreak)
--
-- Atómico: BEGIN/COMMIT envuelve todo. Si falla, no quedan ediciones a medias.

BEGIN;

-- ──────────────────────────────────────────────────────────────────
-- 1. Borrar la edición de enero (sin artículos posibles)
--    ON DELETE CASCADE en edition_articles → no quedan huérfanos.
-- ──────────────────────────────────────────────────────────────────
DELETE FROM public.editions
 WHERE year = 2026 AND month = 1;

-- ──────────────────────────────────────────────────────────────────
-- 2. Vaciar los edition_articles actuales de feb-may para re-seedear
--    desde cero con la nueva heurística.
-- ──────────────────────────────────────────────────────────────────
DELETE FROM public.edition_articles
 WHERE edition_id IN (
   SELECT id FROM public.editions
    WHERE year = 2026 AND month BETWEEN 2 AND 5
 );

-- ──────────────────────────────────────────────────────────────────
-- 3. Re-insertar top 10 por mes con prioridad humanos > AI.
-- ──────────────────────────────────────────────────────────────────
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
        CASE WHEN a.source = 'AI' THEN 1 ELSE 0 END,  -- humanos (no-AI) primero
        a.is_featured DESC NULLS LAST,
        a.is_trending DESC NULLS LAST,
        a.is_pinned   DESC NULLS LAST,
        COALESCE(a.views, 0) DESC,
        a.published_at DESC
    ) AS rank
  FROM public.articles a
  WHERE a.status = 'published'
    AND a.published_at >= '2026-02-01'
    AND a.published_at <  '2026-06-01'
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

COMMIT;

-- ──────────────────────────────────────────────────────────────────
-- 4. Reporte
-- ──────────────────────────────────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT
      e.slug,
      COUNT(*) FILTER (WHERE a.source <> 'AI') AS humanos,
      COUNT(*) FILTER (WHERE a.source =  'AI') AS ai,
      COUNT(*) AS total
    FROM public.editions e
    LEFT JOIN public.edition_articles ea ON ea.edition_id = e.id
    LEFT JOIN public.articles a         ON a.id           = ea.article_id
    WHERE e.year = 2026 AND e.month BETWEEN 2 AND 5
    GROUP BY e.slug, e.year, e.month
    ORDER BY e.year, e.month
  LOOP
    RAISE NOTICE 'Edición %: % humanos + % AI = % total',
                 r.slug, r.humanos, r.ai, r.total;
  END LOOP;
END $$;

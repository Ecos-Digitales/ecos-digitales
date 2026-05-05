-- Seed: 5 ediciones de 2026 (enero — mayo) + top 10 artículos por mes.
-- IDEMPOTENTE: corre las veces que quieras, no duplica nada.
--
-- Heurística de "relevancia" (orden de prioridad):
--   1. source ≠ 'AI'         — humanos primero, AI solo completa si faltan
--   2. is_featured DESC      — pick editorial
--   3. is_trending DESC      — pick algorítmico
--   4. is_pinned DESC        — fijado por la redacción
--   5. COALESCE(views, 0)    — tráfico real
--   6. published_at DESC     — recencia (tiebreak)
--
-- Después de correr esto, el equipo refina la curación marcando/desmarcando
-- desde el editor de cada nota (panel "Ediciones del Mes").

-- ──────────────────────────────────────────────────────────────────
-- 1. Crear las 5 ediciones (en estado publicado para ver el diseño live).
--    Si ya existen (UNIQUE year+month), no las toca.
-- ──────────────────────────────────────────────────────────────────
INSERT INTO public.editions (
  slug, year, month, edition_number, hero_description, is_published, published_at
)
VALUES
  ('enero-2026',   2026, 1, 1,
    'Las noticias que marcaron el comienzo del 2026 en tecnología, IA y ecosistema digital LATAM.',
    true, '2026-02-01T00:00:00Z'),
  ('febrero-2026', 2026, 2, 2,
    'Un mes corto, pero intenso: avances en inteligencia artificial, ciberseguridad y telcos.',
    true, '2026-03-01T00:00:00Z'),
  ('marzo-2026',   2026, 3, 3,
    'Marzo trajo grandes anuncios, lanzamientos y movimientos estratégicos en la industria tech.',
    true, '2026-04-01T00:00:00Z'),
  ('abril-2026',   2026, 4, 4,
    'Las historias clave de abril 2026: nuevas alianzas, hackathones, financiamientos y más.',
    true, '2026-05-01T00:00:00Z'),
  ('mayo-2026',    2026, 5, 5,
    'Las noticias más relevantes del cierre del primer semestre de 2026.',
    true, now())
ON CONFLICT (year, month) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────
-- 2. Top 10 artículos por mes — heurística aplicada.
--    PARTITION BY year/month genera el ranking 1..N dentro de cada mes;
--    nos quedamos con los rank ≤ 10.
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
    AND a.published_at >= '2026-01-01'
    AND a.published_at <  '2026-06-01'
)
INSERT INTO public.edition_articles (edition_id, article_id, position)
SELECT
  e.id,
  r.article_id,
  r.rank
FROM ranked r
JOIN public.editions e
  ON e.year = r.year
 AND e.month = r.month
WHERE r.rank <= 10
ON CONFLICT (edition_id, article_id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────
-- 3. Reporte: cuántos artículos terminaron asignados a cada edición.
--    (Va a salir en la pestaña "Messages" del SQL Editor.)
-- ──────────────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT e.slug,
           COUNT(ea.id) AS articulos_asignados
    FROM public.editions e
    LEFT JOIN public.edition_articles ea ON ea.edition_id = e.id
    WHERE e.year = 2026 AND e.month BETWEEN 1 AND 5
    GROUP BY e.slug, e.year, e.month
    ORDER BY e.year, e.month
  LOOP
    RAISE NOTICE 'Edición % → % artículos asignados', r.slug, r.articulos_asignados;
  END LOOP;
END $$;

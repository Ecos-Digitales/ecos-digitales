-- Fixes derivados de auditoría post-seed:
--   1. Auto-despublicar ediciones que quedaron vacías (ej. enero 2026 con 0 artículos).
--   2. Agregar índice en editions.sponsored_article_id (lo usa useArticleSponsorship).
--   3. Constraint para garantizar que no se puede publicar una edición sin artículos
--      (a futuro — protege ante errores humanos en el SQL editor).

-- ──────────────────────────────────────────────────────────────────
-- 1. Despublicar ediciones sin artículos asignados
-- ──────────────────────────────────────────────────────────────────
UPDATE public.editions e
SET is_published = false,
    published_at = NULL,
    updated_at = now()
WHERE e.is_published = true
  AND NOT EXISTS (
    SELECT 1 FROM public.edition_articles ea WHERE ea.edition_id = e.id
  );

-- ──────────────────────────────────────────────────────────────────
-- 2. Índice para useArticleSponsorship — busca por sponsored_article_id
-- ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_editions_sponsored_article
  ON public.editions(sponsored_article_id)
  WHERE sponsored_article_id IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────
-- 3. Función + trigger: bloquear publicar edición vacía
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_edition_has_articles_before_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo nos preocupa la transición a publicado
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.edition_articles WHERE edition_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'No se puede publicar una edición sin artículos asignados (slug: %)', NEW.slug
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_editions_check_articles ON public.editions;
CREATE TRIGGER trg_editions_check_articles
  BEFORE UPDATE OR INSERT ON public.editions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_edition_has_articles_before_publish();

-- ──────────────────────────────────────────────────────────────────
-- 4. Reporte final
-- ──────────────────────────────────────────────────────────────────
DO $$
DECLARE
  unpublished INT;
BEGIN
  SELECT COUNT(*) INTO unpublished
  FROM public.editions
  WHERE is_published = false
    AND NOT EXISTS (
      SELECT 1 FROM public.edition_articles ea WHERE ea.edition_id = editions.id
    );
  RAISE NOTICE 'Ediciones vacías ahora en estado borrador: %', unpublished;
END $$;

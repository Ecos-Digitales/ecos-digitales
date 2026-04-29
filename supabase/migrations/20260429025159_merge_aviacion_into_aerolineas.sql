-- Merge "Aviación" into "Aerolíneas"
-- Reasigna todos los artículos categorizados como Aviación a Aerolíneas
-- y elimina la fila "Aviación" de la tabla de categorías.
--
-- Idempotente: safe to re-run. Si Aviación ya no existe, los pasos son no-op.

DO $$
DECLARE
  aviacion_id   UUID;
  aerolineas_id UUID;
  reassigned    INTEGER;
BEGIN
  SELECT id INTO aviacion_id   FROM public.categories WHERE slug = 'aviacion'   LIMIT 1;
  SELECT id INTO aerolineas_id FROM public.categories WHERE slug = 'aerolineas' LIMIT 1;

  IF aviacion_id IS NULL THEN
    RAISE NOTICE 'No existe la categoría "Aviación" — nada que migrar.';
    RETURN;
  END IF;

  IF aerolineas_id IS NULL THEN
    RAISE EXCEPTION 'Falta la categoría "Aerolíneas". Corré primero el seed de categorías.';
  END IF;

  -- Reasignar artículos
  UPDATE public.articles
  SET category_id = aerolineas_id,
      updated_at  = now()
  WHERE category_id = aviacion_id;

  GET DIAGNOSTICS reassigned = ROW_COUNT;
  RAISE NOTICE 'Artículos reasignados de Aviación → Aerolíneas: %', reassigned;

  -- Eliminar la categoría vacía
  DELETE FROM public.categories WHERE id = aviacion_id;
  RAISE NOTICE 'Categoría "Aviación" eliminada.';
END $$;

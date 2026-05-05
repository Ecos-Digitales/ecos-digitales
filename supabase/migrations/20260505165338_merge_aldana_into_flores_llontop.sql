-- Reasignar las 12 notas de "José Gregorio Aldana" a "Javier Flores Llontop"
-- y eliminar el autor obsoleto.
--
-- Idempotente: si las IDs ya no existen, los WHERE devuelven 0 filas y no falla.

BEGIN;

-- 1. Reasignar artículos
UPDATE public.articles
   SET author_id = '7e905451-ba87-439b-87fc-f945168ab3cf'  -- Javier Flores Llontop
 WHERE author_id = '31f6fbc5-bab8-4451-bcc8-b5ca57a1d738'; -- José Gregorio Aldana

-- 2. Eliminar autor obsoleto
DELETE FROM public.authors
 WHERE id = '31f6fbc5-bab8-4451-bcc8-b5ca57a1d738';

COMMIT;

-- 3. Reporte
DO $$
DECLARE
  ll_count INT;
  ald_count INT;
BEGIN
  SELECT COUNT(*) INTO ll_count
    FROM public.articles
   WHERE author_id = '7e905451-ba87-439b-87fc-f945168ab3cf';

  SELECT COUNT(*) INTO ald_count
    FROM public.authors
   WHERE id = '31f6fbc5-bab8-4451-bcc8-b5ca57a1d738';

  RAISE NOTICE 'Javier Flores Llontop ahora tiene % notas', ll_count;
  RAISE NOTICE 'Autor "Jose Gregorio Aldana" eliminado: %',
               CASE WHEN ald_count = 0 THEN 'SI' ELSE 'NO' END;
END $$;

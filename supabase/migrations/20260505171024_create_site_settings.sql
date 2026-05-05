-- Tabla site_settings: configuración global del sitio.
-- Patrón singleton enforced por PRIMARY KEY BOOLEAN + CHECK (id = TRUE).
-- Solo puede existir UNA fila — imposible duplicar.
--
-- Caso de uso inicial: video destacado en el home.
-- A futuro acá pueden ir otros toggles globales (banner sitewide, modo
-- mantenimiento, etc.).

-- ─────────────────────────────────────────────────────────────────
-- 1. Asegurar que existe public.update_updated_at_column().
--    Lovable a veces no la propaga al setup inicial de la DB; mejor
--    crearla acá con CREATE OR REPLACE para que sea idempotente.
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- 2. Tabla
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),

  featured_video_url         TEXT,
  featured_video_title       TEXT,
  featured_video_description TEXT,
  is_video_active            BOOLEAN NOT NULL DEFAULT FALSE,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserta la fila singleton si no existe. Idempotente.
INSERT INTO public.site_settings (id) VALUES (TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- 3. Trigger updated_at
-- ─────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────
-- 4. RLS
--    Nota: en este proyecto solo los admins tienen cuentas (no hay
--    sign-up público). Por eso "TO authenticated" es funcionalmente
--    equivalente a "solo admins" — sin depender de public.has_role()
--    que Lovable no propaga consistentemente al setup inicial.
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Cleanup de intentos previos
DROP POLICY IF EXISTS "Anyone can read site_settings"          ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site_settings"        ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert site_settings"        ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can insert site_settings" ON public.site_settings;

-- Lectura pública (el home necesita leer el video destacado).
CREATE POLICY "Anyone can read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Escritura solo para usuarios autenticados.
CREATE POLICY "Authenticated can update site_settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert site_settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- 5. Verificación
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  has_function BOOLEAN;
  has_table    BOOLEAN;
  has_row      BOOLEAN;
  policy_count INT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) INTO has_function;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables t
    WHERE t.table_schema = 'public' AND t.table_name = 'site_settings'
  ) INTO has_table;

  SELECT EXISTS (SELECT 1 FROM public.site_settings) INTO has_row;

  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'site_settings';

  RAISE NOTICE 'Funcion update_updated_at_column: %', CASE WHEN has_function THEN 'OK' ELSE 'FALTA' END;
  RAISE NOTICE 'Tabla site_settings: %',              CASE WHEN has_table    THEN 'OK' ELSE 'FALTA' END;
  RAISE NOTICE 'Fila singleton: %',                   CASE WHEN has_row      THEN 'OK' ELSE 'FALTA' END;
  RAISE NOTICE 'Policies RLS: % (esperadas 3)',       policy_count;
END $$;

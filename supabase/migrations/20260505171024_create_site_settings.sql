-- Tabla site_settings: configuración global del sitio.
-- Patrón singleton enforced por PRIMARY KEY BOOLEAN + CHECK (id = TRUE).
-- Solo puede existir UNA fila — imposible duplicar.
--
-- Caso de uso inicial: video destacado en el home.
-- A futuro acá pueden ir otros toggles globales (banner sitewide, modo
-- mantenimiento, etc.).

CREATE TABLE IF NOT EXISTS public.site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),

  -- Video destacado del home
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

-- Trigger para actualizar updated_at automáticamente.
DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública (el home necesita leer el video destacado).
CREATE POLICY "Anyone can read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Solo admins pueden modificar.
CREATE POLICY "Admins can update site_settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- INSERT no debería ser necesario (la fila ya existe), pero por las dudas:
CREATE POLICY "Admins can insert site_settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Reporte
DO $$
BEGIN
  RAISE NOTICE 'Tabla site_settings creada. Fila singleton lista para configurar.';
END $$;

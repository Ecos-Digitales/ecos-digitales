import { useEffect, useState, useCallback } from "react";
import { Save, Loader2, Youtube, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface SiteSettings {
  featured_video_url: string;
  featured_video_title: string;
  featured_video_description: string;
  is_video_active: boolean;
}

const EMPTY: SiteSettings = {
  featured_video_url: "",
  featured_video_title: "",
  featured_video_description: "",
  is_video_active: false,
};

const isValidYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  return /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/.test(
    url.trim()
  );
};

const Settings = () => {
  const queryClient = useQueryClient();
  const [initial, setInitial] = useState<SiteSettings>(EMPTY);
  const [form, setForm] = useState<SiteSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "featured_video_url, featured_video_title, featured_video_description, is_video_active"
        )
        .maybeSingle();

      if (error) {
        toast.error("Error al cargar configuración: " + error.message);
        setLoading(false);
        return;
      }

      const loaded: SiteSettings = {
        featured_video_url: data?.featured_video_url ?? "",
        featured_video_title: data?.featured_video_title ?? "",
        featured_video_description: data?.featured_video_description ?? "",
        is_video_active: data?.is_video_active ?? false,
      };
      setInitial(loaded);
      setForm(loaded);
      setLoading(false);
    };
    load();
  }, []);

  const isDirty =
    form.featured_video_url !== initial.featured_video_url ||
    form.featured_video_title !== initial.featured_video_title ||
    form.featured_video_description !== initial.featured_video_description ||
    form.is_video_active !== initial.is_video_active;

  const urlInvalid =
    form.featured_video_url.trim().length > 0 &&
    !isValidYoutubeUrl(form.featured_video_url);

  const handleSave = useCallback(async () => {
    if (urlInvalid) {
      toast.error("La URL de YouTube no es válida");
      return;
    }
    if (form.is_video_active && !form.featured_video_url.trim()) {
      toast.error("No podés activar el video sin una URL");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        featured_video_url: form.featured_video_url.trim() || null,
        featured_video_title: form.featured_video_title.trim() || null,
        featured_video_description: form.featured_video_description.trim() || null,
        is_video_active: form.is_video_active,
      })
      .eq("id", true);

    setSaving(false);

    if (error) {
      toast.error("Error al guardar: " + error.message);
      return;
    }

    setInitial(form);
    toast.success("Configuración guardada");
    // Invalida el cache del home para que se refleje sin recargar
    queryClient.invalidateQueries({ queryKey: ["latestVideo"] });
  }, [form, urlInvalid, queryClient]);

  return (
    <AdminLayout>
      <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-neutral-900 tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Ajustes globales del sitio público
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-black/[0.06] bg-white p-8 flex items-center gap-3 text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando…
          </div>
        ) : (
          <section className="rounded-xl border border-black/[0.06] bg-white p-6 sm:p-8">
            {/* Header del bloque */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-500" />
                  Video destacado en el home
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Aparece en la sección "Último video". Si está desactivado o no hay URL, la sección se oculta.
                </p>
              </div>
            </div>

            {/* Toggle */}
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_video_active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_video_active: e.target.checked }))
                }
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900/10 cursor-pointer"
              />
              <span className="text-sm text-neutral-800 font-medium">
                Mostrar video en el home
              </span>
            </label>

            {/* URL */}
            <div className="mb-5">
              <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-400 mb-2">
                URL de YouTube
              </label>
              <input
                type="url"
                value={form.featured_video_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured_video_url: e.target.value }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className={`h-10 w-full rounded-lg border bg-neutral-50/50 px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/5 transition-all ${
                  urlInvalid ? "border-red-300" : "border-neutral-200 focus:border-neutral-300"
                }`}
              />
              {urlInvalid && (
                <p className="text-xs text-red-500 mt-1.5">
                  Formato no reconocido. Ejemplos válidos: youtube.com/watch?v=ID,
                  youtu.be/ID, youtube.com/shorts/ID.
                </p>
              )}
              {form.featured_video_url && !urlInvalid && (
                <a
                  href={form.featured_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 mt-1.5 transition-colors"
                >
                  Abrir en YouTube
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Title */}
            <div className="mb-5">
              <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-400 mb-2">
                Título
              </label>
              <input
                type="text"
                value={form.featured_video_title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured_video_title: e.target.value }))
                }
                placeholder="Cómo generar $18,000…"
                className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 transition-all"
              />
            </div>

            {/* Description */}
            <div className="mb-7">
              <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-400 mb-2">
                Descripción
              </label>
              <textarea
                value={form.featured_video_description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    featured_video_description: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Una descripción breve que aparece junto al video"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 transition-all resize-y"
              />
            </div>

            {/* Save */}
            <div className="flex items-center justify-end gap-3">
              {isDirty && (
                <span className="text-xs text-amber-600">Cambios sin guardar</span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || saving || urlInvalid}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </button>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LatestVideoResult {
  videoId: string;
  title: string;
  description: string;
}

// Extrae el videoId de una URL de YouTube (siempre 11 caracteres).
const extractVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  // Fallback: cualquier secuencia de 11 chars después de v=
  const fallbackMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (fallbackMatch && fallbackMatch[1]) return fallbackMatch[1];

  return null;
};

/**
 * Lee el video destacado del home desde public.site_settings (singleton).
 * Reemplazo del hook anterior que dependía de un webhook n8n externo
 * que se cae cuando el workflow no está activo.
 *
 * Devuelve null si:
 *   - no está marcado como activo
 *   - falta el URL
 *   - el URL no es de un video de YouTube válido
 *
 * El componente FeaturedVideo del home se oculta automáticamente cuando
 * recibe null y no está cargando.
 */
export const useLatestVideo = () => {
  return useQuery<LatestVideoResult | null>({
    queryKey: ["latestVideo"],
    queryFn: async (): Promise<LatestVideoResult | null> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "featured_video_url, featured_video_title, featured_video_description, is_video_active"
        )
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      if (!data.is_video_active) return null;
      if (!data.featured_video_url) return null;

      const videoId = extractVideoId(data.featured_video_url);
      if (!videoId) return null;

      return {
        videoId,
        title: (data.featured_video_title || "").trim(),
        description: data.featured_video_description || "",
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: 1,
  });
};

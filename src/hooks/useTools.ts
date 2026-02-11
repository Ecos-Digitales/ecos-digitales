import { useQuery } from "@tanstack/react-query";

export interface Tool {
  id: string | number;
  name: string;
  description: string;
  category: string;
  url: string;
  image_url?: string | null;
  slug?: string;
  status?: string;
  [key: string]: unknown;
}

const N8N_TOOLS_URL = "https://platinum-n8n.qj9jfr.easypanel.host/webhook/v2/tools";

export const useTools = () => {
  return useQuery({
    queryKey: ["tools"],
    queryFn: async (): Promise<Tool[]> => {
      const response = await fetch(N8N_TOOLS_URL);
      if (!response.ok) {
        throw new Error("Error al cargar herramientas");
      }

      const data = await response.json();
      console.log("Tools recibidos:", data);

      if (!Array.isArray(data)) return [];

      return data.map((raw: any) => ({
        id: raw.id ?? raw.slug ?? String(Math.random()),
        name: raw.name ?? raw.title ?? "",
        description: raw.description ?? "",
        category: raw.category ?? "General",
        url: raw.url ?? raw.website ?? raw.link ?? "",
        image_url: raw.image_url ?? raw.logo_url ?? raw.icon_url ?? null,
        slug: raw.slug ?? "",
        status: raw.status ?? "active",
        ...raw,
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

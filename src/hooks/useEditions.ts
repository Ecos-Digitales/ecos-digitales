import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ArticleListing } from "@/hooks/useArticles";

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────

export interface Sponsor {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  tagline: string | null;
  website_url: string | null;
}

export interface EditionListing {
  id: string;
  slug: string;
  year: number;
  month: number;
  edition_number: number | null;
  title: string | null;
  hero_description: string;
  cover_image_url: string | null;
  /** Fallback resuelto: imagen del artículo en posición 1 si no hay cover manual. */
  cover_fallback_url: string | null;
  cover_fallback_alt: string | null;
  published_at: string | null;
  sponsor: Sponsor | null;
}

export interface EditionDetail extends EditionListing {
  meta_title: string | null;
  meta_description: string | null;
  sponsored_article: ArticleListing | null;
  articles: ArticleListing[]; // ordered by edition_articles.position ASC
}

export interface AdjacentEditions {
  prev: { slug: string; year: number; month: number } | null;
  next: { slug: string; year: number; month: number } | null;
}

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

const ARTICLE_SUMMARY_SELECT = `
  id, slug, title, excerpt, content,
  featured_image_url, featured_image_alt,
  published_at, reading_time_minutes,
  is_pinned, pinned_order,
  authors!left ( name ),
  categories!left ( name )
`;

type RawArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  published_at: string;
  reading_time_minutes: number;
  is_pinned: boolean | null;
  pinned_order: number | null;
  authors: { name: string } | { name: string }[] | null;
  categories: { name: string } | { name: string }[] | null;
};

const flatten = (rel: { name: string } | { name: string }[] | null): string =>
  Array.isArray(rel) ? rel[0]?.name ?? "" : rel?.name ?? "";

const toArticleListing = (r: RawArticleRow): ArticleListing => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  content: r.content,
  featured_image_url: r.featured_image_url,
  featured_image_alt: r.featured_image_alt,
  published_at: r.published_at,
  reading_time_minutes: r.reading_time_minutes,
  is_pinned: r.is_pinned ?? false,
  pinned_order: r.pinned_order ?? 0,
  category_name: flatten(r.categories),
  author_name: flatten(r.authors),
});

// ──────────────────────────────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────────────────────────────

/** Listado público de ediciones publicadas, orden DESC. */
export const useEditionsList = () =>
  useQuery({
    queryKey: ["editions", "list"],
    queryFn: async (): Promise<EditionListing[]> => {
      // Trae también las primeras posiciones de cada edición para resolver
      // la imagen de portada cuando no hay cover_image_url manual.
      const { data, error } = await supabase
        .from("editions")
        .select(`
          id, slug, year, month, edition_number, title,
          hero_description, cover_image_url, published_at,
          sponsor:sponsors!left ( id, name, slug, logo_url, tagline, website_url ),
          edition_articles!left (
            position,
            articles:articles!left ( featured_image_url, featured_image_alt )
          )
        `)
        .eq("is_published", true)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (error) throw error;

      type RawEdition = {
        id: string;
        slug: string;
        year: number;
        month: number;
        edition_number: number | null;
        title: string | null;
        hero_description: string;
        cover_image_url: string | null;
        published_at: string | null;
        sponsor: Sponsor | Sponsor[] | null;
        edition_articles: Array<{
          position: number;
          articles:
            | { featured_image_url: string | null; featured_image_alt: string | null }
            | { featured_image_url: string | null; featured_image_alt: string | null }[]
            | null;
        }> | null;
      };

      return ((data ?? []) as RawEdition[]).map((row) => {
        const s = Array.isArray(row.sponsor) ? row.sponsor[0] ?? null : row.sponsor;

        // Primera posición disponible con featured_image_url
        const sortedJunction = (row.edition_articles ?? [])
          .slice()
          .sort((a, b) => a.position - b.position);
        let coverFallbackUrl: string | null = null;
        let coverFallbackAlt: string | null = null;
        for (const j of sortedJunction) {
          const art = Array.isArray(j.articles) ? j.articles[0] : j.articles;
          if (art?.featured_image_url) {
            coverFallbackUrl = art.featured_image_url;
            coverFallbackAlt = art.featured_image_alt ?? null;
            break;
          }
        }

        return {
          id: row.id,
          slug: row.slug,
          year: row.year,
          month: row.month,
          edition_number: row.edition_number,
          title: row.title,
          hero_description: row.hero_description,
          cover_image_url: row.cover_image_url,
          cover_fallback_url: coverFallbackUrl,
          cover_fallback_alt: coverFallbackAlt,
          published_at: row.published_at,
          sponsor: s,
        };
      });
    },
    staleTime: 1000 * 60 * 10,
  });

/** Detalle de una edición por slug, con artículos ordenados + nota patrocinada. */
export const useEdition = (slug: string | undefined) =>
  useQuery({
    queryKey: ["editions", "detail", slug],
    enabled: !!slug,
    queryFn: async (): Promise<EditionDetail | null> => {
      if (!slug) return null;

      // ─── Step 1: fetch the edition row to get its id + sponsored_article_id.
      //   (Las queries siguientes dependen del id, así que esta no se puede paralelizar.)
      const { data: editionRow, error: editionErr } = await supabase
        .from("editions")
        .select(`
          id, slug, year, month, edition_number, title,
          hero_description, cover_image_url, meta_title, meta_description,
          published_at, sponsored_article_id,
          sponsor:sponsors!left ( id, name, slug, logo_url, tagline, website_url )
        `)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (editionErr) throw editionErr;
      if (!editionRow) return null;

      // ─── Step 2: junction + sponsored article en paralelo.
      //   Ahorra ~150ms vs ejecutarlas secuencialmente.
      const [junctionRes, sponsoredRes] = await Promise.all([
        supabase
          .from("edition_articles")
          .select(`
            position,
            articles!inner ( ${ARTICLE_SUMMARY_SELECT} )
          `)
          .eq("edition_id", editionRow.id)
          .order("position", { ascending: true }),
        editionRow.sponsored_article_id
          ? supabase
              .from("articles")
              .select(ARTICLE_SUMMARY_SELECT)
              .eq("id", editionRow.sponsored_article_id)
              .eq("status", "published")
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (junctionRes.error) throw junctionRes.error;

      const articles: ArticleListing[] = (junctionRes.data ?? [])
        .map((j) => {
          const a = Array.isArray(j.articles) ? j.articles[0] : j.articles;
          return a ? toArticleListing(a as RawArticleRow) : null;
        })
        .filter((a): a is ArticleListing => a !== null);

      const sponsored: ArticleListing | null = sponsoredRes.data
        ? toArticleListing(sponsoredRes.data as RawArticleRow)
        : null;

      const sponsorRel = Array.isArray(editionRow.sponsor)
        ? editionRow.sponsor[0] ?? null
        : editionRow.sponsor;

      return {
        id: editionRow.id,
        slug: editionRow.slug,
        year: editionRow.year,
        month: editionRow.month,
        edition_number: editionRow.edition_number,
        title: editionRow.title,
        hero_description: editionRow.hero_description,
        cover_image_url: editionRow.cover_image_url,
        meta_title: editionRow.meta_title,
        meta_description: editionRow.meta_description,
        published_at: editionRow.published_at,
        sponsor: sponsorRel as Sponsor | null,
        sponsored_article: sponsored,
        articles,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

/** Edición anterior y siguiente para el footer de navegación. */
export const useAdjacentEditions = (editionId: string | undefined) =>
  useQuery({
    queryKey: ["editions", "adjacent", editionId],
    enabled: !!editionId,
    queryFn: async (): Promise<AdjacentEditions> => {
      if (!editionId) return { prev: null, next: null };
      const { data, error } = await supabase.rpc("get_adjacent_editions", {
        _edition_id: editionId,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return { prev: null, next: null };
      return {
        prev:
          row.prev_slug && row.prev_year != null && row.prev_month != null
            ? { slug: row.prev_slug, year: row.prev_year, month: row.prev_month }
            : null,
        next:
          row.next_slug && row.next_year != null && row.next_month != null
            ? { slug: row.next_slug, year: row.next_year, month: row.next_month }
            : null,
      };
    },
    staleTime: 1000 * 60 * 10,
  });

/** Sponsored info para mostrar el badge en Article.tsx cuando una nota es patrocinada. */
export const useArticleSponsorship = (articleId: string | undefined) =>
  useQuery({
    queryKey: ["editions", "sponsorship", articleId],
    enabled: !!articleId,
    queryFn: async () => {
      if (!articleId) return null;
      const { data, error } = await supabase
        .from("editions")
        .select(`
          slug, year, month, edition_number,
          sponsor:sponsors!left ( name, logo_url )
        `)
        .eq("sponsored_article_id", articleId)
        .eq("is_published", true)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const sponsor = Array.isArray(data.sponsor) ? data.sponsor[0] : data.sponsor;
      return {
        edition_slug: data.slug,
        edition_year: data.year,
        edition_month: data.month,
        edition_number: data.edition_number,
        sponsor_name: sponsor?.name ?? null,
        sponsor_logo: sponsor?.logo_url ?? null,
      };
    },
    staleTime: 1000 * 60 * 30,
  });

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronDown,
  Loader2,
  Plus,
  X,
  Search as SearchIcon,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ADMIN_BASE_PATH } from "@/config/admin";

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────
interface EditionRow {
  id: string;
  slug: string;
  year: number;
  month: number;
  edition_number: number | null;
  title: string | null;
  hero_description: string;
  is_published: boolean;
}

interface ArticleInEdition {
  position: number;
  article_id: string;
  title: string;
  slug: string;
  category_name: string;
  published_at: string;
}

interface ArticleSearchResult {
  id: string;
  title: string;
  slug: string;
  published_at: string;
  category_name: string;
}

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────
const formatMonthYear = (year: number, month: number) => {
  const d = new Date(year, month - 1, 1);
  const formatted = format(d, "MMMM yyyy", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// ──────────────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────────────
const Editions = () => {
  const [editions, setEditions] = useState<EditionRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    const [editionsRes, countsRes] = await Promise.all([
      supabase
        .from("editions")
        .select(
          "id, slug, year, month, edition_number, title, hero_description, is_published"
        )
        .order("year", { ascending: false })
        .order("month", { ascending: false }),
      supabase.from("edition_articles").select("edition_id"),
    ]);

    if (editionsRes.error) {
      toast.error("Error al cargar ediciones: " + editionsRes.error.message);
      setLoading(false);
      return;
    }

    const cnt: Record<string, number> = {};
    for (const r of (countsRes.data ?? []) as { edition_id: string }[]) {
      cnt[r.edition_id] = (cnt[r.edition_id] ?? 0) + 1;
    }
    setEditions((editionsRes.data as EditionRow[]) ?? []);
    setCounts(cnt);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const availableYears = useMemo(() => {
    const ys = new Set(editions.map((e) => e.year));
    return Array.from(ys).sort((a, b) => b - a);
  }, [editions]);

  const filteredEditions = useMemo(() => {
    if (yearFilter === "all") return editions;
    return editions.filter((e) => e.year === yearFilter);
  }, [editions, yearFilter]);

  return (
    <AdminLayout>
      <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-neutral-900 tracking-tight">
            Ediciones
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestionar las 10 noticias de cada edición sin entrar a cada nota
          </p>
        </div>

        {/* Year filter pills */}
        {availableYears.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setYearFilter("all")}
              className={`h-8 px-3 rounded-lg text-sm font-medium transition-colors ${
                yearFilter === "all"
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              Todos
            </button>
            {availableYears.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYearFilter(y)}
                className={`h-8 px-3 rounded-lg text-sm font-medium transition-colors tabular-nums ${
                  yearFilter === y
                    ? "bg-neutral-900 text-white"
                    : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500 py-12 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando ediciones…
          </div>
        ) : filteredEditions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-8 text-center text-sm text-neutral-500">
            No hay ediciones para mostrar.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredEditions.map((e) => (
              <EditionRow
                key={e.id}
                edition={e}
                articleCount={counts[e.id] ?? 0}
                onArticlesChanged={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Edition row (collapsible)
// ──────────────────────────────────────────────────────────────────────
const EditionRow = ({
  edition,
  articleCount,
  onArticlesChanged,
}: {
  edition: EditionRow;
  articleCount: number;
  onArticlesChanged: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<ArticleInEdition[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const monthYear = formatMonthYear(edition.year, edition.month);
  const titleText = edition.title || `Edición de ${monthYear}`;

  const loadArticles = useCallback(async () => {
    setLoadingArticles(true);
    const { data, error } = await supabase
      .from("edition_articles")
      .select(`
        position,
        article_id,
        articles!inner (
          slug,
          title,
          published_at,
          categories!left ( name )
        )
      `)
      .eq("edition_id", edition.id)
      .order("position", { ascending: true });
    setLoadingArticles(false);

    if (error) {
      toast.error("Error al cargar artículos: " + error.message);
      return;
    }

    const mapped: ArticleInEdition[] = ((data ?? []) as unknown as Array<{
      position: number;
      article_id: string;
      articles:
        | {
            slug: string;
            title: string;
            published_at: string;
            categories: { name: string } | { name: string }[] | null;
          }
        | Array<{
            slug: string;
            title: string;
            published_at: string;
            categories: { name: string } | { name: string }[] | null;
          }>;
    }>).map((row) => {
      const a = Array.isArray(row.articles) ? row.articles[0] : row.articles;
      const cat = Array.isArray(a.categories) ? a.categories[0] : a.categories;
      return {
        position: row.position,
        article_id: row.article_id,
        title: a.title,
        slug: a.slug,
        category_name: cat?.name ?? "—",
        published_at: a.published_at,
      };
    });
    setArticles(mapped);
  }, [edition.id]);

  useEffect(() => {
    if (open) loadArticles();
  }, [open, loadArticles]);

  const handleRemove = async (articleId: string) => {
    const { error } = await supabase
      .from("edition_articles")
      .delete()
      .eq("edition_id", edition.id)
      .eq("article_id", articleId);
    if (error) {
      toast.error("Error al quitar: " + error.message);
      return;
    }
    toast.success("Artículo quitado de la edición");
    setArticles((prev) => prev.filter((a) => a.article_id !== articleId));
    onArticlesChanged();
  };

  const handleAdded = (a: ArticleSearchResult, position: number) => {
    setShowAddModal(false);
    setArticles((prev) => [
      ...prev,
      {
        position,
        article_id: a.id,
        title: a.title,
        slug: a.slug,
        category_name: a.category_name,
        published_at: a.published_at,
      },
    ]);
    onArticlesChanged();
  };

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50/60 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-neutral-900 truncate">
              {titleText}
            </span>
            {edition.edition_number != null && (
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                Nº {edition.edition_number}
              </span>
            )}
            {!edition.is_published && (
              <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-medium ring-1 ring-amber-200/50">
                Borrador
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5 tabular-nums">
            {articleCount} {articleCount === 1 ? "artículo" : "artículos"}
            {articleCount < 10 && (
              <span className="text-amber-600 ml-2">
                · faltan {10 - articleCount}
              </span>
            )}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-neutral-100 px-5 py-4 bg-neutral-50/40">
          {/* Top action bar */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-400 font-medium">
              Artículos en la edición
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar artículo
            </button>
          </div>

          {/* Articles list */}
          {loadingArticles ? (
            <div className="flex items-center gap-2 text-xs text-neutral-400 py-6 justify-center">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cargando…
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
              Esta edición todavía no tiene artículos.
            </div>
          ) : (
            <ul className="rounded-lg border border-neutral-200 bg-white divide-y divide-neutral-100">
              {articles.map((a) => (
                <ArticleListItem
                  key={a.article_id}
                  article={a}
                  onRemove={() => handleRemove(a.article_id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {showAddModal && (
        <ArticleSearchModal
          editionId={edition.id}
          editionLabel={titleText}
          existingArticleIds={new Set(articles.map((a) => a.article_id))}
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Article row inside an expanded edition
// ──────────────────────────────────────────────────────────────────────
const ArticleListItem = ({
  article,
  onRemove,
}: {
  article: ArticleInEdition;
  onRemove: () => void;
}) => {
  const [removing, setRemoving] = useState(false);
  return (
    <li className="flex items-center gap-3 px-4 py-3 group">
      <span className="w-7 text-[11px] font-bold tabular-nums text-neutral-400 tracking-[0.1em]">
        {String(article.position).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-800 line-clamp-1 font-medium">
          {article.title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
          <span>{article.category_name}</span>
          <span>·</span>
          <span className="tabular-nums">
            {format(new Date(article.published_at), "d MMM yyyy", { locale: es })}
          </span>
        </div>
      </div>

      <Link
        to={`${ADMIN_BASE_PATH}/editor/${article.article_id}`}
        className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center h-7 w-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
        title="Editar nota"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <a
        href={`/noticias/${article.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center h-7 w-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
        title="Abrir en el sitio público"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <button
        type="button"
        onClick={async () => {
          setRemoving(true);
          await onRemove();
          setRemoving(false);
        }}
        disabled={removing}
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Quitar de la edición"
      >
        {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
      </button>
    </li>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Modal: search + add article
// ──────────────────────────────────────────────────────────────────────
const ArticleSearchModal = ({
  editionId,
  editionLabel,
  existingArticleIds,
  onClose,
  onAdded,
}: {
  editionId: string;
  editionLabel: string;
  existingArticleIds: Set<string>;
  onClose: () => void;
  onAdded: (article: ArticleSearchResult, position: number) => void;
}) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ArticleSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  // Debounce the search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setSearching(true);
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, title, slug, published_at,
          categories!left ( name )
        `)
        .eq("status", "published")
        .ilike("title", `%${debouncedQuery}%`)
        .order("published_at", { ascending: false })
        .limit(20);
      if (cancelled) return;
      setSearching(false);
      if (error) {
        toast.error("Error al buscar: " + error.message);
        return;
      }
      const mapped: ArticleSearchResult[] = ((data ?? []) as unknown as Array<{
        id: string;
        title: string;
        slug: string;
        published_at: string;
        categories: { name: string } | { name: string }[] | null;
      }>).map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        published_at: r.published_at,
        category_name: Array.isArray(r.categories)
          ? r.categories[0]?.name ?? "—"
          : r.categories?.name ?? "—",
      }));
      setResults(mapped);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleAdd = async (a: ArticleSearchResult) => {
    setAdding(a.id);
    // Compute next position (max+1) for this edition
    const { data: maxRow, error: maxErr } = await supabase
      .from("edition_articles")
      .select("position")
      .eq("edition_id", editionId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxErr) {
      toast.error("Error al calcular posición: " + maxErr.message);
      setAdding(null);
      return;
    }
    const nextPos = (maxRow?.position ?? 0) + 1;
    const { error: insErr } = await supabase
      .from("edition_articles")
      .insert({ edition_id: editionId, article_id: a.id, position: nextPos });
    setAdding(null);
    if (insErr) {
      toast.error("Error al agregar: " + insErr.message);
      return;
    }
    toast.success(`Agregada (posición ${nextPos})`);
    onAdded(a, nextPos);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-medium">
              Agregar a
            </p>
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {editionLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar artículos por título…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50/50 pl-9 pr-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {debouncedQuery.length < 2 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">
              Escribí al menos 2 caracteres
            </p>
          ) : searching ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400 inline-flex w-full items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Buscando…
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">
              Sin resultados para "{debouncedQuery}"
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {results.map((r) => {
                const already = existingArticleIds.has(r.id);
                const isAdding = adding === r.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => !already && !isAdding && handleAdd(r)}
                      disabled={already || isAdding}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-neutral-50 transition-colors disabled:cursor-not-allowed disabled:bg-neutral-50/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-800 line-clamp-1 font-medium">
                          {r.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                          <span>{r.category_name}</span>
                          <span>·</span>
                          <span className="tabular-nums">
                            {format(new Date(r.published_at), "d MMM yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                      {already ? (
                        <span className="text-[11px] text-neutral-400 font-medium">Ya está</span>
                      ) : isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                      ) : (
                        <Plus className="h-4 w-4 text-neutral-400" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editions;

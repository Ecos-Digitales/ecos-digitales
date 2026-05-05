import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useEdition, useAdjacentEditions } from "@/hooks/useEditions";
import type { ArticleListing } from "@/hooks/useArticles";
import { getExcerpt } from "@/lib/getExcerpt";

const formatMonthYear = (year: number, month: number) => {
  const d = new Date(year, month - 1, 1);
  return format(d, "MMMM yyyy", { locale: es });
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const SITE_URL = "https://ecosdigitales.com";

const EditionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: edition, isLoading, isError } = useEdition(slug);
  const { data: adjacent } = useAdjacentEditions(edition?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !edition) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-20 text-center">
          <p className="text-muted-foreground mb-6">
            No encontramos esta edición.
          </p>
          <Link
            to="/ediciones"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Ver todas las ediciones
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const monthYearLabel = capitalize(formatMonthYear(edition.year, edition.month));
  const heroLabel = [
    "Ecos Digitales",
    edition.edition_number != null ? `Edición Nº ${edition.edition_number}` : null,
    monthYearLabel,
  ]
    .filter(Boolean)
    .join(" · ");
  const editionTitle =
    edition.title || `Edición de ${monthYearLabel}`;
  const totalArticles = edition.articles.length;

  // SEO
  const seoTitle =
    edition.meta_title || `${editionTitle} — Ecos Digitales`;
  const seoDescription = edition.meta_description || edition.hero_description;
  const seoImage = edition.cover_image_url || edition.articles[0]?.featured_image_url || undefined;
  const canonical = `${SITE_URL}/ediciones/${edition.slug}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": editionTitle,
    "description": edition.hero_description,
    "url": canonical,
    "datePublished": edition.published_at,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Ecos Digitales",
      "url": SITE_URL,
    },
    ...(edition.sponsor && {
      "sponsor": {
        "@type": "Organization",
        "name": edition.sponsor.name,
        "logo": edition.sponsor.logo_url,
        ...(edition.sponsor.website_url && { "url": edition.sponsor.website_url }),
      },
    }),
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalArticles,
      "itemListElement": edition.articles.map((a, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `${SITE_URL}/noticias/${a.slug}`,
        "name": a.title,
      })),
    },
  };

  const featured = edition.articles[0];
  const dual = edition.articles.slice(1, 3);
  const rest = edition.articles.slice(3);

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        url={canonical}
        type="website"
        jsonLd={collectionJsonLd}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          {/* ─── Section 1 — Hero ─────────────────────────────────────── */}
          <section className="border-b border-border bg-secondary/30">
            <div className="container py-14 md:py-20 max-w-4xl">
              <Link
                to="/ediciones"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Todas las ediciones
              </Link>

              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary mb-6">
                {heroLabel}
              </p>

              <h1
                className="text-[2rem] sm:text-[2.5rem] md:text-[3.25rem] font-bold leading-[1.1] text-foreground tracking-tight"
              >
                {editionTitle}
              </h1>

              <p className="mt-6 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl">
                {edition.hero_description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground tabular-nums">
                    {totalArticles}
                  </strong>{" "}
                  {totalArticles === 1 ? "artículo" : "artículos"}
                </span>
                {edition.sponsor && (
                  <span>
                    Presentado por{" "}
                    <strong className="text-foreground">
                      {edition.sponsor.name}
                    </strong>
                  </span>
                )}
              </div>

              {/* Sponsor banner */}
              {edition.sponsor && (
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border bg-background p-5">
                  <div className="flex-shrink-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Presenta esta edición
                    </p>
                    {edition.sponsor.website_url ? (
                      <a
                        href={edition.sponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <img
                          src={edition.sponsor.logo_url}
                          alt={edition.sponsor.name}
                          className="h-10 w-auto"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <img
                        src={edition.sponsor.logo_url}
                        alt={edition.sponsor.name}
                        className="h-10 w-auto"
                        loading="lazy"
                      />
                    )}
                  </div>
                  {edition.sponsor.tagline && (
                    <p className="text-sm text-muted-foreground italic sm:border-l sm:border-border sm:pl-4">
                      {edition.sponsor.tagline}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ─── Section 2 — 10 noticias del mes ─────────────────────── */}
          {edition.articles.length > 0 && (
            <section className="container py-14 md:py-20 max-w-5xl">
              <SectionHeading
                kicker="Las 10 del mes"
                title="Las noticias que marcaron"
              />

              {/* Featured: position 1 */}
              {featured && (
                <FeaturedEditionArticle article={featured} number={1} />
              )}

              {/* Dual: positions 2-3 */}
              {dual.length > 0 && (
                <div className="mt-12 grid gap-8 md:grid-cols-2">
                  {dual.map((a, i) => (
                    <DualEditionArticle
                      key={a.id}
                      article={a}
                      number={i + 2}
                    />
                  ))}
                </div>
              )}

              {/* Rest: positions 4..N */}
              {rest.length > 0 && (
                <div className="mt-12 flex flex-col divide-y divide-border border-t border-border">
                  {rest.map((a, i) => (
                    <CompactEditionArticle
                      key={a.id}
                      article={a}
                      number={i + 4}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ─── Section 3 — Nota patrocinada ─────────────────────────── */}
          {edition.sponsored_article && (
            <section className="border-y border-border bg-secondary/30">
              <div className="container py-14 md:py-20 max-w-4xl">
                <div className="mb-8 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground whitespace-nowrap">
                    Contenido patrocinado
                    {edition.sponsor && ` · Presentado por ${edition.sponsor.name}`}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <SponsoredEditionArticle
                  article={edition.sponsored_article}
                  sponsorName={edition.sponsor?.name}
                />
              </div>
            </section>
          )}

          {/* ─── Section 4 — Footer de edición ────────────────────────── */}
          <section className="container py-14 md:py-20 max-w-5xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {adjacent?.prev ? (
                <Link
                  to={`/ediciones/${adjacent.prev.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-card-hover"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                    <ArrowLeft className="h-3 w-3" /> Edición anterior
                  </p>
                  <p
                    className="text-xl font-bold text-foreground group-hover:text-primary transition-colors"
                  >
                    {capitalize(formatMonthYear(adjacent.prev.year, adjacent.prev.month))}
                  </p>
                </Link>
              ) : (
                <div />
              )}

              {adjacent?.next ? (
                <Link
                  to={`/ediciones/${adjacent.next.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 sm:text-right transition-all hover:border-primary/30 hover:shadow-card-hover"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2 inline-flex items-center gap-1.5 sm:flex-row-reverse">
                    <ArrowRight className="h-3 w-3" /> Edición siguiente
                  </p>
                  <p
                    className="text-xl font-bold text-foreground group-hover:text-primary transition-colors"
                  >
                    {capitalize(formatMonthYear(adjacent.next.year, adjacent.next.month))}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* CTA publicidad */}
            <div className="mt-12 rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                ¿Quieres que tu marca presente la próxima edición?
              </p>
              <Link
                to="/publicidad"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Hablemos de publicidad
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────

const SectionHeading = ({ kicker, title }: { kicker: string; title: string }) => (
  <div className="mb-10">
    <span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-primary mb-3">
      {kicker}
    </span>
    <h2
      className="text-[1.75rem] md:text-[2.25rem] font-bold leading-tight text-foreground tracking-tight"
    >
      {title}
    </h2>
  </div>
);

const NumberBadge = ({ n }: { n: number }) => (
  <span className="inline-block text-[10px] font-bold tabular-nums tracking-[0.2em] text-muted-foreground">
    {String(n).padStart(2, "0")}
  </span>
);

const FeaturedEditionArticle = ({
  article,
  number,
}: {
  article: ArticleListing;
  number: number;
}) => (
  <Link to={`/noticias/${article.slug}`} className="group block">
    <article className="overflow-hidden">
      {article.featured_image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          <OptimizedImage
            src={article.featured_image_url}
            alt={article.featured_image_alt || article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>
      )}
      <div className="mt-6 flex items-baseline gap-4">
        <NumberBadge n={number} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {article.category_name}
        </span>
      </div>
      <h3
        className="mt-3 text-[1.75rem] md:text-[2rem] font-bold leading-[1.15] text-foreground group-hover:text-primary transition-colors tracking-tight"
      >
        {article.title}
      </h3>
      {getExcerpt(article) && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground line-clamp-3 max-w-3xl">
          {getExcerpt(article).replace(/<[^>]*>/g, "")}
        </p>
      )}
    </article>
  </Link>
);

const DualEditionArticle = ({
  article,
  number,
}: {
  article: ArticleListing;
  number: number;
}) => (
  <Link to={`/noticias/${article.slug}`} className="group block">
    <article>
      {article.featured_image_url && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
          <OptimizedImage
            src={article.featured_image_url}
            alt={article.featured_image_alt || article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="mt-5 flex items-baseline gap-3">
        <NumberBadge n={number} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {article.category_name}
        </span>
      </div>
      <h3
        className="mt-2 text-xl md:text-[1.5rem] font-bold leading-tight text-foreground group-hover:text-primary transition-colors"
      >
        {article.title}
      </h3>
      {getExcerpt(article) && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {getExcerpt(article).replace(/<[^>]*>/g, "")}
        </p>
      )}
    </article>
  </Link>
);

const CompactEditionArticle = ({
  article,
  number,
}: {
  article: ArticleListing;
  number: number;
}) => (
  <Link to={`/noticias/${article.slug}`} className="group block py-6">
    <article className="flex flex-col sm:flex-row items-start gap-5">
      <div className="flex-shrink-0 w-12 sm:w-14 pt-1">
        <NumberBadge n={number} />
      </div>
      {article.featured_image_url && (
        <div className="relative h-24 w-full sm:w-40 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <OptimizedImage
            src={article.featured_image_url}
            alt={article.featured_image_alt || article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="160px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {article.category_name}
        </span>
        <h3
          className="mt-1 text-base md:text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors"
        >
          {article.title}
        </h3>
        {getExcerpt(article) && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {getExcerpt(article).replace(/<[^>]*>/g, "")}
          </p>
        )}
      </div>
    </article>
  </Link>
);

const SponsoredEditionArticle = ({
  article,
  sponsorName,
}: {
  article: ArticleListing;
  sponsorName?: string;
}) => (
  <Link
    to={`/noticias/${article.slug}`}
    className="group block overflow-hidden rounded-2xl border border-border bg-background transition-all hover:shadow-card-hover hover:border-primary/30"
  >
    <article className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
      {article.featured_image_url && (
        <div className="relative aspect-[4/3] md:aspect-auto md:h-full w-full overflow-hidden bg-muted">
          <OptimizedImage
            src={article.featured_image_url}
            alt={article.featured_image_alt || article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="flex flex-col p-6 md:p-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          {sponsorName ? `Por ${sponsorName}` : "Patrocinado"}
        </span>
        <h3
          className="text-xl md:text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors"
        >
          {article.title}
        </h3>
        {getExcerpt(article) && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {getExcerpt(article).replace(/<[^>]*>/g, "")}
          </p>
        )}
        <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Leer la nota
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  </Link>
);

export default EditionDetail;

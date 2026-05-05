import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { LoadingGrid } from "@/components/LoadingGrid";
import { useEditionsList, type EditionListing } from "@/hooks/useEditions";

const formatMonthYear = (year: number, month: number) => {
  // month is 1-12; date-fns expects JS Date (0-11)
  const d = new Date(year, month - 1, 1);
  return format(d, "MMMM yyyy", { locale: es });
};

const formatMonth = (month: number) => {
  const d = new Date(2000, month - 1, 1);
  return format(d, "MMMM", { locale: es });
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const EditionsIndex = () => {
  const { data: editions, isLoading } = useEditionsList();

  const currentYear = new Date().getFullYear();

  // Agrupar ediciones por año, ordenadas DESC.
  // useEditionsList ya filtra mes actual y futuros, así que acá solo separamos
  // el año en curso (cards) del archivo histórico (barras colapsables).
  const { currentYearEditions, archiveByYear } = useMemo(() => {
    const all = editions ?? [];
    const current = all.filter((e) => e.year === currentYear);
    const past = all.filter((e) => e.year < currentYear);

    // Map preserva orden de inserción; las ediciones vienen ordenadas DESC,
    // así que el primer year visto es el más reciente.
    const grouped = new Map<number, EditionListing[]>();
    for (const e of past) {
      const arr = grouped.get(e.year) || [];
      arr.push(e);
      grouped.set(e.year, arr);
    }
    return {
      currentYearEditions: current,
      archiveByYear: Array.from(grouped.entries()),
    };
  }, [editions, currentYear]);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Ediciones del Mes — Ecos Digitales",
    "description":
      "Lo más importante de la tecnología en LATAM, mes a mes. Una selección curada de 10 noticias por edición.",
    "url": "https://ecosdigitales.com/ediciones",
    "hasPart": (editions ?? []).map((e) => ({
      "@type": "CreativeWork",
      "name": e.title || `Edición de ${capitalize(formatMonthYear(e.year, e.month))}`,
      "url": `https://ecosdigitales.com/ediciones/${e.slug}`,
      "datePublished": e.published_at,
    })),
  };

  return (
    <>
      <SEO
        title="Ediciones del Mes"
        bareTitle
        description="Lo más importante de la tecnología en LATAM, mes a mes. Una selección curada de las 10 noticias clave de cada mes."
        url="https://ecosdigitales.com/ediciones"
        type="website"
        jsonLd={collectionJsonLd}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="container py-16 md:py-24 text-center">
            <h1 className="mx-auto max-w-3xl text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-bold leading-[1.1] text-foreground tracking-tight">
              Ediciones del Mes
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
              Lo más importante de la tecnología en LATAM, mes a mes. Una
              selección curada de las noticias que definieron cada período.
            </p>
          </section>

          {/* Año en curso: cards */}
          <section className="container pb-12">
            {isLoading ? (
              <LoadingGrid />
            ) : currentYearEditions.length === 0 && archiveByYear.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  Todavía no hay ediciones publicadas.
                </p>
              </div>
            ) : currentYearEditions.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentYearEditions.map((edition) => (
                  <EditionCard key={edition.id} edition={edition} />
                ))}
              </div>
            ) : null}
          </section>

          {/* Archivo histórico: barras colapsables por año */}
          {archiveByYear.length > 0 && (
            <section className="container pb-20">
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Archivo
              </h2>
              <div className="flex flex-col gap-3">
                {archiveByYear.map(([year, items]) => (
                  <YearArchive key={year} year={year} editions={items} />
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Year archive bar — colapsable
// ──────────────────────────────────────────────────────────────────────

const YearArchive = ({ year, editions }: { year: number; editions: EditionListing[] }) => {
  const [open, setOpen] = useState(false);
  const count = editions.length;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 sm:py-6 hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-baseline gap-4">
          <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
            {year}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {count} {count === 1 ? "edición" : "ediciones"}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 sm:px-6 py-5 sm:py-6 bg-background/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {editions.map((edition) => (
              <MonthMiniCard key={edition.id} edition={edition} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Mini-card de mes (dentro de un año expandido)
// ──────────────────────────────────────────────────────────────────────

const MonthMiniCard = ({ edition }: { edition: EditionListing }) => {
  const monthName = capitalize(formatMonth(edition.month));
  const coverSrc = edition.cover_image_url ?? edition.cover_fallback_url;

  return (
    <Link
      to={`/ediciones/${edition.slug}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-muted via-muted to-secondary">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={monthName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-foreground/15">
              {monthName.slice(0, 3).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
          {monthName}
        </h4>
      </div>
    </Link>
  );
};

// ──────────────────────────────────────────────────────────────────────
// EditionCard — para el año en curso (jerarquía completa: img + título + descripción)
// ──────────────────────────────────────────────────────────────────────

const EditionCard = ({ edition }: { edition: EditionListing }) => {
  const monthYear = capitalize(formatMonthYear(edition.year, edition.month));
  const monthOnly = capitalize(formatMonth(edition.month));
  // Resolución de cover: manual override → imagen de la nota principal → monogram.
  const coverSrc = edition.cover_image_url ?? edition.cover_fallback_url;
  const coverAlt =
    (edition.cover_image_url && (edition.title || monthYear)) ||
    edition.cover_fallback_alt ||
    edition.title ||
    monthYear;

  // Title: custom editorial title si existe, fallback "Edición de Abril".
  // En el año en curso no repetimos el año porque está implícito (los cards
  // son del año actual; el archivo histórico encapsula los años pasados).
  const titleText = edition.title || `Edición de ${monthOnly}`;

  return (
    <Link
      to={`/ediciones/${edition.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      {/* Cover — sin badge, imagen limpia */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-muted via-muted to-secondary">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={coverAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-bold text-foreground/10">
              {monthYear.split(" ")[0].slice(0, 3).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {/* Title */}
        <h3 className="text-[1.375rem] sm:text-[1.5rem] font-bold leading-[1.2] text-foreground tracking-tight">
          {titleText}
        </h3>

        {/* Description (hero_description) */}
        {edition.hero_description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {edition.hero_description}
          </p>
        )}

        {/* Sponsor (si lo hay) */}
        {edition.sponsor && (
          <div className="mt-5 flex items-center gap-2">
            <span className="text-[10px] capitalize tracking-[0.05em] text-muted-foreground/80">
              Presenta
            </span>
            <img
              src={edition.sponsor.logo_url}
              alt={edition.sponsor.name}
              loading="lazy"
              className="h-5 w-auto opacity-60 transition-opacity group-hover:opacity-100"
            />
          </div>
        )}

        {/* Footer: número de edición + CTA — todo gris */}
        <div className="mt-auto pt-6 flex items-center justify-between gap-3 border-t border-border/60">
          <span className="pt-5 text-xs text-muted-foreground">
            {edition.edition_number != null
              ? `Edición N°${edition.edition_number}`
              : monthYear}
          </span>
          <span className="pt-5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground translate-x-0 group-hover:translate-x-0.5 transition-all duration-200">
            Leer edición
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EditionsIndex;

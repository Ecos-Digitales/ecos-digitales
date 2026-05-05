import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const EditionsIndex = () => {
  const { data: editions, isLoading } = useEditionsList();

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
        title="Ediciones del Mes — Ecos Digitales"
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
            <span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-primary mb-4">
              Ecos Digitales · Curated Monthly
            </span>
            <h1
              className="mx-auto max-w-3xl text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-bold leading-[1.1] text-foreground tracking-tight"
            >
              Ediciones del Mes
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
              Lo más importante de la tecnología en LATAM, mes a mes. Una
              selección curada de las noticias que definieron cada período.
            </p>
          </section>

          {/* Grid */}
          <section className="container pb-20">
            {isLoading ? (
              <LoadingGrid />
            ) : !editions || editions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  Todavía no hay ediciones publicadas.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {editions.map((edition) => (
                  <EditionCard key={edition.id} edition={edition} />
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

const EditionCard = ({ edition }: { edition: EditionListing }) => {
  const monthYear = capitalize(formatMonthYear(edition.year, edition.month));
  // Resolución de cover: manual override → imagen de la nota principal → monogram.
  const coverSrc = edition.cover_image_url ?? edition.cover_fallback_url;
  const coverAlt =
    (edition.cover_image_url && (edition.title || monthYear)) ||
    edition.cover_fallback_alt ||
    edition.title ||
    monthYear;

  // Title: custom editorial title si existe, fallback al "Edición de Abril 2026"
  const titleText = edition.title || `Edición de ${monthYear}`;

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

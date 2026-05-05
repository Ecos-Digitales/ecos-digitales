import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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

  return (
    <Link
      to={`/ediciones/${edition.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
    >
      {/* Cover area: image if exists, otherwise large monogram */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-muted via-muted to-secondary">
        {edition.cover_image_url ? (
          <img
            src={edition.cover_image_url}
            alt={edition.title || monthYear}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-6xl font-bold text-foreground/10"
            >
              {monthYear.split(" ")[0].slice(0, 3).toUpperCase()}
            </span>
          </div>
        )}
        {edition.edition_number != null && (
          <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-foreground">
            N° {edition.edition_number}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span
          className="block text-[1.5rem] font-bold leading-tight text-foreground group-hover:text-primary transition-colors"
        >
          {monthYear}
        </span>
        {edition.title && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {edition.title}
          </p>
        )}

        {/* Sponsor footer */}
        {edition.sponsor && (
          <div className="mt-auto pt-5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="uppercase tracking-wider">Presenta</span>
            <img
              src={edition.sponsor.logo_url}
              alt={edition.sponsor.name}
              loading="lazy"
              className="h-5 w-auto opacity-70 transition-opacity group-hover:opacity-100"
            />
          </div>
        )}
      </div>
    </Link>
  );
};

export default EditionsIndex;

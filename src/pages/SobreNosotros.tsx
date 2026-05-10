import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Sobre Ecos Digitales",
  description:
    "Medio de comunicación independiente especializado en tecnología, telecomunicaciones y negocios digitales en América Latina.",
  url: "https://ecosdigitales.com/sobre-nosotros",
  publisher: {
    "@type": "Organization",
    name: "Ecos Digitales",
    url: "https://ecosdigitales.com",
    areaServed: "LATAM",
  },
};

const SobreNosotros = () => (
  <>
    <SEO
      title="Sobre Ecos Digitales"
      description="Medio de comunicación independiente especializado en tecnología, telecomunicaciones y negocios digitales en América Latina. Cobertura editorial desde 2017."
      url="https://ecosdigitales.com/sobre-nosotros"
      type="website"
      jsonLd={aboutJsonLd}
    />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="container py-16 md:py-24 text-center">
          <h1 className="mx-auto max-w-3xl text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-bold leading-[1.1] text-foreground tracking-tight">
            Sobre Ecos Digitales
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
            Periodismo tecnológico independiente para América Latina.
          </p>
        </section>

        {/* Contenido principal */}
        <article className="container pb-20">
          <div className="mx-auto max-w-2xl space-y-16">
            {/* Qué es Ecos Digitales */}
            <section>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Qué es Ecos Digitales
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>
                  Ecos Digitales es un medio de comunicación independiente
                  especializado en noticias de tecnología, telecomunicaciones y
                  negocios digitales en América Latina. Cubrimos inteligencia
                  artificial, ciberseguridad, startups, innovación,
                  transformación digital y la industria tech regional.
                </p>
                <p>
                  Nuestro foco geográfico es Perú, México y la región
                  hispanohablante, aunque cubrimos desarrollos globales cuando
                  tienen impacto directo en la región.
                </p>
              </div>
            </section>

            {/* Línea editorial */}
            <section>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Línea editorial
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>
                  Publicamos noticias, análisis y reportes sobre la industria
                  tecnológica. Nuestros artículos se clasifican en categorías que
                  incluyen Inteligencia Artificial, Ciberseguridad,
                  Telecomunicaciones, Aerolíneas, Startups, Negocios Digitales,
                  Innovación, Hardware, Software, Tecnología de Consumo,
                  Política Digital, Blockchain, Criptomonedas, Internet,
                  Empresas Tech, Computación Cuántica y Transformación Digital,
                  entre otras.
                </p>
                <p>
                  La línea editorial prioriza el rigor informativo sobre el
                  volumen. Cubrimos lanzamientos de productos, reportes de
                  industria, nombramientos ejecutivos, eventos del sector, casos
                  de transformación digital, resultados financieros y rondas de
                  inversión en tecnología.
                </p>
              </div>
            </section>

            {/* Ediciones del Mes */}
            <section>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Ediciones del Mes
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>
                  Cada mes publicamos una curaduría editorial con las 10 noticias
                  más relevantes del período. Las{" "}
                  <Link
                    to="/ediciones"
                    className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    Ediciones del Mes
                  </Link>{" "}
                  se publican el día 1 del mes siguiente al que cubren — la edición
                  de marzo se publica el 1 de abril — y representan una selección
                  manual de las notas que consideramos más significativas.
                </p>
                <p>
                  El archivo de ediciones cubre todos los meses desde 2017 hasta
                  el presente, agrupado por año.
                </p>
              </div>
            </section>

            {/* Toolbox */}
            <section>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Toolbox
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>
                  El{" "}
                  <Link
                    to="/toolbox"
                    className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    Toolbox
                  </Link>{" "}
                  es una colección curada de herramientas y productos digitales
                  que reseñamos editorialmente. Cada herramienta tiene su propia
                  página con descripción, categoría y enlace directo.
                </p>
              </div>
            </section>

            {/* Cobertura y presencia */}
            <section>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Cobertura y presencia
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>
                  Operamos desde 2017. Publicamos contenido diariamente y
                  mantenemos presencia en{" "}
                  <a
                    href="https://www.linkedin.com/company/ecosdigitales/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    LinkedIn
                  </a>
                  ,{" "}
                  <a
                    href="https://www.youtube.com/@jfloresmacias"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    YouTube
                  </a>{" "}
                  e{" "}
                  <a
                    href="https://www.instagram.com/ecosdigitales/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    Instagram
                  </a>
                  .
                </p>
                <p>
                  El contenido publicado es accesible de forma gratuita. No
                  operamos detrás de un paywall.
                </p>
              </div>
            </section>

            {/* Newsletter */}
            <section>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Newsletter
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>
                  Enviamos un resumen semanal con lo más relevante de tecnología
                  y negocios en Latinoamérica. Puedes suscribirte desde el pie de
                  cualquier página del sitio. Usamos doble opt-in: recibirás un
                  correo de confirmación antes de activar tu suscripción.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Contacto
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>
                  Para enviar notas de prensa, visita nuestra página de{" "}
                  <Link
                    to="/prensa"
                    className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    prensa
                  </Link>
                  .
                </p>
                <p>
                  Para consultas generales, puedes escribirnos a{" "}
                  <a
                    href="mailto:prensa@ecosdigitales.com"
                    className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    prensa@ecosdigitales.com
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  </>
);

export default SobreNosotros;

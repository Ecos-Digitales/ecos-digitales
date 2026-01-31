export interface Article {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  image_url: string;
  author: string;
  published_date: string;
  reading_time: number;
  slug: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "OpenAI presenta GPT-5: El modelo más avanzado hasta la fecha",
    excerpt: "La nueva versión promete capacidades de razonamiento sin precedentes.",
    content: `OpenAI ha anunciado oficialmente el lanzamiento de GPT-5, su modelo de lenguaje más avanzado hasta la fecha.

## Mejoras principales

El nuevo modelo presenta mejoras sustanciales en razonamiento lógico, comprensión contextual y generación de código.

## Impacto en la industria

Las empresas de tecnología ya están evaluando cómo integrar estas nuevas capacidades en sus productos.

> "GPT-5 representa el mayor avance en IA conversacional desde el lanzamiento original de ChatGPT" - Sam Altman

## Disponibilidad

El modelo estará disponible inicialmente para usuarios empresariales.`,
    category: "Inteligencia Artificial",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    author: "María García",
    published_date: "2026-01-23T10:00:00Z",
    reading_time: 5,
    slug: "openai-presenta-gpt-5-modelo-avanzado",
    status: "published",
    created_at: "2026-01-23T09:00:00Z",
    updated_at: "2026-01-23T10:00:00Z",
  },
  {
    id: "2",
    title: "Apple anuncia Vision Pro 2 con nuevo chip M4 Ultra",
    excerpt: "El nuevo dispositivo de realidad mixta promete mayor autonomía.",
    content: `Apple ha revelado la segunda generación de sus gafas de realidad mixta.

## Especificaciones destacadas

El Vision Pro 2 cuenta con pantallas micro-OLED de mayor resolución y tracking ocular mejorado.`,
    category: "Apple",
    image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop",
    author: "Carlos Rodríguez",
    published_date: "2026-01-22T18:00:00Z",
    reading_time: 4,
    slug: "apple-vision-pro-2-chip-m4-ultra",
    status: "published",
    created_at: "2026-01-22T17:00:00Z",
    updated_at: "2026-01-22T18:00:00Z",
  },
  {
    id: "3",
    title: "NVIDIA supera los 3 billones en capitalización de mercado",
    excerpt: "La demanda de chips para IA continúa impulsando el crecimiento récord.",
    content: `NVIDIA ha alcanzado un hito histórico al superar los 3 billones de dólares en capitalización.

## Motor de crecimiento

La demanda insaciable de GPUs para entrenamiento de modelos de IA ha sido el principal catalizador.`,
    category: "NVIDIA",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
    author: "Ana Martínez",
    published_date: "2026-01-21T14:00:00Z",
    reading_time: 6,
    slug: "nvidia-3-billones-capitalizacion",
    status: "published",
    created_at: "2026-01-21T13:00:00Z",
    updated_at: "2026-01-21T14:00:00Z",
  },
  {
    id: "4",
    title: "n8n 2.0: La nueva era de la automatización low-code",
    excerpt: "La popular plataforma presenta su mayor actualización con IA integrada.",
    content: `n8n ha lanzado su versión 2.0, introduciendo capacidades de IA nativas.

## Novedades principales

La nueva versión incluye un asistente de IA que puede generar workflows completos.`,
    category: "n8n",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    author: "Pedro Sánchez",
    published_date: "2026-01-20T12:00:00Z",
    reading_time: 4,
    slug: "n8n-2-nueva-era-automatizacion",
    status: "published",
    created_at: "2026-01-20T11:00:00Z",
    updated_at: "2026-01-20T12:00:00Z",
  },
  {
    id: "5",
    title: "Cursor revoluciona el desarrollo con su agente de código autónomo",
    excerpt: "El IDE potenciado por IA puede ahora completar tareas de desarrollo completas.",
    content: `Cursor ha presentado su nuevo modo de agente autónomo que puede desarrollar features completas.

## Capacidades del agente

El agente puede entender requerimientos, escribir código, crear tests, y hacer refactoring.`,
    category: "Cursor",
    image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
    author: "Laura Díaz",
    published_date: "2026-01-19T16:00:00Z",
    reading_time: 5,
    slug: "cursor-agente-codigo-autonomo",
    status: "published",
    created_at: "2026-01-19T15:00:00Z",
    updated_at: "2026-01-19T16:00:00Z",
  },
  {
    id: "6",
    title: "Lovable alcanza 1 millón de apps creadas con IA",
    excerpt: "La plataforma de desarrollo asistido por IA celebra un hito importante.",
    content: `Lovable ha anunciado que su plataforma ha sido utilizada para crear más de un millón de aplicaciones web.

## Democratización del desarrollo

La plataforma permite a usuarios sin experiencia técnica crear aplicaciones completas.`,
    category: "Lovable",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
    author: "Roberto Fernández",
    published_date: "2026-01-18T10:00:00Z",
    reading_time: 7,
    slug: "lovable-millon-apps-creadas-ia",
    status: "published",
    created_at: "2026-01-18T09:00:00Z",
    updated_at: "2026-01-18T10:00:00Z",
  },
  {
    id: "7",
    title: "E-commerce en 2026: Tendencias que dominarán el mercado",
    excerpt: "Desde AR hasta personalización con IA, estas son las tecnologías que transformarán las compras.",
    content: `El comercio electrónico continúa evolucionando a un ritmo acelerado.

## Realidad aumentada mainstream

Los consumidores ahora esperan poder visualizar productos en su entorno antes de comprar.`,
    category: "E-commerce",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    author: "Elena Torres",
    published_date: "2026-01-17T14:00:00Z",
    reading_time: 5,
    slug: "ecommerce-2026-tendencias-mercado",
    status: "published",
    created_at: "2026-01-17T13:00:00Z",
    updated_at: "2026-01-17T14:00:00Z",
  },
  {
    id: "8",
    title: "Ciberataque masivo afecta a instituciones financieras globales",
    excerpt: "Expertos en ciberseguridad trabajan para contener una amenaza.",
    content: `Un sofisticado ciberataque ha afectado a varias instituciones financieras a nivel global.

## Naturaleza del ataque

Los atacantes utilizaron una combinación de ingeniería social y exploits de día cero.`,
    category: "Ciberseguridad",
    image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    author: "Miguel Ángel López",
    published_date: "2026-01-16T11:00:00Z",
    reading_time: 6,
    slug: "ciberataque-instituciones-financieras",
    status: "published",
    created_at: "2026-01-16T10:00:00Z",
    updated_at: "2026-01-16T11:00:00Z",
  },
  {
    id: "9",
    title: "PlayStation 6: Sony confirma lanzamiento para finales de año",
    excerpt: "La nueva consola promete gráficos fotorrealistas.",
    content: `Sony ha confirmado oficialmente que PlayStation 6 llegará a finales de este año.

## Especificaciones reveladas

La consola contará con un SSD de nueva generación y una GPU capaz de ray-tracing a 8K.`,
    category: "Gaming",
    image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop",
    author: "Diego Ramírez",
    published_date: "2026-01-15T09:00:00Z",
    reading_time: 4,
    slug: "playstation-6-sony-lanzamiento",
    status: "published",
    created_at: "2026-01-15T08:00:00Z",
    updated_at: "2026-01-15T09:00:00Z",
  },
  {
    id: "10",
    title: "Transformación Digital: El 80% de las empresas acelerará inversiones",
    excerpt: "Un nuevo estudio revela que la digitalización sigue siendo prioridad.",
    content: `Según un estudio de McKinsey, el 80% de las empresas planea aumentar sus inversiones.

## Áreas de enfoque

IA, automatización y experiencia del cliente son las principales áreas de inversión.`,
    category: "Transformación Digital",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
    author: "Patricia Moreno",
    published_date: "2026-01-14T15:00:00Z",
    reading_time: 5,
    slug: "transformacion-digital-empresas-2026",
    status: "published",
    created_at: "2026-01-14T14:00:00Z",
    updated_at: "2026-01-14T15:00:00Z",
  },
  {
    id: "11",
    title: "Claude 4 de Anthropic establece nuevos estándares en seguridad de IA",
    excerpt: "El nuevo modelo prioriza la alineación y transparencia.",
    content: `Anthropic ha lanzado Claude 4, su modelo de IA más avanzado.

## Enfoque en seguridad

El modelo incluye nuevas técnicas de constitutional AI que mejoran la fiabilidad.`,
    category: "Inteligencia Artificial",
    image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop",
    author: "Sofía Castro",
    published_date: "2026-01-13T12:00:00Z",
    reading_time: 6,
    slug: "claude-4-anthropic-seguridad-ia",
    status: "published",
    created_at: "2026-01-13T11:00:00Z",
    updated_at: "2026-01-13T12:00:00Z",
  },
  {
    id: "12",
    title: "Microsoft integra Copilot en toda su suite de productos",
    excerpt: "La IA asistente ahora está disponible en Windows, Office y Azure.",
    content: `Microsoft ha completado la integración de Copilot en todos sus productos principales.

## Nuevas capacidades

Los usuarios pueden ahora interactuar con Copilot de forma fluida entre aplicaciones.`,
    category: "Inteligencia Artificial",
    image_url: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&h=600&fit=crop",
    author: "Fernando Ruiz",
    published_date: "2026-01-12T10:00:00Z",
    reading_time: 4,
    slug: "microsoft-copilot-suite-productos",
    status: "published",
    created_at: "2026-01-12T09:00:00Z",
    updated_at: "2026-01-12T10:00:00Z",
  },
  {
    id: "13",
    title: "Nintendo Switch 2: Primeras imágenes filtradas del hardware",
    excerpt: "Las especificaciones apuntan a un salto significativo en potencia.",
    content: `Imágenes filtradas revelan el diseño de Nintendo Switch 2.

## Diseño renovado

El nuevo dispositivo mantiene el concepto híbrido pero con una pantalla OLED de mayor tamaño.`,
    category: "Gaming",
    image_url: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&h=600&fit=crop",
    author: "Andrés Vega",
    published_date: "2026-01-11T14:00:00Z",
    reading_time: 3,
    slug: "nintendo-switch-2-imagenes-hardware",
    status: "published",
    created_at: "2026-01-11T13:00:00Z",
    updated_at: "2026-01-11T14:00:00Z",
  },
  {
    id: "14",
    title: "Shopify revoluciona el dropshipping con IA predictiva",
    excerpt: "La nueva función anticipa tendencias y optimiza inventarios.",
    content: `Shopify ha presentado nuevas herramientas de IA que prometen transformar el dropshipping.

## IA predictiva

El sistema analiza tendencias de mercado y predice demanda.`,
    category: "E-commerce",
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
    author: "Lucía Hernández",
    published_date: "2026-01-10T11:00:00Z",
    reading_time: 5,
    slug: "shopify-dropshipping-ia-predictiva",
    status: "published",
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T11:00:00Z",
  },
  {
    id: "15",
    title: "Google DeepMind presenta Gemini 2.0 con capacidades multimodales",
    excerpt: "El nuevo modelo puede procesar texto, imágenes, audio y video simultáneamente.",
    content: `Google DeepMind ha revelado Gemini 2.0, su modelo de IA más versátil.

## Capacidades multimodales

El modelo puede entender y generar contenido en múltiples formatos de manera nativa.`,
    category: "Inteligencia Artificial",
    image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    author: "María García",
    published_date: "2026-01-09T16:00:00Z",
    reading_time: 6,
    slug: "google-deepmind-gemini-2-multimodal",
    status: "published",
    created_at: "2026-01-09T15:00:00Z",
    updated_at: "2026-01-09T16:00:00Z",
  },
  {
    id: "16",
    title: "Tesla presenta robot humanoide Optimus Gen 3",
    excerpt: "La nueva generación promete mayor autonomía y destreza manual.",
    content: `Tesla ha mostrado la tercera generación de su robot humanoide Optimus.

## Mejoras significativas

El robot ahora puede realizar tareas domésticas complejas con mayor precisión.`,
    category: "Robótica",
    image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    author: "Carlos Rodríguez",
    published_date: "2026-01-08T10:00:00Z",
    reading_time: 5,
    slug: "tesla-optimus-gen-3-robot-humanoide",
    status: "published",
    created_at: "2026-01-08T09:00:00Z",
    updated_at: "2026-01-08T10:00:00Z",
  },
  {
    id: "17",
    title: "AWS lanza nueva región en Latinoamérica con foco en IA",
    excerpt: "La nueva infraestructura permitirá entrenar modelos localmente.",
    content: `Amazon Web Services ha inaugurado una nueva región de datos en Latinoamérica.

## Beneficios para la región

Las empresas locales podrán reducir latencia y cumplir regulaciones de datos.`,
    category: "Cloud",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
    author: "Ana Martínez",
    published_date: "2026-01-07T14:00:00Z",
    reading_time: 4,
    slug: "aws-nueva-region-latinoamerica-ia",
    status: "published",
    created_at: "2026-01-07T13:00:00Z",
    updated_at: "2026-01-07T14:00:00Z",
  },
  {
    id: "18",
    title: "Meta presenta nuevas gafas de realidad aumentada para consumidores",
    excerpt: "Las Ray-Ban Meta 2 incluyen pantalla holográfica integrada.",
    content: `Meta ha anunciado la segunda generación de sus gafas inteligentes con Ray-Ban.

## Tecnología holográfica

Las nuevas gafas proyectan información directamente en el campo de visión del usuario.`,
    category: "Realidad Aumentada",
    image_url: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&h=600&fit=crop",
    author: "Pedro Sánchez",
    published_date: "2026-01-06T11:00:00Z",
    reading_time: 5,
    slug: "meta-gafas-realidad-aumentada-consumidores",
    status: "published",
    created_at: "2026-01-06T10:00:00Z",
    updated_at: "2026-01-06T11:00:00Z",
  },
  {
    id: "19",
    title: "Stripe anuncia soporte nativo para criptomonedas estables",
    excerpt: "Los comercios podrán aceptar USDC y EURC directamente.",
    content: `Stripe ha habilitado el soporte para stablecoins en su plataforma de pagos.

## Integración sencilla

Los comercios pueden activar pagos cripto con un simple toggle en el dashboard.`,
    category: "Fintech",
    image_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
    author: "Laura Díaz",
    published_date: "2026-01-05T09:00:00Z",
    reading_time: 4,
    slug: "stripe-soporte-criptomonedas-estables",
    status: "published",
    created_at: "2026-01-05T08:00:00Z",
    updated_at: "2026-01-05T09:00:00Z",
  },
  {
    id: "20",
    title: "Spotify introduce DJ personal con IA generativa de voz",
    excerpt: "El asistente crea listas personalizadas y presenta canciones con voz sintetizada.",
    content: `Spotify ha lanzado una nueva función que combina recomendaciones con locución por IA.

## Experiencia personalizada

El DJ aprende las preferencias del usuario y adapta su estilo de presentación.`,
    category: "Entretenimiento",
    image_url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&h=600&fit=crop",
    author: "Roberto Fernández",
    published_date: "2026-01-04T15:00:00Z",
    reading_time: 3,
    slug: "spotify-dj-personal-ia-generativa",
    status: "published",
    created_at: "2026-01-04T14:00:00Z",
    updated_at: "2026-01-04T15:00:00Z",
  },
  {
    id: "21",
    title: "GitHub Copilot Workspace permite desarrollar sin escribir código",
    excerpt: "La nueva herramienta convierte issues en pull requests automáticamente.",
    content: `GitHub ha presentado Copilot Workspace, su visión del desarrollo asistido por IA.

## Flujo automatizado

Los desarrolladores pueden describir cambios en lenguaje natural y la IA genera el código.`,
    category: "Desarrollo",
    image_url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=600&fit=crop",
    author: "Elena Torres",
    published_date: "2026-01-03T12:00:00Z",
    reading_time: 6,
    slug: "github-copilot-workspace-desarrollo-sin-codigo",
    status: "published",
    created_at: "2026-01-03T11:00:00Z",
    updated_at: "2026-01-03T12:00:00Z",
  },
  {
    id: "22",
    title: "Samsung presenta Galaxy S26 con chip diseñado para IA on-device",
    excerpt: "El nuevo procesador Exynos ejecuta modelos de lenguaje localmente.",
    content: `Samsung ha revelado su nuevo flagship con capacidades de IA sin conexión a internet.

## Procesamiento local

El chip puede ejecutar modelos de 7B parámetros directamente en el dispositivo.`,
    category: "Móviles",
    image_url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop",
    author: "Miguel Ángel López",
    published_date: "2026-01-02T10:00:00Z",
    reading_time: 5,
    slug: "samsung-galaxy-s26-chip-ia-ondevice",
    status: "published",
    created_at: "2026-01-02T09:00:00Z",
    updated_at: "2026-01-02T10:00:00Z",
  },
  {
    id: "23",
    title: "Zoom introduce avatares 3D realistas generados por IA",
    excerpt: "Los usuarios pueden participar en reuniones con representaciones digitales.",
    content: `Zoom ha lanzado una función que permite crear avatares 3D fotorrealistas.

## Tecnología de generación

Los avatares replican expresiones faciales y gestos en tiempo real.`,
    category: "Productividad",
    image_url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600&fit=crop",
    author: "Diego Ramírez",
    published_date: "2026-01-01T14:00:00Z",
    reading_time: 4,
    slug: "zoom-avatares-3d-realistas-ia",
    status: "published",
    created_at: "2026-01-01T13:00:00Z",
    updated_at: "2026-01-01T14:00:00Z",
  },
];

export const getPublishedArticles = () => 
  mockArticles.filter(article => article.status === 'published')
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime());

export const getArticleBySlug = (slug: string) => 
  mockArticles.find(article => article.slug === slug && article.status === 'published');

export const getRelatedArticles = (currentSlug: string, category: string, limit: number = 3) => {
  // First, get articles from the same category (most recent first)
  const sameCategoryArticles = getPublishedArticles()
    .filter(article => article.slug !== currentSlug && article.category === category);
  
  // If we have enough articles from the same category, return them
  if (sameCategoryArticles.length >= limit) {
    return sameCategoryArticles.slice(0, limit);
  }
  
  // If not enough, fill with other recent articles
  const otherArticles = getPublishedArticles()
    .filter(article => article.slug !== currentSlug && article.category !== category);
  
  return [...sameCategoryArticles, ...otherArticles].slice(0, limit);
};

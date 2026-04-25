// Cloudflare Pages Function — intercepta /noticias/<slug> solo para crawlers
// y devuelve HTML con meta tags Open Graph específicos del artículo.
// Los usuarios humanos siguen recibiendo el SPA tal cual.

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

const CRAWLER_UA =
  /(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|Discordbot|Pinterest|redditbot|Embedly|SkypeUriPreview|vkShare|W3C_Validator|Applebot|googlebot|bingbot|DuckDuckBot|YandexBot|Baiduspider|GPTBot|ChatGPT-User|ClaudeBot|Claude-Web|PerplexityBot|YouBot|Bytespider|Amazonbot|MetaBot|Iframely)/i;

const SITE = "https://ecosdigitales.com";
const FALLBACK_IMAGE = "https://pub-a5d6cd3eaa334d2cac388aee0fa7c1f5.r2.dev/logo-og.jpg";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  IA: ["inteligencia artificial", "machine learning", "deep learning", "AI", "GPT", "LLM"],
  "Inteligencia Artificial": ["inteligencia artificial", "machine learning", "AI", "GPT", "LLM", "deep learning"],
  "No Code": ["no code", "low code", "herramientas sin código", "automatización", "Bubble", "Webflow"],
  Startups: ["startups", "emprendimiento", "venture capital", "inversión", "unicornio"],
  "Trabajo Remoto": ["trabajo remoto", "remote work", "teletrabajo", "home office", "nómada digital"],
  Productividad: ["productividad", "gestión del tiempo", "herramientas", "eficiencia"],
  Ciberseguridad: ["ciberseguridad", "seguridad informática", "hacking", "privacidad", "datos"],
  Blockchain: ["blockchain", "crypto", "web3", "DeFi", "NFT"],
  Hardware: ["hardware", "dispositivos", "gadgets", "chips", "procesadores"],
  Software: ["software", "desarrollo", "programación", "apps", "SaaS"],
};

interface ArticleRow {
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  published_at: string;
  updated_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  authors: { name: string } | null;
  categories: { name: string } | null;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, params, env, next } = context;
  const ua = request.headers.get("user-agent") || "";

  if (!CRAWLER_UA.test(ua)) {
    return next();
  }

  const slug = (params.slug as string | undefined)?.trim();
  const supaUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supaKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!slug || !supaUrl || !supaKey) {
    return next();
  }

  try {
    const select =
      "slug,title,subtitle,excerpt,content,featured_image_url,featured_image_alt,published_at,updated_at,meta_title,meta_description,og_image_url,authors!left(name),categories!left(name)";
    const apiUrl = `${supaUrl}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=${encodeURIComponent(select)}&limit=1`;

    const res = await fetch(apiUrl, {
      headers: {
        apikey: supaKey,
        Authorization: `Bearer ${supaKey}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) return next();

    const rows = (await res.json()) as ArticleRow[];
    const article = rows?.[0];
    if (!article) return next();

    return new Response(buildHtml(article), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=300",
        "x-rendered-by": "edge-og",
      },
    });
  } catch {
    return next();
  }
};

function buildHtml(a: ArticleRow): string {
  const url = `${SITE}/noticias/${a.slug}`;
  const baseTitle = a.meta_title || a.title;
  const category = a.categories?.name || "";
  const author = a.authors?.name || "Redacción";

  const titleParts = [baseTitle];
  if (category && !baseTitle.toLowerCase().includes(category.toLowerCase())) {
    titleParts.push(category);
  }
  titleParts.push("Ecos Digitales");
  const fullTitle = titleParts.join(" | ");

  const description =
    (a.meta_description || a.excerpt || truncate(stripHtml(a.content || ""), 155) || `Lee ${a.title} en Ecos Digitales`).trim();

  const image = a.og_image_url || a.featured_image_url || FALLBACK_IMAGE;
  const imageAlt = a.featured_image_alt || a.title;

  const keywords = (category && CATEGORY_KEYWORDS[category])
    ? CATEGORY_KEYWORDS[category].join(", ")
    : "tecnología, noticias tech, startups, inteligencia artificial, trabajo remoto";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    image: a.featured_image_url || undefined,
    datePublished: a.published_at,
    dateModified: a.updated_at || a.published_at,
    author: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: "Ecos Digitales",
      url: SITE,
    },
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(fullTitle)}</title>
<meta name="title" content="${esc(fullTitle)}" />
<meta name="description" content="${esc(description)}" />
<meta name="keywords" content="${esc(keywords)}" />
<meta name="author" content="${esc(author)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${esc(url)}" />

<meta property="og:type" content="article" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:title" content="${esc(fullTitle)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:alt" content="${esc(imageAlt)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Ecos Digitales" />
<meta property="og:locale" content="es_ES" />
<meta property="article:published_time" content="${esc(a.published_at)}" />
${a.updated_at ? `<meta property="article:modified_time" content="${esc(a.updated_at)}" />` : ""}
<meta property="article:author" content="${esc(author)}" />
${category ? `<meta property="article:section" content="${esc(category)}" />` : ""}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${esc(url)}" />
<meta name="twitter:title" content="${esc(fullTitle)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta name="twitter:image:alt" content="${esc(imageAlt)}" />
<meta name="twitter:site" content="@EcosDigitales" />

<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>
</head>
<body>
<article>
<h1>${esc(a.title)}</h1>
${a.subtitle ? `<h2>${esc(a.subtitle)}</h2>` : ""}
<p><strong>${esc(author)}</strong> · ${esc(a.published_at)}${category ? ` · ${esc(category)}` : ""}</p>
${a.featured_image_url ? `<img src="${esc(a.featured_image_url)}" alt="${esc(imageAlt)}" />` : ""}
<p>${esc(description)}</p>
<p><a href="${esc(url)}">Leer en Ecos Digitales</a></p>
</article>
</body>
</html>`;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n).trim() + "...";
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

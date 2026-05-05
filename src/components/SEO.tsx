import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  category?: string;
  /** Si es true, el title del <title> y og:title se usan tal cual, sin
   *  agregar "| Ecos Digitales" automáticamente. Útil para páginas con
   *  marca propia ("Ediciones del Mes"). */
  bareTitle?: boolean;
  // JSON-LD structured data
  jsonLd?: Record<string, unknown>;
}

// Category to keywords mapping for SEO
const categoryKeywords: Record<string, string[]> = {
  'IA': ['inteligencia artificial', 'machine learning', 'deep learning', 'AI', 'GPT', 'LLM'],
  'Inteligencia Artificial': ['inteligencia artificial', 'machine learning', 'AI', 'GPT', 'LLM', 'deep learning'],
  'No Code': ['no code', 'low code', 'herramientas sin código', 'automatización', 'Bubble', 'Webflow'],
  'Startups': ['startups', 'emprendimiento', 'venture capital', 'inversión', 'unicornio'],
  'Trabajo Remoto': ['trabajo remoto', 'remote work', 'teletrabajo', 'home office', 'nómada digital'],
  'Productividad': ['productividad', 'gestión del tiempo', 'herramientas', 'eficiencia'],
  'Ciberseguridad': ['ciberseguridad', 'seguridad informática', 'hacking', 'privacidad', 'datos'],
  'Blockchain': ['blockchain', 'crypto', 'web3', 'DeFi', 'NFT'],
  'Hardware': ['hardware', 'dispositivos', 'gadgets', 'chips', 'procesadores'],
  'Software': ['software', 'desarrollo', 'programación', 'apps', 'SaaS'],
};

export const SEO = ({
  title,
  description,
  image = 'https://pub-a5d6cd3eaa334d2cac388aee0fa7c1f5.r2.dev/logo-og.jpg',
  url,
  type = 'website',
  publishedTime,
  author,
  category,
  bareTitle = false,
  jsonLd,
}: SEOProps) => {
  // Include category in title if provided
  const titleParts = [title];
  if (!bareTitle && category && !title.toLowerCase().includes(category.toLowerCase())) {
    titleParts.push(category);
  }
  if (!bareTitle) {
    titleParts.push('Ecos Digitales');
  }
  const fullTitle = titleParts.join(' | ');

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Get keywords based on category
  const keywords = category
    ? (categoryKeywords[category] || [category]).join(', ')
    : 'tecnología, noticias tech, startups, inteligencia artificial, trabajo remoto';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Ecos Digitales" />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

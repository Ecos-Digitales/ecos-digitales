// Re-export types from the main hook
export type { Article, ArticleListing } from "@/hooks/useArticles";
import type { Article } from "@/hooks/useArticles";

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "OpenAI presenta GPT-5: El modelo más avanzado hasta la fecha",
    subtitle: null,
    excerpt: "La nueva versión promete capacidades de razonamiento sin precedentes.",
    content: "OpenAI ha anunciado oficialmente el lanzamiento de GPT-5, su modelo de lenguaje más avanzado hasta la fecha.",
    category_name: "Inteligencia Artificial",
    featured_image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    featured_image_alt: "GPT-5",
    author_name: "María García",
    published_at: "2026-01-23T10:00:00Z",
    reading_time_minutes: 5,
    slug: "openai-presenta-gpt-5-modelo-avanzado",
    status: "published",
    created_at: "2026-01-23T09:00:00Z",
    updated_at: "2026-01-23T10:00:00Z",
    views: 0,
    likes: 0,
    clicks: 0,
    is_featured: false,
    is_trending: false,
    is_pinned: false,
    pinned_order: 0,
    article_tags: null,
    meta_title: null,
    meta_description: null,
    og_image_url: null,
  },
];

export const getPublishedArticles = () =>
  mockArticles.filter(article => article.status === 'published')
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

export const getArticleBySlug = (slug: string) =>
  mockArticles.find(article => article.slug === slug && article.status === 'published');

export const getRelatedArticles = (currentSlug: string, category: string, limit: number = 3) => {
  const sameCategoryArticles = getPublishedArticles()
    .filter(article => article.slug !== currentSlug && article.category_name === category);

  if (sameCategoryArticles.length >= limit) {
    return sameCategoryArticles.slice(0, limit);
  }

  const otherArticles = getPublishedArticles()
    .filter(article => article.slug !== currentSlug && article.category_name !== category);

  return [...sameCategoryArticles, ...otherArticles].slice(0, limit);
};

import { useState } from "react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/data/mockArticles";

interface ArticleFeedProps {
  articles: Article[];
  title?: string;
}

export const ArticleFeed = ({ articles, title = "Últimas noticias" }: ArticleFeedProps) => {
  const [visibleCount, setVisibleCount] = useState(9);
  const displayedArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  if (articles.length === 0) {
    return (
      <section className="container py-8">
        <h2 className="mb-6 text-xl font-semibold text-foreground">{title}</h2>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No hay más artículos disponibles.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-3 md:py-4">
      <h2 className="mb-6 text-xl font-semibold text-foreground">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedArticles.map((article) => (
          <div key={article.id}>
            <ArticleCard article={article} variant="grid" />
          </div>
        ))}
      </div>
      
      {/* Load more button - always visible */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleLoadMore}
          disabled={!hasMore}
          className="rounded-full border border-border bg-card px-8 py-3 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground"
        >
          {hasMore ? "Cargar más noticias" : "No hay más noticias"}
        </button>
      </div>
    </section>
  );
};

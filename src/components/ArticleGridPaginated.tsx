import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArticleCard } from "./ArticleCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import type { Article } from "@/data/mockArticles";

interface ArticleGridPaginatedProps {
  articles: Article[];
  articlesPerPage?: number;
}

export const ArticleGridPaginated = ({
  articles,
  articlesPerPage = 9,
}: ArticleGridPaginatedProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = articles.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No hay artículos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mobile: Compact list style (like LatestNewsWidget) */}
      <div className="block sm:hidden space-y-2">
        {currentArticles.map((article) => {
          const formattedDate = format(new Date(article.published_date), "d MMM", { locale: es }).toUpperCase();
          
          return (
            <Link
              key={article.id}
              to={`/noticias/${article.slug}`}
              className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
            >
              <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <h4 className="line-clamp-2 text-xs font-medium text-foreground transition-colors group-hover:text-primary leading-tight">
                  {article.title}
                </h4>
                <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop/Tablet: Grid style */}
      <div className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="grid"
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-10 w-10 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const shouldShow =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1;

              if (!shouldShow) {
                if (page === 2 && currentPage > 3) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                if (page === totalPages - 1 && currentPage < totalPages - 2) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => goToPage(page)}
                  className="h-10 w-10 rounded-full"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-10 w-10 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page indicator */}
      <p className="text-center text-sm text-muted-foreground">
        Mostrando {startIndex + 1}-{Math.min(endIndex, articles.length)} de{" "}
        {articles.length} artículos
      </p>
    </div>
  );
};

import { Link } from "react-router-dom";
import { ArticleListing } from "@/hooks/useArticles";
import { OptimizedImage } from "./OptimizedImage";

interface InlineRelatedArticlesProps {
  articles: ArticleListing[];
  currentSlug: string;
}

export const InlineRelatedArticles = ({ articles, currentSlug }: InlineRelatedArticlesProps) => {
  const displayed = articles.filter(a => a.slug !== currentSlug).slice(0, 2);
  if (displayed.length === 0) return null;

  return (
    <aside className="my-10 rounded-lg bg-muted/40 p-5">
      <p className="mb-3 text-sm font-semibold tracking-wider text-muted-foreground">
        Te puede interesar
      </p>
      <div className="flex flex-col gap-1">
        {displayed.map(article => (
          <Link
            key={article.slug}
            to={`/noticias/${article.slug}`}
            className="group flex flex-row items-center gap-3 no-underline"
          >
            {article.featured_image_url && (
              <div className="block rounded overflow-hidden" style={{ width: 88, height: 53, flexShrink: 0 }}>
                <OptimizedImage
                  src={article.featured_image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  sizes="88px"
                />
              </div>
            )}
            <span className="text-sm lg:text-[17px] font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
              {article.title}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

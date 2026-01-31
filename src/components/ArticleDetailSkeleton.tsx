import { Skeleton } from "@/components/ui/skeleton";

export const ArticleDetailSkeleton = () => {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      {/* Category Tag */}
      <div className="mb-4">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Title */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-10 w-full sm:h-12" />
        <Skeleton className="h-10 w-4/5 sm:h-12" />
      </div>

      {/* Meta: Author, Date, Reading Time */}
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Featured Image */}
      <Skeleton className="mb-10 aspect-video w-full rounded-2xl" />

      {/* Content Paragraphs */}
      <div className="space-y-6">
        {/* First paragraph */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Subheading */}
        <Skeleton className="mt-10 h-7 w-2/3" />

        {/* Second paragraph */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* List items */}
        <div className="ml-6 space-y-3">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Third paragraph */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Related Articles Section */}
      <div className="mt-12 border-t border-border pt-8">
        <Skeleton className="mb-6 h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="rounded-xl border border-border bg-card p-4 opacity-0 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Skeleton className="mb-3 aspect-video w-full rounded-lg" />
              <Skeleton className="mb-2 h-4 w-16 rounded-full" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

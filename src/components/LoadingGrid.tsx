import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

export const LoadingGrid = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero section skeleton */}
      <div className="grid gap-5 lg:grid-cols-4">
        {/* Left column */}
        <div className="hidden lg:grid lg:col-span-1 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="relative h-[230px] rounded-xl overflow-hidden bg-muted">
              <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Center - Featured */}
        <div className="lg:col-span-2">
          <div className="relative min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] rounded-2xl overflow-hidden bg-muted">
            <Skeleton className="absolute inset-0 h-full w-full rounded-2xl" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 space-y-3">
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="hidden lg:grid lg:col-span-1 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="relative h-[230px] rounded-xl overflow-hidden bg-muted">
              <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video section skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="w-full md:w-80 lg:w-96 aspect-video rounded-xl" />
        </div>
      </div>

      {/* Articles grid skeleton */}
      <div>
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} delay={i * 100} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ArticleCardSkeletonProps {
  delay?: number;
}

const ArticleCardSkeleton = ({ delay = 0 }: ArticleCardSkeletonProps) => {
  return (
    <div 
      className={cn(
        "flex items-start gap-4 rounded-xl border border-border bg-card p-5 opacity-0 animate-fade-in"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex-1 space-y-3">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="pt-2">
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <Skeleton className="h-20 w-24 rounded-lg flex-shrink-0" />
    </div>
  );
};

export const JobsLoadingSkeleton = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      {Array.from({ length: 5 }).map((_, i) => (
        <div 
          key={i}
          className="rounded-lg border border-border bg-card p-5 opacity-0 animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

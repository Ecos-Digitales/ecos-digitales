import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "pulse" | "shimmer";
}

export const Skeleton = ({ className, variant = "shimmer" }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted",
        variant === "shimmer" 
          ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"
          : "animate-pulse",
        className
      )}
    />
  );
};

export const ArticleCardSkeleton = ({ variant = "medium" }: { variant?: "large" | "medium" | "list" }) => {
  if (variant === "list") {
    return (
      <div className="flex gap-4 p-3 animate-fade-in">
        <Skeleton className="h-20 w-28 flex-shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col justify-center gap-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-card animate-fade-in">
      <Skeleton className={cn("w-full", variant === "large" ? "h-60 sm:h-72" : "h-40 sm:h-48")} />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
};

export const HeroGridSkeleton = () => {
  return (
    <section className="container py-6 md:py-8 animate-fade-in">
      <div className="grid gap-5 lg:grid-cols-4">
        {/* Left column */}
        <div className="hidden lg:grid lg:col-span-1 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="relative h-[230px] rounded-xl overflow-hidden">
              <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Center - Featured */}
        <div className="lg:col-span-2">
          <div className="relative min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] rounded-2xl overflow-hidden">
            <Skeleton className="absolute inset-0 h-full w-full rounded-2xl" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 space-y-3">
              <Skeleton className="h-8 w-4/5 bg-white/10" />
              <Skeleton className="h-6 w-3/5 bg-white/10" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="hidden lg:grid lg:col-span-1 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="relative h-[230px] rounded-xl overflow-hidden">
              <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

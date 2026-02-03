import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Building2 } from "lucide-react";
import { Job, useJobs, formatRelativeDate } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";

interface SimilarJobsProps {
  currentJob: Job;
}

const INITIAL_JOBS = 3;
const JOBS_PER_LOAD = 9;

export const SimilarJobs = ({ currentJob }: SimilarJobsProps) => {
  const { data: jobs } = useJobs();
  const [visibleCount, setVisibleCount] = useState(INITIAL_JOBS);

  const allSimilarJobs = jobs
    ?.filter(
      (job) =>
        job.id !== currentJob.id &&
        job.category === currentJob.category
    ) || [];

  const visibleJobs = allSimilarJobs.slice(0, visibleCount);
  const hasMore = visibleCount < allSimilarJobs.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + JOBS_PER_LOAD);
  };

  if (allSimilarJobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay más oportunidades en esta categoría por el momento.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleJobs.map((job) => (
          <Link
            key={job.id}
            to={`/trabajos/${job.slug}`}
            className="group block rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              {/* Company Logo */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
                {job.company_logo ? (
                  <img
                    src={job.company_logo}
                    alt={job.company}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {job.title}
                </h4>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span>{job.remote_type}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatRelativeDate(job.published_date)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="w-full sm:w-auto"
          >
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
};

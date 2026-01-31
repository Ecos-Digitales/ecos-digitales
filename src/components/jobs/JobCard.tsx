import { Link } from "react-router-dom";
import { MapPin, Building2, Star } from "lucide-react";
import { Job, formatSalary, formatRelativeDate } from "@/hooks/useJobs";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "../OptimizedImage";

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  return (
    <Link
      to={`/trabajos/${job.slug}`}
      className="group block rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
          {job.company_logo ? (
            <OptimizedImage
              src={job.company_logo}
              alt={job.company}
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Badges Row */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {job.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                <Star className="h-3 w-3" />
                Destacado
              </span>
            )}
            {job.remote_type === "Remote" && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                Remote
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-1 text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {job.title}
          </h3>

          {/* Company */}
          <p className="mb-2 text-sm text-muted-foreground">
            {job.company}
          </p>

          {/* Location */}
          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{job.location}</span>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {job.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {salary && (
              <span className="text-sm font-medium text-foreground">
                {salary}
              </span>
            )}
            <span className={cn(
              "text-xs text-muted-foreground",
              !salary && "ml-auto"
            )}>
              {formatRelativeDate(job.published_date)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

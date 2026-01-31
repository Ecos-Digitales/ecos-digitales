import { cn } from "@/lib/utils";

export type SortOption = "recent" | "salary" | "featured";

interface JobSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "salary", label: "Mejor pagados" },
  { value: "featured", label: "Destacados" },
];

export const JobSort = ({ value, onChange }: JobSortProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Ordenar:</span>
      <div className="flex gap-1">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition-colors",
              value === option.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

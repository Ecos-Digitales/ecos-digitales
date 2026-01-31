import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LatestNewsWidget } from "./LatestNewsWidget";

interface JobFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedJobType: string | null;
  onSelectJobType: (type: string | null) => void;
  selectedLocation: string | null;
  onSelectLocation: (location: string | null) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const LOCATION_TYPES = ["Remote", "Hybrid", "On-site"];

export const JobFilters = ({
  selectedCategory,
  onSelectCategory,
  selectedJobType,
  onSelectJobType,
  selectedLocation,
  onSelectLocation,
  onClearFilters,
  hasActiveFilters,
}: JobFiltersProps) => {
  return (
    <aside className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <X className="h-4 w-4" />
          Limpiar filtros
        </button>
      )}

      {/* Latest News Widget */}
      <LatestNewsWidget />
    </aside>
  );
};


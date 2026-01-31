import { Search } from "lucide-react";

interface JobSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const JobSearch = ({ value, onChange }: JobSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Buscar por título o empresa..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-lg border border-border bg-background pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      />
    </div>
  );
};

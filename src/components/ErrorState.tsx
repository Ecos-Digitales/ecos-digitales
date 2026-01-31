import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  message = "Error al cargar los artículos",
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Algo salió mal
      </h3>
      <p className="mb-4 text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
};

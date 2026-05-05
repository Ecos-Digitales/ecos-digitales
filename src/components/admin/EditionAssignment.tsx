import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, BookMarked } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditionRow {
  id: string;
  slug: string;
  year: number;
  month: number;
  edition_number: number | null;
  title: string | null;
  is_published: boolean;
}

interface EditionWithFlag extends EditionRow {
  included: boolean;
  position: number | null;
}

const formatMonthYear = (year: number, month: number) => {
  const d = new Date(year, month - 1, 1);
  const formatted = format(d, "MMMM yyyy", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

interface EditionAssignmentProps {
  articleId: string;
}

/**
 * Panel inside the article editor that lets a human admin toggle an article
 * in/out of any of the most recent editions. Position is auto-assigned to
 * (max+1) when adding; can be tuned later via Supabase Studio if needed.
 */
export const EditionAssignment = ({ articleId }: EditionAssignmentProps) => {
  const [editions, setEditions] = useState<EditionWithFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    const [editionsRes, assignmentsRes] = await Promise.all([
      supabase
        .from("editions")
        .select("id, slug, year, month, edition_number, title, is_published")
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(12),
      supabase
        .from("edition_articles")
        .select("edition_id, position")
        .eq("article_id", articleId),
    ]);

    if (editionsRes.error) {
      toast.error("Error al cargar ediciones");
      setLoading(false);
      return;
    }

    const assignMap = new Map<string, number>(
      (assignmentsRes.data ?? []).map((a) => [a.edition_id, a.position])
    );

    setEditions(
      (editionsRes.data ?? []).map((e) => ({
        ...e,
        included: assignMap.has(e.id),
        position: assignMap.get(e.id) ?? null,
      }))
    );
    setLoading(false);
  }, [articleId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (edition: EditionWithFlag) => {
    setPendingId(edition.id);

    if (edition.included) {
      // Remove
      const { error } = await supabase
        .from("edition_articles")
        .delete()
        .eq("edition_id", edition.id)
        .eq("article_id", articleId);
      setPendingId(null);
      if (error) {
        toast.error("Error al quitar de la edición: " + error.message);
        return;
      }
      toast.success(`Quitada de ${formatMonthYear(edition.year, edition.month)}`);
      // Optimistic local update
      setEditions((prev) =>
        prev.map((e) => (e.id === edition.id ? { ...e, included: false, position: null } : e))
      );
    } else {
      // Add — fetch current max position to assign next slot
      const { data: maxRow, error: maxErr } = await supabase
        .from("edition_articles")
        .select("position")
        .eq("edition_id", edition.id)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxErr) {
        setPendingId(null);
        toast.error("Error al calcular posición: " + maxErr.message);
        return;
      }

      const nextPos = (maxRow?.position ?? 0) + 1;
      const { error: insErr } = await supabase
        .from("edition_articles")
        .insert({
          edition_id: edition.id,
          article_id: articleId,
          position: nextPos,
        });

      setPendingId(null);
      if (insErr) {
        toast.error("Error al agregar a la edición: " + insErr.message);
        return;
      }
      toast.success(`Agregada a ${formatMonthYear(edition.year, edition.month)} (posición ${nextPos})`);
      setEditions((prev) =>
        prev.map((e) => (e.id === edition.id ? { ...e, included: true, position: nextPos } : e))
      );
    }
  };

  return (
    <div>
      <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-400 mb-3">
        Ediciones del mes
      </label>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando ediciones…
        </div>
      ) : editions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-5 text-sm text-neutral-500 flex items-start gap-3">
          <BookMarked className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Todavía no hay ediciones creadas. Una vez creada la primera edición
            del mes, vas a poder marcar esta nota desde acá.
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 divide-y divide-neutral-100">
          {editions.map((e) => {
            const label =
              e.title ||
              `Edición de ${formatMonthYear(e.year, e.month)}`;
            const isPending = pendingId === e.id;
            return (
              <label
                key={e.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900/10 cursor-pointer"
                  checked={e.included}
                  disabled={isPending}
                  onChange={() => toggle(e)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-neutral-800 font-medium">
                      {label}
                    </span>
                    {e.edition_number != null && (
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                        Nº {e.edition_number}
                      </span>
                    )}
                    {!e.is_published && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-medium ring-1 ring-amber-200/50">
                        Borrador
                      </span>
                    )}
                  </div>
                  {e.included && e.position != null && (
                    <span className="block text-[11px] text-neutral-500 mt-0.5">
                      Posición {e.position} en la edición
                    </span>
                  )}
                </div>
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
              </label>
            );
          })}
        </div>
      )}

      <p className="mt-2 text-[11px] text-neutral-400">
        Marcar una edición agrega esta nota al final de su lista. Para
        reordenar las posiciones, usar Supabase Studio (por ahora).
      </p>
    </div>
  );
};

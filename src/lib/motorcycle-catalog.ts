import type { SupabaseClient } from "@supabase/supabase-js";
import type { MotorcycleCatalogEntry } from "@/types/database";

export function formatCatalogYearRange(
  e: Pick<MotorcycleCatalogEntry, "year_start" | "year_end">,
) {
  if (e.year_end == null || e.year_end === e.year_start) return String(e.year_start);
  return `${e.year_start}–${e.year_end}`;
}

export function formatMotorcycleCatalogLabel(
  e: Pick<MotorcycleCatalogEntry, "brand" | "model" | "year_start" | "year_end">,
) {
  return `${e.brand} ${e.model} (${formatCatalogYearRange(e)})`;
}

export async function loadMotorcycleCatalogEntries(
  supabase: SupabaseClient,
): Promise<MotorcycleCatalogEntry[]> {
  const { data, error } = await supabase
    .from("motorcycle_catalog_entries")
    .select("*")
    .order("brand", { ascending: true })
    .order("model", { ascending: true })
    .order("year_start", { ascending: true });

  if (error || !data) return [];
  return data as MotorcycleCatalogEntry[];
}

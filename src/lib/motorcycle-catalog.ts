import type { SupabaseClient } from "@supabase/supabase-js";
import type { MotorcycleCatalogEntry } from "@/types/database";

export function formatMotorcycleCatalogLabel(
  e: Pick<MotorcycleCatalogEntry, "brand" | "model" | "year">,
) {
  return `${e.brand} ${e.model} (${e.year})`;
}

export async function loadMotorcycleCatalogEntries(
  supabase: SupabaseClient,
): Promise<MotorcycleCatalogEntry[]> {
  const { data, error } = await supabase
    .from("motorcycle_catalog_entries")
    .select("*")
    .order("brand", { ascending: true })
    .order("model", { ascending: true })
    .order("year", { ascending: true });

  if (error || !data) return [];
  return data as MotorcycleCatalogEntry[];
}

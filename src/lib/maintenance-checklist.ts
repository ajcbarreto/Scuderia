import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MaintenanceChecklistPreset,
  MaintenanceChecklistPresetItem,
} from "@/types/database";

export type ChecklistPresetWithItems = MaintenanceChecklistPreset & {
  items: MaintenanceChecklistPresetItem[];
};

export type ChecklistPresetSummary = Pick<
  MaintenanceChecklistPreset,
  "id" | "brand" | "model" | "service_type_name" | "year_min" | "year_max"
>;

export function normalizePresetKey(s: string) {
  return s.trim().toLowerCase();
}

/**
 * O preset aplica-se ao ano de matrícula/modelo da mota?
 * - Sem limites (year_min e year_max nulos): qualquer ano, incluindo mota sem ano.
 * - Com algum limite: exige `motoYear` definido e dentro do intervalo [year_min, year_max] (inclusive; null = sem limite nesse lado).
 */
export function presetAppliesToMotoYear(
  motoYear: number | null,
  yearMin: number | null,
  yearMax: number | null,
): boolean {
  const unrestricted = yearMin == null && yearMax == null;
  if (unrestricted) return true;
  if (motoYear == null || Number.isNaN(motoYear)) return false;
  if (yearMin != null && motoYear < yearMin) return false;
  if (yearMax != null && motoYear > yearMax) return false;
  return true;
}

export function formatPresetYearRange(
  yearMin: number | null,
  yearMax: number | null,
): string {
  if (yearMin == null && yearMax == null) return "Todos os anos";
  if (yearMin != null && yearMax != null) {
    if (yearMin === yearMax) return String(yearMin);
    return `${yearMin}–${yearMax}`;
  }
  if (yearMin != null) return `≥ ${yearMin}`;
  return `≤ ${yearMax!}`;
}

const PRESET_SELECT_BASE =
  "id, brand, model, service_type_name, year_min, year_max, notes, created_at, updated_at, maintenance_checklist_preset_items ( id, preset_id, label, sort_order )";

function mapRowToPresetWithItems(
  row: MaintenanceChecklistPreset & {
    maintenance_checklist_preset_items?: MaintenanceChecklistPresetItem[];
  },
): ChecklistPresetWithItems {
  const rawItems = row.maintenance_checklist_preset_items ?? [];
  const items = [...rawItems].sort((a, c) => a.sort_order - c.sort_order);
  const { maintenance_checklist_preset_items: _nested, ...rest } = row;
  const preset: MaintenanceChecklistPreset = {
    ...(rest as MaintenanceChecklistPreset),
    year_min: (rest as { year_min?: number | null }).year_min ?? null,
    year_max: (rest as { year_max?: number | null }).year_max ?? null,
  };
  return { ...preset, items };
}

/**
 * Presets cuja marca, modelo e intervalo de anos coincidem com a mota.
 */
export async function loadChecklistPresetsForMoto(
  supabase: SupabaseClient,
  brand: string,
  model: string,
  motoYear: number | null,
): Promise<ChecklistPresetWithItems[]> {
  const { data, error } = await supabase
    .from("maintenance_checklist_presets")
    .select(PRESET_SELECT_BASE)
    .order("service_type_name", { ascending: true });

  if (error || !data?.length) return [];

  const b = normalizePresetKey(brand);
  const m = normalizePresetKey(model);

  return data
    .filter((row) => {
      const p = row as MaintenanceChecklistPreset;
      if (normalizePresetKey(p.brand) !== b || normalizePresetKey(p.model) !== m) {
        return false;
      }
      return presetAppliesToMotoYear(
        motoYear,
        p.year_min ?? null,
        p.year_max ?? null,
      );
    })
    .map((row) =>
      mapRowToPresetWithItems(
        row as MaintenanceChecklistPreset & {
          maintenance_checklist_preset_items?: MaintenanceChecklistPresetItem[];
        },
      ),
    );
}

/**
 * Todos os presets (resumo), para cruzar com a frota numa só leitura.
 */
export async function loadAllChecklistPresetSummaries(
  supabase: SupabaseClient,
): Promise<ChecklistPresetSummary[]> {
  const { data, error } = await supabase
    .from("maintenance_checklist_presets")
    .select("id, brand, model, service_type_name, year_min, year_max")
    .order("brand", { ascending: true })
    .order("model", { ascending: true })
    .order("service_type_name", { ascending: true });

  if (error || !data) return [];
  return (data as ChecklistPresetSummary[]).map((p) => ({
    ...p,
    year_min: p.year_min ?? null,
    year_max: p.year_max ?? null,
  }));
}

export function presetSummaryKey(brand: string, model: string) {
  return `${normalizePresetKey(brand)}|${normalizePresetKey(model)}`;
}

export function countPresetsApplicableToMoto(
  summaries: ChecklistPresetSummary[],
  brand: string,
  model: string,
  motoYear: number | null,
): number {
  const key = presetSummaryKey(brand, model);
  return summaries.filter((p) => {
    if (presetSummaryKey(p.brand, p.model) !== key) return false;
    return presetAppliesToMotoYear(motoYear, p.year_min, p.year_max);
  }).length;
}

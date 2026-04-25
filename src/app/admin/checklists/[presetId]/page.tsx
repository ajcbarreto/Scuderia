import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadMotorcycleCatalogEntries } from "@/lib/motorcycle-catalog";
import { PresetEditor } from "@/app/admin/checklists/preset-editor";
import type {
  MaintenanceChecklistPreset,
  MaintenanceChecklistPresetItem,
} from "@/types/database";

type Props = { params: Promise<{ presetId: string }> };

export default async function AdminChecklistPresetDetailPage({ params }: Props) {
  const { presetId } = await params;
  const supabase = await createClient();

  const { data: preset } = await supabase
    .from("maintenance_checklist_presets")
    .select("*")
    .eq("id", presetId)
    .maybeSingle();

  if (!preset) notFound();

  const raw = preset as MaintenanceChecklistPreset & {
    year_min?: number | null;
    year_max?: number | null;
  };
  const normalized: MaintenanceChecklistPreset = {
    ...raw,
    year_min: raw.year_min ?? null,
    year_max: raw.year_max ?? null,
    catalog_entry_id: raw.catalog_entry_id ?? null,
  };

  const catalogEntries = await loadMotorcycleCatalogEntries(supabase);

  const { data: itemRows } = await supabase
    .from("maintenance_checklist_preset_items")
    .select("*")
    .eq("preset_id", presetId)
    .order("sort_order", { ascending: true });

  const items = (itemRows ?? []) as MaintenanceChecklistPresetItem[];

  return (
    <PresetEditor preset={normalized} items={items} catalogEntries={catalogEntries} />
  );
}

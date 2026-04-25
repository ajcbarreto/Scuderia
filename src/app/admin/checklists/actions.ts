"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, type ActionState } from "@/app/admin/actions";

function parseYearBoundsFromForm(formData: FormData): {
  year_min: number | null;
  year_max: number | null;
  error?: string;
} {
  const minRaw = String(formData.get("year_min") ?? "").trim();
  const maxRaw = String(formData.get("year_max") ?? "").trim();
  let year_min: number | null = null;
  let year_max: number | null = null;

  if (minRaw !== "") {
    const n = Number.parseInt(minRaw, 10);
    if (Number.isNaN(n) || n < 1900 || n > 2100) {
      return { year_min: null, year_max: null, error: "Ano mínimo inválido (1900–2100)." };
    }
    year_min = n;
  }
  if (maxRaw !== "") {
    const n = Number.parseInt(maxRaw, 10);
    if (Number.isNaN(n) || n < 1900 || n > 2100) {
      return { year_min: null, year_max: null, error: "Ano máximo inválido (1900–2100)." };
    }
    year_max = n;
  }
  if (year_min != null && year_max != null && year_min > year_max) {
    return {
      year_min,
      year_max,
      error: "O ano mínimo não pode ser maior que o ano máximo.",
    };
  }
  return { year_min, year_max };
}

function revalidateChecklistPaths(presetId?: string) {
  revalidatePath("/admin/checklists");
  revalidatePath("/admin/checklists/motas");
  revalidatePath("/admin/catalogo-motos");
  if (presetId) revalidatePath(`/admin/checklists/${presetId}`);
}

export async function createChecklistPreset(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const catalogEntryId = String(formData.get("catalog_entry_id") ?? "").trim();
  let brand = String(formData.get("brand") ?? "").trim();
  let model = String(formData.get("model") ?? "").trim();
  const serviceTypeName = String(formData.get("service_type_name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const bounds = parseYearBoundsFromForm(formData);
  if (bounds.error) return { error: bounds.error };

  let year_min = bounds.year_min;
  let year_max = bounds.year_max;

  if (catalogEntryId) {
    const { data: entry, error: eErr } = await supabase
      .from("motorcycle_catalog_entries")
      .select("id, brand, model, year")
      .eq("id", catalogEntryId)
      .maybeSingle();
    if (eErr || !entry) {
      return { error: "Entrada do catálogo inválida ou já não existe." };
    }
    brand = String(entry.brand).trim();
    model = String(entry.model).trim();
  }

  if (!brand || !model || !serviceTypeName) {
    return { error: "Marca, modelo e tipo de serviço são obrigatórios." };
  }

  const { data: row, error } = await supabase
    .from("maintenance_checklist_presets")
    .insert({
      brand,
      model,
      service_type_name: serviceTypeName,
      notes,
      year_min,
      year_max,
      catalog_entry_id: catalogEntryId || null,
    })
    .select("id")
    .single();

  if (error || !row) {
    if (error?.code === "23505") {
      return {
        error:
          "Já existe um preset com a mesma combinação marca, modelo, tipo de serviço e intervalo de anos.",
      };
    }
    return { error: error?.message ?? "Não foi possível criar o preset." };
  }

  revalidateChecklistPaths();
  redirect(`/admin/checklists/${row.id}`);
}

export async function updateChecklistPreset(
  presetId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const catalogEntryId = String(formData.get("catalog_entry_id") ?? "").trim();
  let brand = String(formData.get("brand") ?? "").trim();
  let model = String(formData.get("model") ?? "").trim();
  const serviceTypeName = String(formData.get("service_type_name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const bounds = parseYearBoundsFromForm(formData);
  if (bounds.error) return { error: bounds.error };

  let year_min = bounds.year_min;
  let year_max = bounds.year_max;

  if (catalogEntryId) {
    const { data: entry, error: eErr } = await supabase
      .from("motorcycle_catalog_entries")
      .select("id, brand, model, year")
      .eq("id", catalogEntryId)
      .maybeSingle();
    if (eErr || !entry) {
      return { error: "Entrada do catálogo inválida ou já não existe." };
    }
    brand = String(entry.brand).trim();
    model = String(entry.model).trim();
  }

  if (!brand || !model || !serviceTypeName) {
    return { error: "Marca, modelo e tipo de serviço são obrigatórios." };
  }

  const { error } = await supabase
    .from("maintenance_checklist_presets")
    .update({
      brand,
      model,
      service_type_name: serviceTypeName,
      notes,
      year_min,
      year_max,
      catalog_entry_id: catalogEntryId || null,
    })
    .eq("id", presetId);

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "Já existe outro preset com a mesma combinação marca, modelo, tipo de serviço e intervalo de anos.",
      };
    }
    return { error: error.message };
  }

  revalidateChecklistPaths(presetId);
  return { ok: true };
}

export async function deleteChecklistPreset(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("preset_id") ?? "").trim();
  if (!id) return;

  await supabase.from("maintenance_checklist_presets").delete().eq("id", id);
  revalidateChecklistPaths();
  redirect("/admin/checklists");
}

export async function addChecklistPresetItem(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const presetId = String(formData.get("preset_id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!presetId) return { error: "Preset em falta." };
  if (!label) return { error: "Indica a descrição do serviço." };

  const { data: last } = await supabase
    .from("maintenance_checklist_preset_items")
    .select("sort_order")
    .eq("preset_id", presetId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (last?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("maintenance_checklist_preset_items").insert({
    preset_id: presetId,
    label,
    sort_order: nextOrder,
  });

  if (error) {
    return { error: error.message };
  }
  revalidateChecklistPaths(presetId);
  return { ok: true };
}

export async function deleteChecklistPresetItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const itemId = String(formData.get("item_id") ?? "").trim();
  const presetId = String(formData.get("preset_id") ?? "").trim();
  if (!itemId || !presetId) return;

  await supabase.from("maintenance_checklist_preset_items").delete().eq("id", itemId);
  revalidateChecklistPaths(presetId);
}

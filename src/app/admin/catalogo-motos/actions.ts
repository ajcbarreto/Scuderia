"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, type ActionState } from "@/app/admin/actions";

function revalidateCatalogPaths() {
  revalidatePath("/admin/catalogo-motos");
  revalidatePath("/admin/motas");
  revalidatePath("/admin/checklists");
  revalidatePath("/admin/checklists/new");
  revalidatePath("/admin/checklists/motas");
}

export async function createMotorcycleCatalogEntry(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!brand || !model || !yearRaw) {
    return { error: "Marca, modelo e ano são obrigatórios." };
  }
  const year = Number.parseInt(yearRaw, 10);
  if (Number.isNaN(year) || year < 1900 || year > 2100) {
    return { error: "Ano inválido (1900–2100)." };
  }

  const { error } = await supabase.from("motorcycle_catalog_entries").insert({
    brand,
    model,
    year,
    notes,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe esta combinação marca, modelo e ano no catálogo." };
    }
    return { error: error.message };
  }

  revalidateCatalogPaths();
  return { ok: true };
}

export async function deleteMotorcycleCatalogEntry(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("entry_id") ?? "").trim();
  if (!id) return;

  await supabase.from("motorcycle_catalog_entries").delete().eq("id", id);
  revalidateCatalogPaths();
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, type ActionState } from "@/app/admin/actions";

function revalidateCatalogPaths() {
  revalidatePath("/admin/catalogo-motos");
  revalidatePath("/admin/motas");
  revalidatePath("/admin/checklists");
}

export async function createMotorcycleCatalogEntry(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yearStartRaw = String(formData.get("year_start") ?? "").trim();
  const yearEndRaw = String(formData.get("year_end") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!brand || !model || !yearStartRaw) {
    return { error: "Marca, modelo e ano de início são obrigatórios." };
  }
  const year_start = Number.parseInt(yearStartRaw, 10);
  if (Number.isNaN(year_start) || year_start < 1900 || year_start > 2100) {
    return { error: "Ano de início inválido (1900–2100)." };
  }
  let year_end: number | null = null;
  if (yearEndRaw !== "") {
    const ye = Number.parseInt(yearEndRaw, 10);
    if (Number.isNaN(ye) || ye < 1900 || ye > 2100) {
      return { error: "Ano de fim inválido (1900–2100)." };
    }
    if (ye < year_start) {
      return { error: "O ano de fim tem de ser igual ou superior ao de início." };
    }
    year_end = ye;
  }

  const { error } = await supabase.from("motorcycle_catalog_entries").insert({
    brand,
    model,
    year_start,
    year_end,
    notes,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe esta combinação marca, modelo e intervalo de anos no catálogo." };
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

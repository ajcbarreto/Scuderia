"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/admin/actions";

function revalidate() {
  revalidatePath("/admin/checklists");
  revalidatePath("/admin/boletins");
}

export async function addTaskTemplateForm(formData: FormData) {
  const { supabase } = await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;

  const { data: last } = await supabase
    .from("service_task_templates")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (last?.sort_order ?? -1) + 1;

  await supabase.from("service_task_templates").insert({
    label,
    sort_order: nextOrder,
  });
  revalidate();
}

export async function deleteTaskTemplateForm(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const { supabase } = await requireAdmin();
  await supabase.from("service_task_templates").delete().eq("id", id);
  revalidate();
}

export async function updateTaskTemplateLabelForm(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!id || !label) return;

  await supabase.from("service_task_templates").update({ label }).eq("id", id);
  revalidate();
}

export async function moveTaskTemplateForm(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const dir = String(formData.get("direction") ?? "").trim();
  if (!id || (dir !== "up" && dir !== "down")) return;

  const { supabase } = await requireAdmin();

  const { data: rows } = await supabase
    .from("service_task_templates")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  const list = rows ?? [];
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return;

  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= list.length) return;

  const a = list[idx]!;
  const b = list[swapWith]!;
  const orderA = a.sort_order;
  const orderB = b.sort_order;

  await supabase.from("service_task_templates").update({ sort_order: orderB }).eq("id", a.id);
  await supabase.from("service_task_templates").update({ sort_order: orderA }).eq("id", b.id);
  revalidate();
}

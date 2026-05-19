"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, type ActionState } from "@/app/admin/actions";

export async function updateClosedWeekdays(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const days: number[] = [];
  for (let d = 0; d <= 6; d++) {
    if (formData.get(`weekday_${d}`) === "on") {
      days.push(d);
    }
  }

  const { error } = await supabase
    .from("workshop_settings")
    .update({ closed_weekdays: days })
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/admin/oficina");
  revalidatePath("/agendamento");
  return { ok: true };
}

export async function addClosedDate(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const date = String(formData.get("closed_date") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Data inválida." };
  }

  const { error } = await supabase
    .from("workshop_closed_dates")
    .insert({ closed_date: date, note });

  if (error) {
    if (error.code === "23505") {
      return { error: "Essa data já está fechada." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/oficina");
  revalidatePath("/agendamento");
  return { ok: true };
}

export async function removeClosedDate(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("workshop_closed_dates")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/oficina");
  revalidatePath("/agendamento");
  return { ok: true };
}

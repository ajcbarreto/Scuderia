"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, type ActionState } from "@/app/admin/actions";
import { fetchGuimaraesHolidaysForYears } from "@/lib/garagem/guimaraes-holidays";

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

/**
 * Adiciona uma data ou um intervalo de datas fechadas.
 * Se `end_date` estiver presente e for posterior, insere todas as datas
 * do intervalo (inclusive). Datas já existentes são ignoradas silenciosamente.
 */
export async function addClosedDate(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const startDate = String(formData.get("closed_date") ?? "").trim();
  const endDateRaw = String(formData.get("end_date") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return { error: "Data inválida." };
  }

  let endDate = startDate;
  if (endDateRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDateRaw)) {
      return { error: "Data final inválida." };
    }
    if (endDateRaw < startDate) {
      return {
        error: "A data final tem de ser igual ou posterior à inicial.",
      };
    }
    endDate = endDateRaw;
  }

  // Gera todas as datas no intervalo (inclusive).
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T12:00:00`);
  const limit = new Date(`${endDate}T12:00:00`);
  while (cursor.getTime() <= limit.getTime()) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }

  if (dates.length > 366) {
    return { error: "Intervalo demasiado longo (máximo 1 ano)." };
  }

  // Verifica quais já existem para reportar com precisão ao operador.
  const { data: existing } = await supabase
    .from("workshop_closed_dates")
    .select("closed_date")
    .in("closed_date", dates);

  const existingSet = new Set(
    (existing ?? []).map((r) => r.closed_date as string),
  );
  const toInsert = dates
    .filter((d) => !existingSet.has(d))
    .map((closed_date) => ({ closed_date, note }));

  if (toInsert.length === 0) {
    return { error: "Essas datas já estão todas fechadas." };
  }

  const { error } = await supabase
    .from("workshop_closed_dates")
    .insert(toInsert);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/oficina");
  revalidatePath("/agendamento");

  const inserted = toInsert.length;
  const skipped = dates.length - inserted;
  const info =
    inserted === 1
      ? "Data adicionada."
      : `${inserted} datas adicionadas${skipped > 0 ? ` (${skipped} já existiam)` : ""}.`;
  return { ok: true, info };
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

/** Remove várias datas fechadas de uma só vez (ex.: remover um grupo/intervalo). */
/** Importa feriados nacionais + municipal de Guimarães para o ano atual e o seguinte. */
export async function importGuimaraesHolidays(): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const currentYear = new Date().getFullYear();
  let holidays;
  try {
    holidays = await fetchGuimaraesHolidaysForYears([
      currentYear,
      currentYear + 1,
    ]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao obter feriados.";
    return { error: msg };
  }

  if (holidays.length === 0) {
    return { error: "Nenhum feriado encontrado." };
  }

  const dates = holidays.map((h) => h.date);
  const { data: existing } = await supabase
    .from("workshop_closed_dates")
    .select("closed_date")
    .in("closed_date", dates);

  const existingSet = new Set(
    (existing ?? []).map((r) => r.closed_date as string),
  );
  const toInsert = holidays
    .filter((h) => !existingSet.has(h.date))
    .map((h) => ({ closed_date: h.date, note: h.note }));

  if (toInsert.length === 0) {
    return {
      ok: true,
      info: `Todos os feriados de ${currentYear} e ${currentYear + 1} já estão registados.`,
    };
  }

  const { error } = await supabase
    .from("workshop_closed_dates")
    .insert(toInsert);

  if (error) return { error: error.message };

  revalidatePath("/admin/oficina");
  revalidatePath("/agendamento");

  const skipped = holidays.length - toInsert.length;
  const info =
    skipped > 0
      ? `${toInsert.length} feriados adicionados (${skipped} já existiam).`
      : `${toInsert.length} feriados adicionados.`;
  return { ok: true, info };
}

export async function removeClosedDates(ids: string[]): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const validIds = ids.filter((id) => typeof id === "string" && id.length > 0);
  if (validIds.length === 0) {
    return { error: "Nenhuma data selecionada." };
  }
  const { error } = await supabase
    .from("workshop_closed_dates")
    .delete()
    .in("id", validIds);
  if (error) return { error: error.message };

  revalidatePath("/admin/oficina");
  revalidatePath("/agendamento");
  return { ok: true };
}

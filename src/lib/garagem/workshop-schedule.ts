import type { SupabaseClient } from "@supabase/supabase-js";

export type WorkshopSchedule = {
  /** 0 = domingo, 1 = segunda, … 6 = sábado. */
  closedWeekdays: number[];
  /** Lista ordenada de datas fechadas no formato `YYYY-MM-DD`. */
  closedDates: { id: string; date: string; note: string | null }[];
};

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

/** Carrega configuração + datas fechadas em paralelo. */
export async function loadWorkshopSchedule(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
): Promise<WorkshopSchedule> {
  const [settingsRes, datesRes] = await Promise.all([
    supabase
      .from("workshop_settings")
      .select("closed_weekdays")
      .eq("id", true)
      .maybeSingle(),
    supabase
      .from("workshop_closed_dates")
      .select("id, closed_date, note")
      .order("closed_date", { ascending: true }),
  ]);

  const closedWeekdays = ((settingsRes.data?.closed_weekdays as number[] | null) ??
    [0]) as number[];
  const closedDates = (
    (datesRes.data ?? []) as {
      id: string;
      closed_date: string;
      note: string | null;
    }[]
  ).map((r) => ({ id: r.id, date: r.closed_date, note: r.note }));

  return { closedWeekdays, closedDates };
}

function toIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Devolve a razão pela qual a data está fechada, ou `null` se a oficina abre. */
export function getClosedReason(
  dateInput: Date | string,
  schedule: WorkshopSchedule,
): string | null {
  const date =
    typeof dateInput === "string"
      ? new Date(`${dateInput.slice(0, 10)}T12:00:00`)
      : dateInput;
  if (Number.isNaN(date.getTime())) return null;

  const weekday = date.getDay();
  if (schedule.closedWeekdays.includes(weekday)) {
    return `A oficina está fechada à ${WEEKDAY_LABELS[weekday].toLowerCase()}.`;
  }

  const iso = toIsoLocal(date);
  const closed = schedule.closedDates.find((d) => d.date === iso);
  if (closed) {
    return closed.note?.trim()
      ? `Fechado: ${closed.note.trim()}`
      : "A oficina está fechada nesta data.";
  }

  return null;
}

export function isDateClosed(
  dateInput: Date | string,
  schedule: WorkshopSchedule,
): boolean {
  return getClosedReason(dateInput, schedule) !== null;
}

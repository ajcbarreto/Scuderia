"use client";

import { useActionState, useEffect, useMemo, useRef, useTransition } from "react";
import { CalendarDays, CalendarX, X } from "lucide-react";
import { addClosedDate, importGuimaraesHolidays, removeClosedDates } from "./actions";
import { ClosedDatesYearCalendar } from "./closed-dates-year-calendar";
import type { ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

type ClosedDate = { id: string; date: string; note: string | null };

type Props = {
  closedDates: ClosedDate[];
  closedWeekdays: number[];
};

type ClosedGroup = {
  ids: string[];
  startDate: string;
  endDate: string;
  note: string | null;
};

/** Junta datas consecutivas com o mesmo motivo num único grupo. */
function groupConsecutive(dates: ClosedDate[]): ClosedGroup[] {
  if (dates.length === 0) return [];
  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  const groups: ClosedGroup[] = [];
  let current: ClosedGroup | null = null;

  for (const row of sorted) {
    const note = row.note?.trim() || null;
    const isConsecutive =
      current !== null &&
      current.note === note &&
      isNextDay(current.endDate, row.date);

    if (current && isConsecutive) {
      current.ids.push(row.id);
      current.endDate = row.date;
    } else {
      current = { ids: [row.id], startDate: row.date, endDate: row.date, note };
      groups.push(current);
    }
  }

  return groups;
}

function isNextDay(a: string, b: string): boolean {
  const da = new Date(`${a}T12:00:00`);
  const db = new Date(`${b}T12:00:00`);
  da.setDate(da.getDate() + 1);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

const monthFmt = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "short",
});
const fullFmt = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatGroupLabel(g: ClosedGroup): string {
  const start = new Date(`${g.startDate}T12:00:00`);
  const end = new Date(`${g.endDate}T12:00:00`);
  if (g.startDate === g.endDate) {
    return fullFmt.format(start);
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()} – ${fullFmt.format(end)}`;
  }
  if (sameYear) {
    return `${monthFmt.format(start)} – ${fullFmt.format(end)}`;
  }
  return `${fullFmt.format(start)} – ${fullFmt.format(end)}`;
}

export function ClosedDatesPanel({ closedDates, closedWeekdays }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(addClosedDate, undefined);
  const [importing, startImport] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      toast.success(state.info ?? "Data adicionada.");
    } else if (state?.error) {
      toast.error(state.error, 6000);
    }
  }, [state]);

  const groups = useMemo(() => groupConsecutive(closedDates), [closedDates]);

  return (
    <div className="mt-4 space-y-6">
      <form
        ref={formRef}
        action={formAction}
        className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end"
      >
        <div className="space-y-2">
          <Label htmlFor="closed_date">Data inicial</Label>
          <Input
            id="closed_date"
            name="closed_date"
            type="date"
            required
            className="border-input bg-background text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Data final (opcional)</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            className="border-input bg-background text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Motivo (opcional)</Label>
          <Input
            id="note"
            name="note"
            placeholder="Ex.: Natal, férias da equipa…"
            maxLength={120}
            className="border-input bg-background text-foreground"
          />
        </div>
        <Button
          type="submit"
          disabled={pending}
          variant="outline"
          className="shrink-0 border-border"
        >
          {pending ? "…" : "Adicionar"}
        </Button>
      </form>
      <p className="-mt-3 text-xs text-muted-foreground">
        Para um único dia, deixa a data final vazia. Para um intervalo (ex.: férias),
        preenche ambas — todas as datas do intervalo ficam fechadas.
      </p>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Feriados de Guimarães
          </p>
          <p className="text-xs text-muted-foreground">
            Carrega automaticamente os feriados nacionais e o feriado municipal
            (24 de junho) para {currentYear} e {currentYear + 1}.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={pending || importing}
          className="shrink-0 border-border"
          onClick={() => {
            startImport(async () => {
              const res = await importGuimaraesHolidays();
              if (res?.error) toast.error(res.error, 6000);
              else toast.success(res?.info ?? "Feriados carregados.");
            });
          }}
        >
          <CalendarDays className="size-4" aria-hidden />
          {importing ? "A carregar…" : "Carregar feriados"}
        </Button>
      </div>

      <ClosedDatesYearCalendar
        closedDates={closedDates}
        closedWeekdays={closedWeekdays}
      />

      {groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          Sem datas fechadas. Adiciona acima feriados ou férias.
        </p>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Lista de datas</h3>
          <ul className="flex flex-wrap gap-2">
          {groups.map((g) => {
            const label = formatGroupLabel(g);
            const dayCount = g.ids.length;
            const isRange = dayCount > 1;
            return (
              <li
                key={g.ids[0]}
                className="flex items-center gap-2 rounded-full border border-destructive/25 bg-destructive/5 py-1 pl-3 pr-1 text-sm"
              >
                <CalendarX
                  className="size-3.5 shrink-0 text-destructive"
                  aria-hidden
                />
                <span className="font-medium text-foreground">{label}</span>
                {g.note ? (
                  <span className="max-w-[180px] truncate text-muted-foreground">
                    · {g.note}
                  </span>
                ) : null}
                {isRange ? (
                  <span className="text-xs text-muted-foreground">
                    ({dayCount} dias)
                  </span>
                ) : null}
                <ConfirmDialog
                  title={
                    isRange
                      ? `Remover ${dayCount} datas?`
                      : "Remover esta data?"
                  }
                  description={
                    isRange
                      ? `${label} (${dayCount} dias) volta a ficar disponível para agendamentos.`
                      : `${label} volta a ficar disponível para agendamentos.`
                  }
                  confirmLabel="Remover"
                  tone="destructive"
                  onConfirm={async () => {
                    const res = await removeClosedDates(g.ids);
                    if (res?.error) toast.error(res.error, 6000);
                    else
                      toast.success(
                        isRange
                          ? `${dayCount} datas removidas.`
                          : "Data removida.",
                      );
                  }}
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-6 w-6 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      aria-label={isRange ? "Remover intervalo" : "Remover data"}
                    >
                      <X className="size-3.5" />
                    </Button>
                  }
                />
              </li>
            );
          })}
          </ul>
        </div>
      )}
    </div>
  );
}

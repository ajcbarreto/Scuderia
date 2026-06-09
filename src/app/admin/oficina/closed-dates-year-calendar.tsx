"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import {
  addSingleClosedDate,
  removeClosedDate,
  updateClosedDate,
} from "./actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { WEEKDAY_LABELS, WEEKDAY_SHORT } from "@/lib/garagem/workshop-schedule";
import { cn } from "@/lib/utils";

type ClosedDate = { id: string; date: string; note: string | null };

type Props = {
  closedDates: ClosedDate[];
  closedWeekdays: number[];
};

type ClosedEntry = { note: string | null; id: string };

type SelectedDay = {
  iso: string;
  label: string;
  detail: string;
  closedDateId?: string;
  isWeeklyOnly: boolean;
  canAdd: boolean;
};

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const dateFmt = new Intl.DateTimeFormat("pt-PT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type DayCell = {
  iso: string;
  day: number;
  inMonth: boolean;
};

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: DayCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({ iso: toIso(prevYear, prevMonth, day), day, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: toIso(year, month, day), day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - firstWeekday - daysInMonth + 1;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    cells.push({ iso: toIso(nextYear, nextMonth, day), day, inMonth: false });
  }

  return cells;
}

function describeDay(
  iso: string,
  closedByDate: Map<string, ClosedEntry>,
  closedWeekdays: Set<number>,
  todayIso: string,
): SelectedDay {
  const date = new Date(`${iso}T12:00:00`);
  const weekday = date.getDay();
  const entry = closedByDate.get(iso);
  const isWeeklyClosed = closedWeekdays.has(weekday);
  const isToday = iso === todayIso;

  let detail: string;
  if (entry) {
    detail = entry.note?.trim() || "Dia fechado";
  } else if (isWeeklyClosed) {
    detail = `Fechado — ${WEEKDAY_LABELS[weekday].toLowerCase()}`;
  } else {
    detail = "Oficina aberta";
  }

  if (isToday) {
    detail = `${detail} · Hoje`;
  }

  return {
    iso,
    label: dateFmt.format(date),
    detail,
    closedDateId: entry?.id,
    isWeeklyOnly: isWeeklyClosed && !entry,
    canAdd: !entry && !isWeeklyClosed,
  };
}

function MonthCalendar({
  year,
  month,
  closedByDate,
  closedWeekdays,
  todayIso,
  selectedIso,
  onSelect,
}: {
  year: number;
  month: number;
  closedByDate: Map<string, ClosedEntry>;
  closedWeekdays: Set<number>;
  todayIso: string;
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="mb-2 text-center text-sm font-semibold text-foreground">
        {MONTH_NAMES[month]}
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAY_SHORT.map((label) => (
          <span
            key={label}
            className="py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </span>
        ))}
        {cells.map((cell) => {
          if (!cell.inMonth) {
            return (
              <span
                key={`${cell.iso}-pad`}
                className="aspect-square rounded text-[11px] text-transparent"
                aria-hidden
              />
            );
          }

          const weekday = new Date(`${cell.iso}T12:00:00`).getDay();
          const isWeeklyClosed = closedWeekdays.has(weekday);
          const entry = closedByDate.get(cell.iso);
          const isSpecificClosed = entry !== undefined;
          const isClosed = isSpecificClosed || isWeeklyClosed;
          const isToday = cell.iso === todayIso;
          const isSelected = cell.iso === selectedIso;

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelect(cell.iso)}
              aria-pressed={isSelected}
              aria-label={describeDay(cell.iso, closedByDate, closedWeekdays, todayIso).detail}
              className={cn(
                "flex aspect-square cursor-pointer items-center justify-center rounded text-[11px] tabular-nums transition-colors hover:ring-1 hover:ring-border",
                isClosed
                  ? isSpecificClosed
                    ? "bg-destructive/15 font-semibold text-destructive hover:bg-destructive/20"
                    : "bg-muted font-medium text-muted-foreground hover:bg-muted/80"
                  : "text-foreground hover:bg-muted/50",
                isToday && !isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-card",
                isSelected && "bg-primary/15 font-semibold text-foreground ring-2 ring-primary ring-offset-1 ring-offset-card",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ClosedDatesYearCalendar({
  closedDates,
  closedWeekdays,
}: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const todayIso = useMemo(() => {
    const d = new Date();
    return toIso(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const closedByDate = useMemo(() => {
    const map = new Map<string, ClosedEntry>();
    for (const row of closedDates) {
      if (row.date.startsWith(`${year}-`)) {
        map.set(row.date, { note: row.note, id: row.id });
      }
    }
    return map;
  }, [closedDates, year]);

  const closedWeekdaySet = useMemo(
    () => new Set(closedWeekdays),
    [closedWeekdays],
  );

  const selectedDay = useMemo(() => {
    if (!selectedIso) return null;
    return describeDay(
      selectedIso,
      closedByDate,
      closedWeekdaySet,
      todayIso,
    );
  }, [selectedIso, closedByDate, closedWeekdaySet, todayIso]);

  useEffect(() => {
    if (!selectedIso) {
      setNoteDraft("");
      return;
    }
    const entry = closedByDate.get(selectedIso);
    setNoteDraft(entry?.note?.trim() ?? "");
  }, [selectedIso, closedByDate]);

  const closedCount = closedByDate.size;

  function handleSelect(iso: string) {
    setSelectedIso((prev) => (prev === iso ? null : iso));
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    setSelectedIso(null);
  }

  function handleSave() {
    if (!selectedDay?.closedDateId) return;
    startTransition(async () => {
      const res = await updateClosedDate(selectedDay.closedDateId!, noteDraft);
      if (res?.error) toast.error(res.error, 6000);
      else toast.success(res?.info ?? "Data atualizada.");
    });
  }

  function handleAdd() {
    if (!selectedDay?.canAdd) return;
    startTransition(async () => {
      const res = await addSingleClosedDate(
        selectedDay.iso,
        noteDraft.trim() || null,
      );
      if (res?.error) toast.error(res.error, 6000);
      else toast.success(res?.info ?? "Data adicionada.");
    });
  }

  function handleRemove() {
    if (!selectedDay?.closedDateId) return;
    startTransition(async () => {
      const res = await removeClosedDate(selectedDay.closedDateId!);
      if (res?.error) toast.error(res.error, 6000);
      else {
        toast.success("Data removida.");
        setSelectedIso(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Calendário {year}
          </h3>
          <p className="text-xs text-muted-foreground">
            {closedCount > 0
              ? `${closedCount} ${closedCount === 1 ? "dia fechado" : "dias fechados"} neste ano · clica num dia para editar`
              : "Nenhum dia fechado específico neste ano · clica num dia para editar"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 border-border"
            onClick={() => handleYearChange(year - 1)}
            aria-label="Ano anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-16 border-border font-medium tabular-nums"
            onClick={() => handleYearChange(currentYear)}
            disabled={year === currentYear}
          >
            {year}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 border-border"
            onClick={() => handleYearChange(year + 1)}
            aria-label="Ano seguinte"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {selectedDay ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium capitalize text-foreground">
              {selectedDay.label}
            </p>
            <p className="text-xs text-muted-foreground">{selectedDay.detail}</p>
          </div>

          {selectedDay.closedDateId ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="calendar_note_edit">Motivo</Label>
                <Input
                  id="calendar_note_edit"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Ex.: Natal, férias da equipa…"
                  maxLength={120}
                  className="border-input bg-background text-foreground"
                />
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  className="font-heading"
                  onClick={handleSave}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  {pending ? "A guardar…" : "Guardar"}
                </Button>
                <ConfirmDialog
                  title="Remover esta data?"
                  description={`${selectedDay.label} volta a ficar disponível para agendamentos.`}
                  confirmLabel="Remover"
                  tone="destructive"
                  onConfirm={handleRemove}
                  trigger={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Remover
                    </Button>
                  }
                />
              </div>
            </div>
          ) : selectedDay.canAdd ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="calendar_note_add">Motivo (opcional)</Label>
                <Input
                  id="calendar_note_add"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Ex.: Formação, dia ponte…"
                  maxLength={120}
                  className="border-input bg-background text-foreground"
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={pending}
                className="shrink-0 font-heading"
                onClick={handleAdd}
              >
                <Plus className="size-3.5" aria-hidden />
                {pending ? "A adicionar…" : "Marcar como fechado"}
              </Button>
            </div>
          ) : selectedDay.isWeeklyOnly ? (
            <p className="text-xs text-muted-foreground">
              Este dia está fechado por configuração semanal. Edita na secção
              &quot;Dias semanais fechados&quot; acima.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MONTH_NAMES.map((_, month) => (
          <MonthCalendar
            key={month}
            year={year}
            month={month}
            closedByDate={closedByDate}
            closedWeekdays={closedWeekdaySet}
            todayIso={todayIso}
            selectedIso={selectedIso}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-destructive/15 ring-1 ring-destructive/30" />
          Feriado ou dia fechado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-muted ring-1 ring-border" />
          Fechado (dia da semana)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded ring-2 ring-primary" />
          Hoje
        </span>
      </div>
    </div>
  );
}

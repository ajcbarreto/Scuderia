"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEEKDAY_SHORT } from "@/lib/garagem/workshop-schedule";
import { cn } from "@/lib/utils";

type ClosedDate = { id: string; date: string; note: string | null };

type Props = {
  closedDates: ClosedDate[];
  closedWeekdays: number[];
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

function MonthCalendar({
  year,
  month,
  closedByDate,
  closedWeekdays,
  todayIso,
}: {
  year: number;
  month: number;
  closedByDate: Map<string, string | null>;
  closedWeekdays: Set<number>;
  todayIso: string;
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
          const closedNote = closedByDate.get(cell.iso);
          const isSpecificClosed = closedNote !== undefined;
          const isClosed = isSpecificClosed || isWeeklyClosed;
          const isToday = cell.iso === todayIso;

          const title = isSpecificClosed
            ? closedNote?.trim() || "Dia fechado"
            : isWeeklyClosed
              ? "Fechado (dia da semana)"
              : undefined;

          return (
            <span
              key={cell.iso}
              title={title}
              className={cn(
                "flex aspect-square items-center justify-center rounded text-[11px] tabular-nums",
                isClosed
                  ? isSpecificClosed
                    ? "bg-destructive/15 font-semibold text-destructive"
                    : "bg-muted font-medium text-muted-foreground"
                  : "text-foreground",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-card",
              )}
            >
              {cell.day}
            </span>
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

  const todayIso = useMemo(() => {
    const d = new Date();
    return toIso(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const closedByDate = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const row of closedDates) {
      if (row.date.startsWith(`${year}-`)) {
        map.set(row.date, row.note);
      }
    }
    return map;
  }, [closedDates, year]);

  const closedWeekdaySet = useMemo(
    () => new Set(closedWeekdays),
    [closedWeekdays],
  );

  const closedCount = closedByDate.size;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Calendário {year}
          </h3>
          <p className="text-xs text-muted-foreground">
            {closedCount > 0
              ? `${closedCount} ${closedCount === 1 ? "dia fechado" : "dias fechados"} neste ano`
              : "Nenhum dia fechado específico neste ano"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 border-border"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Ano anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-16 border-border font-medium tabular-nums"
            onClick={() => setYear(currentYear)}
            disabled={year === currentYear}
          >
            {year}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 border-border"
            onClick={() => setYear((y) => y + 1)}
            aria-label="Ano seguinte"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MONTH_NAMES.map((_, month) => (
          <MonthCalendar
            key={month}
            year={year}
            month={month}
            closedByDate={closedByDate}
            closedWeekdays={closedWeekdaySet}
            todayIso={todayIso}
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

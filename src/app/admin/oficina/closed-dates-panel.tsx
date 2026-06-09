"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { CalendarDays } from "lucide-react";
import { addClosedDate, importGuimaraesHolidays } from "./actions";
import { ClosedDatesYearCalendar } from "./closed-dates-year-calendar";
import type { ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

type ClosedDate = { id: string; date: string; note: string | null };

type Props = {
  closedDates: ClosedDate[];
  closedWeekdays: number[];
};

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
    </div>
  );
}

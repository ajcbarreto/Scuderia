"use client";

import { useActionState, useEffect, useRef } from "react";
import { CalendarX, Trash2 } from "lucide-react";
import { addClosedDate, removeClosedDate } from "./actions";
import type { ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

type Props = {
  closedDates: { id: string; date: string; note: string | null }[];
};

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function ClosedDatesPanel({ closedDates }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(addClosedDate, undefined);
  const formRef = useRef<HTMLFormElement | null>(null);

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

      <div className="rounded-lg border border-border/70 bg-muted/20">
        {closedDates.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Sem datas fechadas. Adiciona acima feriados ou férias.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {closedDates.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CalendarX className="size-4 shrink-0 text-destructive" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-medium">{formatDateLabel(d.date)}</p>
                    {d.note ? (
                      <p className="truncate text-xs text-muted-foreground">{d.note}</p>
                    ) : null}
                  </div>
                </div>
                <ConfirmDialog
                  title="Remover esta data?"
                  description={`${formatDateLabel(d.date)} volta a ficar disponível para agendamentos.`}
                  confirmLabel="Remover"
                  tone="destructive"
                  onConfirm={async () => {
                    const res = await removeClosedDate(d.id);
                    if (res?.error) toast.error(res.error, 6000);
                    else toast.success("Data removida.");
                  }}
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Remover data"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
